import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { route, id, number, session, cartScope, fail } from '../lib/validation.js';
import { selection } from '../lib/products.js';

const router = express.Router();
const populate = { path: 'items.product', populate: { path: 'seller', select: 'name sellerProfile' } };
const getCart = scope => Cart.findOneAndUpdate({ sessionId: scope }, { $setOnInsert: { items: [] } }, { upsert: true, new: true });
const same = (item, productId, variantId) => String(item.product) === productId && (item.variantId || '') === variantId;

router.post('/merge', protect, route(async (req, res) => {
  const guestId = session(req.body.sessionId);
  const scope = 'user_' + req.user._id;
  const cart = await getCart(scope);
  // Removing the guest cart atomically makes repeated login requests idempotent.
  const guest = await Cart.findOneAndDelete({ sessionId: guestId });
  if (guest) {
    try {
      for (const item of guest.items) {
        const product = await Product.findById(item.product);
        let option;
        try { option = selection(product, item.variantId); } catch { continue; }
        const existing = cart.items.find(entry => same(entry, String(item.product), item.variantId || ''));
        const quantity = Math.min((existing?.quantity || 0) + item.quantity, option.stock ?? 999, 999);
        if (quantity < 1) continue;
        if (existing) existing.quantity = quantity;
        else cart.items.push({ product: item.product, variantId: item.variantId || '', quantity });
      }
      await cart.save();
    } catch (error) {
      await Cart.updateOne({ sessionId: guestId }, { $setOnInsert: { items: guest.items } }, { upsert: true });
      throw error;
    }
  }
  await Order.updateMany({ sessionId: guestId, user: null }, { $set: { user: req.user._id }, $unset: { sessionId: 1 } });
  res.json(await cart.populate(populate));
}));
router.use(optionalAuth);
router.get('/:sessionId', route(async (req, res) => res.json(await (await getCart(cartScope(req))).populate(populate))));
router.post('/:sessionId/items', route(async (req, res) => {
  const productId = id(req.body.productId, 'product');
  const variantId = req.body.variantId ? id(req.body.variantId, 'option') : '';
  const quantity = number(req.body.quantity ?? 1, 'quantity', 1, 999, true);
  const product = await Product.findById(productId);
  const option = selection(product, variantId);
  const cart = await getCart(cartScope(req));
  const existing = cart.items.find(item => same(item, productId, variantId));
  const total = (existing?.quantity || 0) + quantity;
  if (total > 999 || (option.stock != null && total > option.stock)) fail('Not enough stock for ' + product.name, 409);
  if (existing) existing.quantity = total;
  else cart.items.push({ product: productId, variantId, quantity });
  await cart.save();
  res.json(await cart.populate(populate));
}));
router.put('/:sessionId/items/:productId', route(async (req, res) => {
  const productId = id(req.params.productId, 'product');
  const variantId = req.body.variantId ? id(req.body.variantId, 'option') : '';
  const quantity = number(req.body.quantity, 'quantity', 1, 999, true);
  const product = await Product.findById(productId);
  const option = selection(product, variantId);
  if (option.stock != null && quantity > option.stock) fail('Not enough stock for ' + product.name, 409);
  const cart = await getCart(cartScope(req));
  const item = cart.items.find(entry => same(entry, productId, variantId));
  if (!item) fail('Item not in cart', 404);
  item.quantity = quantity;
  await cart.save();
  res.json(await cart.populate(populate));
}));
router.delete('/:sessionId/items/:productId', route(async (req, res) => {
  const productId = id(req.params.productId, 'product');
  const variantId = req.query.variantId ? id(req.query.variantId, 'option') : '';
  const cart = await getCart(cartScope(req));
  cart.items = cart.items.filter(item => !same(item, productId, variantId));
  await cart.save();
  res.json(await cart.populate(populate));
}));
router.delete('/:sessionId', route(async (req, res) => {
  res.json(await Cart.findOneAndUpdate({ sessionId: cartScope(req) }, { $set: { items: [] } }, { new: true }) || { items: [] });
}));
export default router;
