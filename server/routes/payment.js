import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';

const router = express.Router();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret
  ? new Razorpay({ key_id: keyId, key_secret: keySecret })
  : null;

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({
      error: 'Payment service not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env',
    });
  }
  try {
    const { amount, sessionId, items, deliveryAddress } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Store order in DB with pending status
    await Order.create({
      razorpayOrderId: order.id,
      sessionId: sessionId || 'guest',
      items: items || [],
      totalAmount: amount,
      deliveryAddress: deliveryAddress || {},
      status: 'created',
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: 'paid',
      }
    );

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Get Razorpay key (for frontend)
router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
});

export default router;
