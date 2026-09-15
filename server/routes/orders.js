import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { protect, sellerOnly, optionalAuth } from '../middleware/auth.js';
import { route, owner, cartScope, text, address, id, fail, money } from '../lib/validation.js';
import { prepareItems, priceOrder, reserve, release, statuses, orderProgress } from '../lib/checkout.js';

const router = express.Router();
const present = order => ({ ...order.toObject(), fulfillmentStatus: orderProgress(order) });
router.get('/seller/mine', protect, sellerOnly, route(async (req, res) => {
  const orders = await Order.find({ 'fulfillments.seller': req.user._id }).sort({ createdAt: -1 });
  res.json(orders.map(order => {
    const items = order.items.filter(item => String(item.seller) === String(req.user._id));
    const subtotal = money(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    return {
      _id: order._id, createdAt: order.createdAt, items, subtotal,
      totalAmount: money(subtotal * (order.subtotal ? order.totalAmount / order.subtotal : 1)),
      paymentMethod: order.paymentMethod, status: order.status,
      deliveryAddress: order.deliveryAddress,
      fulfillment: order.fulfillments.find(group => String(group.seller) === String(req.user._id)),
    };
  }));
}));
router.put('/:id/fulfillment', protect, sellerOnly, route(async (req, res) => {
  const order = await Order.findById(id(req.params.id, 'order'));
  const group = order?.fulfillments.find(item => String(item.seller) === String(req.user._id));
  if (!group) fail('Order not found or not assigned to you', 404);
  const status = req.body.status;
  const currentIndex = statuses.indexOf(group.status);
  if (status !== group.status && statuses[currentIndex + 1] !== status) fail('Move the order forward one step at a time');
  if (group.status === 'delivered') fail('This delivery is already complete', 409);
  const partner = {
    name: text(req.body.deliveryPartner?.name, 'delivery partner name', 100),
    phone: text(req.body.deliveryPartner?.phone, 'delivery partner phone', 10),
  };
  if (partner.phone && !/^[6-9]\d{9}$/.test(partner.phone)) fail('Enter a valid delivery partner phone');
  if (Boolean(partner.name) !== Boolean(partner.phone)) fail('Provide both the delivery partner name and phone');
  let estimatedDeliveryAt = null;
  if (req.body.estimatedDeliveryAt) {
    estimatedDeliveryAt = new Date(req.body.estimatedDeliveryAt);
    if (Number.isNaN(estimatedDeliveryAt.getTime()) || estimatedDeliveryAt < new Date()) fail('Choose an estimated delivery time in the future');
  }
  const update = { $set: {
    'fulfillments.$[group].status': status,
    'fulfillments.$[group].deliveryPartner': partner,
    'fulfillments.$[group].estimatedDeliveryAt': estimatedDeliveryAt,
  } };
  if (status !== group.status) update.$push = { 'fulfillments.$[group].history': { status, at: new Date() } };
  const updated = await Order.findOneAndUpdate({ _id: order._id, fulfillments: { $elemMatch: { _id: group._id, status: group.status } } }, update, {
    arrayFilters: [{ 'group._id': group._id }], new: true, runValidators: true,
  });
  if (!updated) fail('Order changed. Refresh and try again.', 409);
  res.json({ success: true });
}));
router.post('/', optionalAuth, route(async (req, res) => {
  const scope = owner(req);
  const checkoutKey = text(req.body.checkoutKey, 'checkout reference', 100, true);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey)) fail('Invalid checkout reference');
  const existing = await Order.findOne({ checkoutKey });
  if (existing) {
    const sameOwner = req.user ? String(existing.user) === String(req.user._id) : !existing.user && existing.sessionId === scope.sessionId;
    if (!sameOwner) fail('Invalid checkout reference', 409);
    return res.json(present(existing));
  }
  const deliveryAddress = address(req.body.deliveryAddress);
  const { lines, fulfillments } = await prepareItems(req.body.items);
  const totals = await priceOrder(lines, req.body.couponCode);
  const reservations = [];
  let order;
  try {
    await reserve(lines, reservations);
    order = await Order.create({
      ...scope, checkoutKey, items: lines, fulfillments, ...totals, deliveryAddress,
      paymentMethod: 'cod', status: 'created',
    });
  } catch (error) {
    await release(reservations);
    if (error.code === 11000) {
      const duplicate = await Order.findOne({ checkoutKey, ...scope });
      if (duplicate) return res.json(present(duplicate));
    }
    throw error;
  }
  // The order remains successful even if clearing the cart must be retried.
  await Cart.updateOne({ sessionId: cartScope(req) }, { $set: { items: [] } }).catch(() => {});
  res.status(201).json(present(order));
}));
router.get('/:sessionId', optionalAuth, route(async (req, res) => {
  res.json((await Order.find(owner(req)).sort({ createdAt: -1 })).map(present));
}));
export default router;
