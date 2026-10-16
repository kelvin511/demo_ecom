import { catalogService } from './catalogService.js';

class CartService {
  constructor() {
    this.carts = new Map();
    // Initialize default cart
    this.resetCart('default-cart');
  }

  /**
   * Reset cart to an empty, pristine state
   * @param {string} cartId
   * @returns {object} The reset cart object
   */
  resetCart(cartId = 'default-cart') {
    const freshCart = {
      cartId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.carts.set(cartId, freshCart);
    return this.getCart(cartId);
  }

  /**
   * Get current cart by ID
   * @param {string} cartId
   * @returns {object} Cart object
   */
  getCart(cartId = 'default-cart') {
    if (!this.carts.has(cartId)) {
      this.resetCart(cartId);
    }
    // Return a deep copy to prevent unintentional mutation
    return JSON.parse(JSON.stringify(this.carts.get(cartId)));
  }

  /**
   * Validate and add or update item quantity in cart
   * @param {string} cartId
   * @param {object} param1 { productId, quantity }
   * @returns {{ success: boolean, statusCode: number, cart?: object, error?: string, message?: string, details?: any }}
   */
  addItem(cartId = 'default-cart', { productId, quantity }) {
    // 1. Validate Product ID existence in payload
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return {
        success: false,
        statusCode: 400,
        error: 'MissingProductId',
        message: 'The "productId" field is required and must be a non-empty string.',
        received: { productId, quantity }
      };
    }

    // 2. Validate Quantity Type & Format
    // Check missing / null / undefined / non-number (e.g. strings, booleans, objects)
    if (quantity === undefined || quantity === null) {
      return {
        success: false,
        statusCode: 400,
        error: 'MissingQuantity',
        message: 'The "quantity" field is required and must be a valid integer.',
        received: { productId, quantity }
      };
    }

    if (typeof quantity !== 'number' || Number.isNaN(quantity) || !Number.isFinite(quantity)) {
      return {
        success: false,
        statusCode: 400,
        error: 'InvalidQuantityType',
        message: `Quantity must be a valid numeric integer. Received type "${typeof quantity}" with value ${JSON.stringify(quantity)}.`,
        received: { productId, quantity }
      };
    }

    // Check non-integer / fractional values
    if (!Number.isInteger(quantity)) {
      return {
        success: false,
        statusCode: 400,
        error: 'NonIntegerQuantity',
        message: `Quantity must be an integer. Fractional quantities (${quantity}) are not permitted.`,
        received: { productId, quantity }
      };
    }

    // 3. Check Negative Quantity
    if (quantity < 0) {
      return {
        success: false,
        statusCode: 400,
        error: 'NegativeQuantity',
        message: `Quantity cannot be negative. Received ${quantity}.`,
        received: { productId, quantity }
      };
    }

    // 4. Check Zero Quantity
    if (quantity === 0) {
      return {
        success: false,
        statusCode: 400,
        error: 'ZeroQuantity',
        message: 'Quantity must be at least 1. To remove an item from the cart, use DELETE /api/cart/items/:productId.',
        received: { productId, quantity }
      };
    }

    // 5. Verify product exists in synthetic catalog
    const product = catalogService.getProductById(productId);
    if (!product) {
      return {
        success: false,
        statusCode: 404,
        error: 'ProductNotFound',
        message: `Product with ID "${productId}" does not exist in the product catalog.`,
        received: { productId, quantity }
      };
    }

    // 6. Check Stock Availability
    const currentCart = this.getCart(cartId);
    const existingItem = currentCart.items.find((item) => item.productId === productId);
    const existingQuantity = existingItem ? existingItem.quantity : 0;
    const prospectiveTotalQuantity = existingQuantity + quantity;

    if (prospectiveTotalQuantity > product.stock) {
      return {
        success: false,
        statusCode: 422,
        error: 'InsufficientStock',
        message: `Requested quantity (${quantity}) plus existing cart quantity (${existingQuantity}) exceeds available inventory for "${product.name}". Only ${product.stock} available.`,
        details: {
          productId: product.id,
          productName: product.name,
          availableStock: product.stock,
          currentCartQuantity: existingQuantity,
          requestedAddition: quantity,
          maximumAddable: Math.max(0, product.stock - existingQuantity)
        }
      };
    }

    // All validations passed! Now update cart state
    const cart = this.carts.get(cartId);
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].itemTotal = Number((cart.items[itemIndex].quantity * product.price).toFixed(2));
    } else {
      cart.items.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: quantity,
        itemTotal: Number((quantity * product.price).toFixed(2))
      });
    }

    // Recalculate totals
    this.recalculateCart(cart);

    return {
      success: true,
      statusCode: 200,
      message: `Successfully added ${quantity}x "${product.name}" to the cart.`,
      cart: this.getCart(cartId)
    };
  }

  /**
   * Remove item from cart
   */
  removeItem(cartId = 'default-cart', productId) {
    const cart = this.carts.get(cartId);
    if (!cart) return this.resetCart(cartId);

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    this.recalculateCart(cart);

    return {
      success: true,
      removed: cart.items.length < initialLength,
      cart: this.getCart(cartId)
    };
  }

  /**
   * Recalculate cart total items and subtotal
   */
  recalculateCart(cart) {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = Number(cart.items.reduce((sum, item) => sum + item.itemTotal, 0).toFixed(2));
    cart.updatedAt = new Date().toISOString();
  }
}

export const cartService = new CartService();
