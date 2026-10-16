import { Router } from 'express';
import { cartService } from '../services/cartService.js';

const router = Router();

// GET /api/cart - get current cart state
router.get('/', (req, res) => {
  const cartId = req.query.cartId || 'default-cart';
  const cart = cartService.getCart(cartId);
  res.json({
    success: true,
    cart
  });
});

// POST /api/cart/reset - reset cart to pristine empty state
router.post('/reset', (req, res) => {
  const cartId = req.body?.cartId || req.query.cartId || 'default-cart';
  const cart = cartService.resetCart(cartId);
  res.json({
    success: true,
    message: 'Cart has been successfully reset.',
    cart
  });
});

// DELETE /api/cart - alias for resetting cart
router.delete('/', (req, res) => {
  const cartId = req.body?.cartId || req.query.cartId || 'default-cart';
  const cart = cartService.resetCart(cartId);
  res.json({
    success: true,
    message: 'Cart has been cleared.',
    cart
  });
});

// POST /api/cart/items - Add or update item quantity with strict validation
router.post('/items', (req, res) => {
  const cartId = req.body?.cartId || req.query.cartId || 'default-cart';
  const { productId, quantity } = req.body || {};

  const result = cartService.addItem(cartId, { productId, quantity });

  if (!result.success) {
    return res.status(result.statusCode).json({
      success: false,
      error: result.error,
      message: result.message,
      received: result.received,
      details: result.details
    });
  }

  res.status(result.statusCode).json({
    success: true,
    message: result.message,
    cart: result.cart
  });
});

// DELETE /api/cart/items/:productId - Remove item from cart
router.delete('/items/:productId', (req, res) => {
  const cartId = req.query.cartId || 'default-cart';
  const { productId } = req.params;

  const result = cartService.removeItem(cartId, productId);
  res.json({
    success: true,
    message: result.removed
      ? `Product "${productId}" removed from cart.`
      : `Product "${productId}" was not in cart.`,
    cart: result.cart
  });
});

export default router;
