import { mkdirSync, copyFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const deliverablesDir = join(rootDir, 'deliverables');
const zipPath = join(rootDir, 'deliverables.zip');

console.log('\n===============================================================');
console.log('📦 PACKAGING POST-DEMO DELIVERABLES');
console.log('===============================================================\n');

// 1. Clean previous run if present
if (existsSync(deliverablesDir)) {
  rmSync(deliverablesDir, { recursive: true, force: true });
}
if (existsSync(zipPath)) {
  rmSync(zipPath, { force: true });
}
mkdirSync(deliverablesDir, { recursive: true });

// 2. Run tests to generate fresh test execution log
console.log('⏳ Running validation suite to record test artifacts...');
let testOutput = '';
try {
  testOutput = execSync('npx newman run postman/cart-api-validation.postman_collection.json -e postman/cart-api-validation.postman_environment.json', {
    cwd: rootDir,
    encoding: 'utf8'
  });
} catch (err) {
  testOutput = err.stdout || err.message;
}

// 3. Populate deliverables matching Mercor naming conventions
const files = [
  {
    src: join(rootDir, 'src', 'data', 'products.json'),
    destName: 'input 1 - synthetic_products.json'
  },
  {
    src: join(rootDir, 'postman', 'cart-api-validation.postman_collection.json'),
    destName: 'artifact 1 - cart_api_validation.postman_collection.json'
  },
  {
    src: join(rootDir, 'tests', 'cart-validation.http'),
    destName: 'artifact 2 - cart_validation_suite.http'
  },
  {
    content: testOutput,
    destName: 'artifact 3 - test_suite_execution_log.txt'
  },
  {
    src: join(rootDir, 'FINDINGS.md'),
    destName: 'final output 1 - cart_quantity_rejection_findings_report.md'
  }
];

files.forEach(file => {
  const destPath = join(deliverablesDir, file.destName);
  if (file.src) {
    copyFileSync(file.src, destPath);
  } else if (file.content) {
    writeFileSync(destPath, file.content, 'utf8');
  }
  console.log(`  ✓ Created: ${file.destName}`);
});

// 4. Create deliverables.zip
console.log('\n🗜️  Compressing into deliverables.zip...');
try {
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${deliverablesDir}\\*' -DestinationPath '${zipPath}' -Force"`, { cwd: rootDir });
  } else {
    execSync(`zip -j '${zipPath}' '${deliverablesDir}'/*`, { cwd: rootDir });
  }
  console.log(`  ✓ Archive created successfully: deliverables.zip`);
} catch (zipErr) {
  console.error('Failed to create zip automatically:', zipErr.message);
}

console.log('\n===============================================================');
console.log('🎉 ALL DELIVERABLES GENERATED & PACKAGED FOR UPLOAD');
console.log('===============================================================\n');
