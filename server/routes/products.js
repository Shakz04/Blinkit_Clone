import express from 'express';
import Product from '../models/Product.js';
import { protect, sellerOnly } from '../middleware/auth.js';

const router = express.Router();

// Add product (seller only)
router.post('/', protect, sellerOnly, async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, category, unit, discount } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price and category required' });
    }
    const product = await Product.create({
      name,
      description: description || '',
      price,
      originalPrice: originalPrice || undefined,
      image: image || 'https://via.placeholder.com/200x200?text=Product',
      category,
      unit: unit || '1 pc',
      discount: discount || 0,
      seller: req.user._id,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's products
router.get('/seller/mine', protect, sellerOnly, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (with optional category & search filter)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { inStock: true };

    if (category && category !== 'all') {
      filter.category = new RegExp(category, 'i');
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
