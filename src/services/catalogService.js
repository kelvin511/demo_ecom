import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productsFilePath = join(__dirname, '..', 'data', 'products.json');

class CatalogService {
  constructor() {
    this.products = [];
    this.loadProducts();
  }

  loadProducts() {
    try {
      const rawData = readFileSync(productsFilePath, 'utf8');
      this.products = JSON.parse(rawData);
    } catch (err) {
      console.error('Failed to load products from file:', err);
      this.products = [];
    }
  }

  getAllProducts() {
    return this.products;
  }

  getProductById(id) {
    if (!id) return null;
    return this.products.find((p) => p.id === id || p.sku === id) || null;
  }

  checkStock(productId, quantity) {
    const product = this.getProductById(productId);
    if (!product) {
      return { available: false, error: 'ProductNotFound', message: `Product ${productId} not found` };
    }

    if (quantity > product.stock) {
      return {
        available: false,
        error: 'InsufficientStock',
        message: `Requested quantity (${quantity}) exceeds available stock for "${product.name}" (${product.stock} available).`,
        availableStock: product.stock,
        requestedQuantity: quantity
      };
    }

    return { available: true, stock: product.stock, product };
  }
}

export const catalogService = new CatalogService();
