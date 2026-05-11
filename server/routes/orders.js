import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Create order (bypass Razorpay - direct place order)
router.post('/', async (req, res) => {
  try {
    const { sessionId, items, totalAmount, deliveryAddress } = req.body;

    if (!items?.length || !totalAmount || totalAmount < 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const order = await Order.create({
      sessionId: sessionId || 'guest',
      items: items.map((i) => ({
        product: i.product,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      totalAmount,
      deliveryAddress: deliveryAddress || {},
      status: 'paid',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by session
router.get('/:sessionId', async (req, res) => {
  try {
    const orders = await Order.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
