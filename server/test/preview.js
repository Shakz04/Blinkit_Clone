// Disposable browser preview. Uses a fresh database and never loads server/.env.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { createServer } from 'node:net';
import mongoose from 'mongoose';
import express from 'express';
import app from '../app.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const directory = await mkdtemp(join(tmpdir(), 'freshdash-preview-'));
const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const mongo = spawn(process.env.MONGOD_BINARY || 'mongod', ['--dbpath', directory, '--bind_ip', '127.0.0.1', '--port', String(port), '--quiet'], { stdio: 'ignore', windowsHide: true });
let server;
let stopping = false;
async function cleanup() {
  if (stopping) return;
  stopping = true;
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await mongoose.disconnect();
  if (mongo.exitCode === null) { mongo.kill(); await new Promise(resolve => { mongo.once('exit', resolve); setTimeout(resolve, 4000).unref(); }); }
  if (dirname(resolve(directory)) === resolve(tmpdir()) && basename(directory).startsWith('freshdash-preview-')) await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
}
process.on('SIGINT', () => cleanup().then(() => process.exit()));
process.on('SIGTERM', () => cleanup().then(() => process.exit()));
try {
  await mongoose.connect('mongodb://127.0.0.1:' + port + '/preview', { serverSelectionTimeoutMS: 20000 });
  const seller = await User.create({ name: 'Orchard Seller', email: 'seller@example.com', password: 'Demo123!', role: 'seller', sellerProfile: { name: 'Orchard & Co.', description: 'Seasonal produce, thoughtfully selected. Fresh fruit and vegetables for your everyday table.' } });
  const second = await User.create({ name: 'Bakery Seller', email: 'bakery@example.com', password: 'Demo123!', role: 'seller', sellerProfile: { name: 'Morning Mill', description: 'Your daily bread, baked with care.' } });
  await User.create({ name: 'Demo Customer', email: 'customer@example.com', password: 'Demo123!', role: 'user' });
  const samples = [
    { name: 'Farm Fresh Apples', price: 120, category: 'Fruits', unit: '1 kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=600&fit=crop', variants: [{ label: '500 g', price: 65, stock: 15 }, { label: '1 kg', price: 120, stock: 12 }] },
    { name: 'Sweet Bananas', price: 60, category: 'Fruits', unit: '1 dozen', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop' },
    { name: 'Fresh Carrots', price: 50, category: 'Vegetables', unit: '500 g', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=600&fit=crop' },
    { name: 'Golden Potatoes', price: 35, category: 'Vegetables', unit: '1 kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=600&fit=crop' },
    { name: 'Artisan Sourdough', price: 95, category: 'Bakery', unit: '400 g', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop' },
  ];
  for (const [index, sample] of samples.entries()) await Product.create({
    ...sample, seller: index === 4 ? second._id : seller._id, brand: index === 4 ? 'Morning Mill' : 'Orchard Harvest',
    price: sample.variants ? 65 : sample.price, stock: sample.variants ? 27 : 20,
    images: [sample.image], description: 'Carefully selected for quality and freshness. Store in a cool, dry place and enjoy as part of your everyday meals.',
    ingredients: sample.name, nutrition: 'Nutritional values vary by serving size. See the pack for details.', inStock: true,
  });
  await Coupon.create({ code: 'WELCOME10', discountPercent: 10 });
  const dist = resolve(import.meta.dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(join(dist, 'index.html')));
  server = app.listen(4173, '127.0.0.1', () => console.log('Disposable preview: http://127.0.0.1:4173 (seller@example.com / customer@example.com, password Demo123!)'));
} catch (error) {
  console.error(error.message);
  await cleanup();
  process.exitCode = 1;
}
