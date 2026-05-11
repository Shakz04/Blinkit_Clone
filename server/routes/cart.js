import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// Helper to get or create cart
const getOrCreateCart = async (sessionId) => {
  let cart = await Cart.findOne({ sessionId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }
  return cart;
};

// Get cart
router.get('/:sessionId', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.params.sessionId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/:sessionId/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let cart = await Cart.findOne({ sessionId: req.params.sessionId });
    if (!cart) cart = await Cart.create({ sessionId: req.params.sessionId, items: [] });

    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    cart.updatedAt = new Date();
    await cart.save();

    cart = await Cart.findById(cart._id).populate('items.product');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item quantity
router.put('/:sessionId/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });

    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    const updated = await Cart.findById(cart._id).populate('items.product');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:sessionId/items/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    cart.updatedAt = new Date();
    await cart.save();

    const updated = await Cart.findById(cart._id).populate('items.product');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/:sessionId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    if (!cart) return res.json({ items: [], message: 'Cart already empty' });

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
