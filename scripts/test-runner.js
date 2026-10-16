/**
 * Automated Test Runner for Cart API Invalid Quantity Rejection
 * Validates the four quantity cases and verifies that the cart state is strictly preserved on rejection.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function runTests() {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING CART API QUANTITY REJECTION TEST SUITE');
  console.log(`🌐 Target Base URL: ${BASE_URL}`);
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;
  const results = [];

  function recordResult(testName, passed, details) {
    totalTests++;
    if (passed) passedTests++;
    results.push({ testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${testName}`);
    if (details) {
      console.log(`       └─ ${details}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    recordResult('Backend Service Health Check', healthRes.ok && health.status === 'healthy', `Status: ${health.status}, Catalog Size: ${health.catalogSize}`);

    // 2. Fetch synthetic catalog
    const catalogRes = await fetch(`${BASE_URL}/api/products`);
    const catalogData = await catalogRes.json();
    const targetProduct = catalogData.products.find(p => p.id === 'prod_101');
    recordResult('Fetch Synthetic Products Catalog', catalogRes.ok && targetProduct && targetProduct.stock > 0, `Target product: "${targetProduct.name}" (Stock: ${targetProduct.stock})`);

    // 3. Reset cart to baseline state
    const resetRes = await fetch(`${BASE_URL}/api/cart/reset`, { method: 'POST' });
    const resetData = await resetRes.json();
    recordResult('Reset Cart to Baseline (Resettable Cart)', resetRes.ok && resetData.cart.items.length === 0, `Cart reset: items=${resetData.cart.items.length}, total=${resetData.cart.totalItems}`);

    // Helper to get cart snapshot
    async function getCart() {
      const res = await fetch(`${BASE_URL}/api/cart`);
      const data = await res.json();
      return data.cart;
    }

    const baselineCart = await getCart();

    // =========================================================================
    // CASE 1: Negative Quantity (quantity: -1) on Empty Cart
    // =========================================================================
    console.log('\n--- Case 1: Negative Quantity (Empty Cart) ---');
    const case1Res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: -1 })
    });
    const case1Data = await case1Res.json();
    const case1Cart = await getCart();
    const case1Rejected = case1Res.status === 400 && case1Data.error === 'NegativeQuantity';
    const case1CartUnchanged = JSON.stringify(baselineCart.items) === JSON.stringify(case1Cart.items) && case1Cart.totalItems === 0;

    recordResult('Case 1: HTTP 400 Bad Request on Negative Quantity (-1)', case1Rejected, `HTTP ${case1Res.status} | error: "${case1Data.error}" | msg: "${case1Data.message}"`);
    recordResult('Case 1: Cart strictly unchanged after negative quantity attempt', case1CartUnchanged, `Cart items before: ${baselineCart.items.length}, after: ${case1Cart.items.length}`);

    // =========================================================================
    // CASE 2: Zero Quantity (quantity: 0)
    // =========================================================================
    console.log('\n--- Case 2: Zero Quantity ---');
    const case2Res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: 0 })
    });
    const case2Data = await case2Res.json();
    const case2Cart = await getCart();
    const case2Rejected = case2Res.status === 400 && case2Data.error === 'ZeroQuantity';
    const case2CartUnchanged = JSON.stringify(baselineCart.items) === JSON.stringify(case2Cart.items) && case2Cart.totalItems === 0;

    recordResult('Case 2: HTTP 400 Bad Request on Zero Quantity (0)', case2Rejected, `HTTP ${case2Res.status} | error: "${case2Data.error}" | msg: "${case2Data.message}"`);
    recordResult('Case 2: Cart strictly unchanged after zero quantity attempt', case2CartUnchanged, `Cart items before: ${baselineCart.items.length}, after: ${case2Cart.items.length}`);

    // =========================================================================
    // CASE 3: Non-Numeric / Fractional / Invalid Format
    // =========================================================================
    console.log('\n--- Case 3: Non-Numeric & Non-Integer Types ---');
    const case3aRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: 'invalid_qty' })
    });
    const case3aData = await case3aRes.json();

    const case3bRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: 1.5 })
    });
    const case3bData = await case3bRes.json();

    const case3Cart = await getCart();
    const case3Rejected = case3aRes.status === 400 && case3bRes.status === 400;
    const case3CartUnchanged = JSON.stringify(baselineCart.items) === JSON.stringify(case3Cart.items) && case3Cart.totalItems === 0;

    recordResult('Case 3: HTTP 400 Bad Request on Non-Numeric ("invalid_qty") & Fractional (1.5)', case3Rejected, `String: ${case3aData.error} | Fractional: ${case3bData.error}`);
    recordResult('Case 3: Cart strictly unchanged after non-numeric/fractional attempts', case3CartUnchanged, `Cart items before: ${baselineCart.items.length}, after: ${case3Cart.items.length}`);

    // =========================================================================
    // CASE 4: Exceeding Available Stock Inventory
    // =========================================================================
    console.log('\n--- Case 4: Quantity Exceeding Inventory Stock ---');
    const excessiveQuantity = targetProduct.stock + 1000;
    const case4Res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: excessiveQuantity })
    });
    const case4Data = await case4Res.json();
    const case4Cart = await getCart();
    const case4Rejected = (case4Res.status === 422 || case4Res.status === 400) && case4Data.error === 'InsufficientStock';
    const case4CartUnchanged = JSON.stringify(baselineCart.items) === JSON.stringify(case4Cart.items) && case4Cart.totalItems === 0;

    recordResult(`Case 4: HTTP 422 Unprocessable Entity on Stock Overflow (${excessiveQuantity} > ${targetProduct.stock})`, case4Rejected, `HTTP ${case4Res.status} | error: "${case4Data.error}"`);
    recordResult('Case 4: Cart strictly unchanged after inventory overflow attempt', case4CartUnchanged, `Cart items before: ${baselineCart.items.length}, after: ${case4Cart.items.length}`);

    // =========================================================================
    // POSITIVE CONTROL: Valid Quantity Addition (Populating Cart)
    // =========================================================================
    console.log('\n--- Positive Control: Populating Cart with Valid Quantity (2) ---');
    const validRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: 2 })
    });
    const validData = await validRes.json();
    const populatedCart = await getCart();
    const validPassed = validRes.status === 200 && populatedCart.items.length === 1 && populatedCart.totalItems === 2;

    recordResult('Positive Control: Valid quantity (2) accepted and cart updated', validPassed, `Cart items: ${populatedCart.items.length}, total items: ${populatedCart.totalItems}, subtotal: $${populatedCart.subtotal}`);

    // =========================================================================
    // CASE 1B: Negative Quantity Attempt on Populated Cart
    // =========================================================================
    console.log('\n--- Case 1B: Negative Quantity Attempt on Populated Cart ---');
    const case1bRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: -5 })
    });
    const case1bData = await case1bRes.json();
    const cartAfter1b = await getCart();
    const case1bRejected = case1bRes.status === 400 && case1bData.error === 'NegativeQuantity';
    const case1bCartIntact = cartAfter1b.items.length === 1 && cartAfter1b.totalItems === 2 && cartAfter1b.subtotal === populatedCart.subtotal;

    recordResult('Case 1B: HTTP 400 Bad Request on Negative Qty (-5) on Populated Cart', case1bRejected, `HTTP ${case1bRes.status} | error: "${case1bData.error}"`);
    recordResult('Case 1B: Populated cart integrity strictly preserved (items: 1, count: 2, subtotal: $399.98)', case1bCartIntact, `Original 2 items preserved, subtotal: $${cartAfter1b.subtotal}`);

    // =========================================================================
    // CASE 4B: Stock Overflow on Top of Existing Cart Quantity
    // =========================================================================
    console.log('\n--- Case 4B: Stock Overflow Accounting for Existing Quantity ---');
    // Product stock is 15. Cart already has 2. Requesting 14 makes 16 > 15!
    const case4bRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: targetProduct.id, quantity: 14 })
    });
    const case4bData = await case4bRes.json();
    const cartAfter4b = await getCart();
    const case4bRejected = case4bRes.status === 422 && case4bData.error === 'InsufficientStock';
    const case4bCartIntact = cartAfter4b.items.length === 1 && cartAfter4b.totalItems === 2;

    recordResult('Case 4B: HTTP 422 Unprocessable Entity on Combined Stock Overflow (2 + 14 > 15)', case4bRejected, `HTTP ${case4bRes.status} | error: "${case4bData.error}" | max addable: ${case4bData.details?.maximumAddable}`);
    recordResult('Case 4B: Populated cart integrity strictly preserved', case4bCartIntact, `Cart remained unchanged at ${cartAfter4b.totalItems} items`);

    // =========================================================================
    // CLEANUP / RESET VERIFICATION
    // =========================================================================
    console.log('\n--- Resettable Cart Cleanup ---');
    const finalReset = await fetch(`${BASE_URL}/api/cart/reset`, { method: 'POST' });
    const finalCart = await getCart();
    recordResult('Final Reset: Cart successfully restored to clean state', finalCart.items.length === 0, `Cart items: ${finalCart.items.length}`);

    // SUMMARY
    console.log('\n===============================================================');
    console.log(`📊 TEST EXECUTION SUMMARY: ${passedTests}/${totalTests} PASSED`);
    console.log('===============================================================');

    if (passedTests === totalTests) {
      console.log('🎉 ALL FOUR QUANTITY CASES, EDGE SCENARIOS, AND CART INTEGRITY CHECKS PASSED!\n');
      return true;
    } else {
      console.error('❌ SOME TESTS FAILED!\n');
      return false;
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    return false;
  }
}

// Execute
runTests().then((success) => {
  process.exit(success ? 0 : 1);
});
