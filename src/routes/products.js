import { Router } from 'express';
import { catalogService } from '../services/catalogService.js';

const router = Router();

// GET /api/products - list all synthetic products
router.get('/', (req, res) => {
  const products = catalogService.getAllProducts();
  res.json({
    success: true,
    count: products.length,
    products
  });
});

// GET /api/products/:id - get specific product by ID or SKU
router.get('/:id', (req, res) => {
  const product = catalogService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'ProductNotFound',
      message: `Product with ID "${req.params.id}" was not found.`
    });
  }
  res.json({
    success: true,
    product
  });
});

export default router;
