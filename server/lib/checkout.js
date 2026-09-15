import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { selection } from './products.js';
import { fail, id, number, money, text } from './validation.js';

export async function prepareItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) fail('Your cart must contain 1 to 100 items');
  const merged = new Map();
  for (const entry of items) {
    const productId = id(entry.product, 'product');
    const variantId = entry.variantId ? id(entry.variantId, 'option') : '';
    const key = productId + ':' + variantId;
    const quantity = number(entry.quantity, 'quantity', 1, 999, true);
    const previous = merged.get(key);
    merged.set(key, { productId, variantId, quantity: (previous?.quantity || 0) + quantity });
  }
  const lines = [];
  const groups = new Map();
  for (const entry of merged.values()) {
    number(entry.quantity, 'quantity', 1, 999, true);
    const product = await Product.findById(entry.productId).populate('seller', 'name sellerProfile');
    const option = selection(product, entry.variantId);
    if (option.stock != null && option.stock < entry.quantity) fail('Not enough stock for ' + product.name, 409);
    const seller = product.seller?._id;
    const key = String(seller || 'store');
    if (!groups.has(key)) groups.set(key, {
      seller, name: product.seller?.sellerProfile?.name || product.seller?.name || 'FreshDash',
      status: 'confirmed', history: [{ status: 'confirmed', at: new Date() }],
    });
    lines.push({
      product: product._id, seller, name: product.name, image: product.image,
      variantId: option.variantId, unit: option.unit, price: option.price,
      quantity: entry.quantity, trackedStock: option.stock != null,
    });
  }
  return { lines, fulfillments: [...groups.values()] };
}
export async function priceOrder(lines, code) {
  const subtotal = money(lines.reduce((sum, item) => sum + item.price * item.quantity, 0));
  let discountAmount = 0;
  let couponCode = '';
  if (code) {
    couponCode = text(code, 'coupon code', 40, true).toUpperCase();
    const coupon = await Coupon.findOne({ code: couponCode, active: true });
    if (!coupon) fail('Invalid or expired coupon');
    discountAmount = Math.round(subtotal * coupon.discountPercent / 100);
  }
  return { subtotal, discountAmount, totalAmount: money(Math.max(0, subtotal - discountAmount)), couponCode };
}
export async function reserve(lines, reservations) {
  for (const line of lines) {
    const filter = { _id: line.product, archived: { $ne: true }, inStock: true };
    const increments = { soldCount: line.quantity };
    if (line.variantId) {
      filter.variants = { $elemMatch: { _id: line.variantId, stock: { $gte: line.quantity }, price: line.price } };
      increments['variants.$.stock'] = -line.quantity;
      increments.stock = -line.quantity;
    } else {
      filter['variants.0'] = { $exists: false };
      filter.price = line.price;
      if (line.trackedStock) {
        filter.stock = { $gte: line.quantity };
        increments.stock = -line.quantity;
      } else filter.stock = null;
    }
    const updated = await Product.updateOne(filter, { $inc: increments });
    if (!updated.modifiedCount) fail(line.name + ' changed or sold out. Refresh your cart and try again.', 409);
    reservations.push(line);
  }
}
export async function release(reservations) {
  for (const line of reservations) {
    const filter = { _id: line.product };
    const increments = { soldCount: -line.quantity };
    if (line.variantId) {
      filter['variants._id'] = line.variantId;
      increments['variants.$.stock'] = line.quantity;
      increments.stock = line.quantity;
    } else if (line.trackedStock) increments.stock = line.quantity;
    await Product.updateOne(filter, { $inc: increments });
  }
}
export const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
export function orderProgress(order) {
  if (!order.fulfillments?.length) return 'unavailable';
  return statuses[Math.min(...order.fulfillments.map(group => statuses.indexOf(group.status)))];
}
