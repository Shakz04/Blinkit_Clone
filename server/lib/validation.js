import mongoose from 'mongoose';

export function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
export const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
export function text(value, label, max = 200, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail(`Enter a valid ${label}`);
  return value.trim();
}
export function number(value, label, min = 0, max = 10000000, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) fail(`Enter a valid ${label}`);
  return value;
}
export function id(value, label = 'ID') {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) fail(`Invalid ${label}`);
  return value;
}
export function image(value) {
  if (!value) return '';
  if (typeof value !== 'string' || value.length > 700000) fail('Images must be under 500 KB');
  if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && value.length < 2048) return value;
  } catch { /* Invalid URLs use the same readable validation message. */ }
  fail('Use a PNG, JPEG or WebP image, or a valid image URL');
}
export function images(value, max = 6) {
  if (!Array.isArray(value) || value.length > max) fail(`Choose up to ${max} images`);
  return value.filter(Boolean).map(image);
}
export function address(value) {
  if (!value || typeof value !== 'object') fail('Delivery address is required');
  const result = Object.fromEntries(['name', 'phone', 'address', 'city', 'pincode'].map(key => [key, text(value[key], key, key === 'address' ? 300 : 100, true)]));
  if (!/^[6-9]\d{9}$/.test(result.phone)) fail('Enter a valid 10-digit Indian mobile number');
  if (!/^[1-9]\d{5}$/.test(result.pincode)) fail('Enter a valid 6-digit pincode');
  return result;
}
export function session(value) {
  if (typeof value !== 'string' || !/^sess_[A-Za-z0-9_-]{8,100}$/.test(value)) fail('Invalid shopping session');
  return value;
}
export function owner(req) {
  return req.user ? { user: req.user._id } : { sessionId: session(req.params.sessionId || req.body.sessionId), user: null };
}
export function cartScope(req) {
  return req.user ? `user_${req.user._id}` : session(req.params.sessionId || req.body.sessionId);
}
export const money = value => Math.round(value * 100) / 100;
export const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
