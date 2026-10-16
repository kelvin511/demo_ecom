import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import { catalogService } from './services/catalogService.js';
import { cartService } from './services/cartService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for debugging & visibility
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint (for Docker Desktop & orchestrators)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    catalogSize: catalogService.getAllProducts().length,
    service: 'demo-ecom-backend'
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

// Interactive API Dashboard & Documentation at root URL
app.get('/', (req, res) => {
  const products = catalogService.getAllProducts();
  const cart = cartService.getCart('default-cart');

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Local Commerce Backend - Cart API Validation</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --success: #22c55e;
      --error: #ef4444;
      --border: #334155;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 2rem;
      line-height: 1.5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0 0 0.5rem 0;
      color: var(--accent);
      font-size: 1.8rem;
    }
    p {
      color: var(--text-muted);
      margin: 0.25rem 0;
    }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #0369a1;
      color: #e0f2fe;
    }
    .badge.success { background: #15803d; color: #dcfce7; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1.25rem;
    }
    .card h2 {
      font-size: 1.1rem;
      margin-top: 0;
      color: var(--accent);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    th, td {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    th { color: var(--text-muted); }
    code {
      font-family: monospace;
      background: #090d16;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: #f43f5e;
    }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    .method {
      font-weight: bold;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .method.get { background: #0284c7; }
    .method.post { background: #16a34a; }
    .method.delete { background: #dc2626; }
    pre {
      background: #090d16;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🛒 Local Commerce Backend</h1>
      <p>Purpose: Storefront pre-release verification & Cart API invalid quantity rejection testbed</p>
      <div style="margin-top: 0.75rem;">
        <span class="badge success">● System Active</span>
        <span class="badge">Docker Desktop Ready</span>
        <span class="badge">Synthetic Catalog Loaded</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Target Cart Endpoint Under Test</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/api/cart/items</code>
        </div>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">
          Validates item quantities before modifying the cart. Rejects invalid quantities with 400 Bad Request or 422 Unprocessable Entity while strictly preserving cart state.
        </p>
        <h3 style="font-size: 0.95rem; margin-top: 1rem; color: #cbd5e1;">4 Verified Quantity Scenarios:</h3>
        <ul style="font-size: 0.85rem; padding-left: 1.2rem; color: var(--text-muted);">
          <li><strong>Case 1:</strong> Negative Quantity (e.g. <code>-1</code>) &rarr; HTTP 400</li>
          <li><strong>Case 2:</strong> Zero Quantity (<code>0</code>) &rarr; HTTP 400</li>
          <li><strong>Case 3:</strong> Non-numeric / Invalid Type (e.g. <code>"abc"</code>, <code>1.5</code>) &rarr; HTTP 400</li>
          <li><strong>Case 4:</strong> Exceeding Inventory (e.g. <code>9999</code>) &rarr; HTTP 422</li>
        </ul>
      </div>

      <div class="card">
        <h2>Resettable Cart State</h2>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/cart</code>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/api/cart/reset</code>
        </div>
        <pre>${JSON.stringify(cart, null, 2)}</pre>
      </div>
    </div>

    <div class="card" style="margin-bottom: 2rem;">
      <h2>Synthetic Products Catalog (${products.length} Products)</h2>
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>SKU</th>
            <th>Title</th>
            <th>Price</th>
            <th>Stock Limit</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p) => `
            <tr>
              <td><code>${p.id}</code></td>
              <td>${p.sku}</td>
              <td><strong>${p.name}</strong></td>
              <td>$${p.price.toFixed(2)}</td>
              <td><span style="color: ${p.stock < 10 ? '#f59e0b' : '#10b981'}; font-weight: bold;">${p.stock} units</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
  `);
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start Server if run directly
let serverInstance = null;
if (process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🛍️  Commerce Backend running on http://localhost:${PORT}`);
    console.log(`📦 Synthetic catalog loaded: ${catalogService.getAllProducts().length} items`);
    console.log(`🔄 Cart API ready for quantity rejection validation`);
    console.log(`=======================================================`);
  });
}

export { app, serverInstance };
