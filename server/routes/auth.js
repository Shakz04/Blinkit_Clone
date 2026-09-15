import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { route, text, fail, address, id } from '../lib/validation.js';

const router = express.Router();
const publicUser = user => {
  const data = user.toObject();
  delete data.password;
  return data;
};
const withToken = user => ({ ...publicUser(user), token: jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'blinkit_secret_key', { expiresIn: '7d' }) });
function email(value) {
  const result = text(value, 'email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail('Enter a valid email address');
  return result;
}
router.post('/register', route(async (req, res) => {
  const name = text(req.body.name, 'name', 100, true);
  const normalizedEmail = email(req.body.email);
  const password = text(req.body.password, 'password', 72, true);
  if (password.length < 6) fail('Password must have at least 6 characters');
  const role = req.body.role || 'user';
  if (!['user', 'seller'].includes(role)) fail('Role must be user or seller');
  if (await User.exists({ email: normalizedEmail })) fail('Email already registered');
  const user = await User.create({ name, email: normalizedEmail, password, role });
  res.status(201).json(withToken(user));
}));
router.post('/login', route(async (req, res) => {
  const user = await User.findOne({ email: email(req.body.email) }).select('+password');
  if (typeof req.body.password !== 'string' || !user || !(await user.matchPassword(req.body.password))) fail('Invalid email or password', 401);
  res.json(withToken(user));
}));
router.get('/me', protect, (req, res) => res.json(publicUser(req.user)));
router.put('/me', protect, route(async (req, res) => {
  const name = text(req.body.name, 'name', 100, true);
  const normalizedEmail = email(req.body.email);
  const phone = text(req.body.phone, 'phone', 10);
  if (phone && !/^[6-9]\d{9}$/.test(phone)) fail('Enter a valid 10-digit Indian mobile number');
  if (await User.exists({ email: normalizedEmail, _id: { $ne: req.user._id } })) fail('Email already registered');
  const user = await User.findByIdAndUpdate(req.user._id, { $set: { name, email: normalizedEmail, phone } }, { new: true, runValidators: true });
  res.json(publicUser(user));
}));
router.post('/addresses', protect, route(async (req, res) => {
  if (req.user.addresses.length >= 10) fail('You can save up to 10 addresses');
  const data = { ...address(req.body), label: text(req.body.label || 'Home', 'address label', 30, true), isDefault: req.body.isDefault === true || req.user.addresses.length === 0 };
  if (data.isDefault) req.user.addresses.forEach(item => { item.isDefault = false; });
  req.user.addresses.push(data);
  await req.user.save();
  res.status(201).json(publicUser(req.user));
}));
router.put('/addresses/:id', protect, route(async (req, res) => {
  const entry = req.user.addresses.id(id(req.params.id));
  if (!entry) fail('Address not found', 404);
  const data = { ...address(req.body), label: text(req.body.label || 'Home', 'address label', 30, true), isDefault: req.body.isDefault === true };
  if (data.isDefault) req.user.addresses.forEach(item => { item.isDefault = false; });
  entry.set(data);
  if (!req.user.addresses.some(item => item.isDefault)) req.user.addresses[0].isDefault = true;
  await req.user.save();
  res.json(publicUser(req.user));
}));
router.delete('/addresses/:id', protect, route(async (req, res) => {
  const entry = req.user.addresses.id(id(req.params.id));
  if (!entry) fail('Address not found', 404);
  entry.deleteOne();
  if (req.user.addresses.length && !req.user.addresses.some(item => item.isDefault)) req.user.addresses[0].isDefault = true;
  await req.user.save();
  res.json(publicUser(req.user));
}));
export default router;
