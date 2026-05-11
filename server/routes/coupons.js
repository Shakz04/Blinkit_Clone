import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code?.trim()) {
      return res.status(400).json({ error: 'Coupon code required' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon' });
    }

    const discountAmount = amount
      ? Math.round((amount * coupon.discountPercent) / 100)
      : 0;
    const finalAmount = amount ? amount - discountAmount : 0;

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
