import express from 'express';
import User from '../models/User.js';
import { protect, sellerOnly } from '../middleware/auth.js';
import { route, text, image, id, fail } from '../lib/validation.js';

const router = express.Router();
router.put('/me', protect, sellerOnly, route(async (req, res) => {
  const sellerProfile = {
    name: text(req.body.name, 'store name', 100, true),
    logo: image(req.body.logo),
    description: text(req.body.description, 'store description', 1000),
  };
  const user = await User.findByIdAndUpdate(req.user._id, { $set: { sellerProfile } }, { new: true, runValidators: true });
  res.json(user);
}));
router.get('/:id', route(async (req, res) => {
  const seller = await User.findOne({ _id: id(req.params.id), role: 'seller' }).select('name sellerProfile createdAt');
  if (!seller) fail('Seller not found', 404);
  res.json(seller);
}));
export default router;
