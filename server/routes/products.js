import express from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protect, sellerOnly } from '../middleware/auth.js';
import { route, text, number, id, images, fail, escapeRegex } from '../lib/validation.js';
import { productData, present } from '../lib/products.js';

const router = express.Router();
const sellerFields = 'name sellerProfile';
router.post('/', protect, sellerOnly, route(async (req, res) => {
  const product = await Product.create({ ...productData(req.body), seller: req.user._id });
  res.status(201).json(present(await product.populate('seller', sellerFields)));
}));
router.get('/seller/mine', protect, sellerOnly, route(async (req, res) => {
  res.json((await Product.find({ seller: req.user._id, archived: { $ne: true } }).sort({ createdAt: -1 })).map(present));
}));
router.get('/categories', route(async (req, res) => {
  res.json((await Product.distinct('category', { archived: { $ne: true } })).sort());
}));
router.get('/', route(async (req, res) => {
  const q = req.query;
  const filter = { archived: { $ne: true } };
  if (q.seller) filter.seller = id(q.seller, 'seller');
  if (q.category && q.category !== 'all') filter.category = text(q.category, 'category', 80);
  if (q.search) {
    const search = new RegExp(escapeRegex(text(q.search, 'search', 150)), 'i');
    filter.$or = [{ name: search }, { description: search }, { brand: search }];
  }
  const brands = await Product.distinct('brand', filter);
  if (q.brand) filter.brand = text(q.brand, 'brand', 80);
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = number(Number(q.minPrice), 'minimum price');
    if (q.maxPrice) filter.price.$lte = number(Number(q.maxPrice), 'maximum price');
    if (filter.price.$gte > filter.price.$lte) fail('Minimum price cannot exceed maximum price');
  }
  if (q.minRating) filter.ratingAverage = { $gte: number(Number(q.minRating), 'rating', 0, 5) };
  if (q.minDiscount) filter.discount = { $gte: number(Number(q.minDiscount), 'discount', 0, 100) };
  const stockCondition = { inStock: true, $or: [
    { 'variants.0': { $exists: true }, variants: { $elemMatch: { stock: { $gt: 0 } } } },
    { 'variants.0': { $exists: false }, $or: [{ stock: null }, { stock: { $gt: 0 } }] },
  ] };
  if (q.availability === 'in') filter.$and = [stockCondition];
  else if (q.availability === 'out') filter.$nor = [stockCondition];
  else if (q.availability && q.availability !== 'all') fail('Invalid availability filter');
  const sorts = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { ratingAverage: -1, reviewCount: -1 }, popular: { soldCount: -1 }, discount: { discount: -1 } };
  const sort = q.sort || 'newest';
  if (!Object.hasOwn(sorts, sort)) fail('Invalid sorting option');
  const page = number(Number(q.page || 1), 'page', 1, 100000, true);
  const limit = number(Number(q.limit || 24), 'page size', 1, 60, true);
  const [products, total] = await Promise.all([
    Product.find(filter).select('-images -ingredients -nutrition').populate('seller', sellerFields).sort({ ...sorts[sort], _id: 1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products: products.map(present), total, page, pages: Math.max(1, Math.ceil(total / limit)), brands: brands.filter(Boolean).sort() });
}));
router.put('/:id', protect, sellerOnly, route(async (req, res) => {
  const product = await Product.findOne({ _id: id(req.params.id), seller: req.user._id, archived: { $ne: true } });
  if (!product) fail('Product not found or not owned by you', 404);
  const data = productData(req.body, product);
  const expectedUpdatedAt = new Date(req.body.updatedAt);
  if (Number.isNaN(expectedUpdatedAt.getTime())) fail('Reload the product before editing');
  if (data.originalPrice === undefined) delete data.originalPrice;
  // Optimistic concurrency prevents a seller edit overwriting stock reserved by checkout.
  const updated = await Product.findOneAndUpdate({ _id: product._id, updatedAt: expectedUpdatedAt }, { $set: data, ...(data.originalPrice === undefined ? { $unset: { originalPrice: 1 } } : {}) }, { new: true, runValidators: true });
  if (!updated) fail('Stock changed while saving. Reload the product and try again.', 409);
  res.json(present(updated));
}));
router.delete('/:id', protect, sellerOnly, route(async (req, res) => {
  const product = await Product.findOneAndUpdate({ _id: id(req.params.id), seller: req.user._id, archived: { $ne: true } }, { $set: { archived: true, inStock: false } }, { new: true });
  if (!product) fail('Product not found or not owned by you', 404);
  res.json({ success: true });
}));
router.get('/:id/reviews', route(async (req, res) => {
  const productId = id(req.params.id);
  const reviews = await Review.find({ product: productId }).populate('user', 'name').sort({ createdAt: -1 }).limit(100);
  res.json(reviews);
}));
router.post('/:id/reviews', protect, route(async (req, res) => {
  const product = await Product.findOne({ _id: id(req.params.id), archived: { $ne: true } });
  if (!product) fail('Product not found', 404);
  if (String(product.seller) === String(req.user._id)) fail('You cannot review your own product', 403);
  const rating = number(req.body.rating, 'rating', 1, 5, true);
  const comment = text(req.body.comment, 'review', 2000, true);
  const photos = images(req.body.photos || [], 3);
  const purchased = await Order.exists({
    user: req.user._id,
    items: { $elemMatch: { product: product._id } },
    fulfillments: { $elemMatch: { seller: product.seller || null, status: 'delivered' } },
  });
  const review = await Review.findOneAndUpdate({ product: product._id, user: req.user._id }, { $set: { rating, comment, photos, verifiedPurchase: Boolean(purchased) } }, { upsert: true, new: true, runValidators: true });
  const [summary] = await Review.aggregate([{ $match: { product: product._id } }, { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await Product.updateOne({ _id: product._id }, { $set: { ratingAverage: summary?.average || 0, reviewCount: summary?.count || 0 } });
  res.status(201).json(await review.populate('user', 'name'));
}));
router.get('/:id', route(async (req, res) => {
  const product = await Product.findOne({ _id: id(req.params.id), archived: { $ne: true } }).populate('seller', sellerFields);
  if (!product) fail('Product not found', 404);
  res.json(present(product));
}));
export default router;
