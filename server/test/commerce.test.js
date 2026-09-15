import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import { address, escapeRegex, image } from '../lib/validation.js';
import { provisionFreshDashStore } from '../lib/defaultStore.js';

let mongo, server, dataDir, base;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const shipping = { name: 'Test Customer', phone: '9876543210', address: '12 Test Street', city: 'Bengaluru', pincode: '560001' };
const logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lN8AAAAASUVORK5CYII=';
async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(base + path, {
    method, headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
async function account(name, role = 'user') {
  const result = await request('/auth/register', { method: 'POST', body: { name, email: randomUUID() + '@example.com', password: 'Testing123!', role } });
  assert.equal(result.status, 201);
  return result.data;
}
const productBody = overrides => ({ name: 'Farm Apples', category: 'Fruits', brand: 'Test Farm', description: 'Fresh apples.', ingredients: 'Apples', nutrition: '52 kcal per 100 g', price: 50, originalPrice: 100, unit: '500 g', stock: 20, inStock: true, images: [logo], variants: [], ...overrides });
async function createProduct(seller, overrides = {}) {
  const result = await request('/products', { token: seller.token, method: 'POST', body: productBody(overrides) });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  return result.data;
}
before(async () => {
  process.env.JWT_SECRET = randomUUID();
  dataDir = await mkdtemp(join(tmpdir(), 'freshdash-test-'));
  const portProbe = createServer();
  await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
  const port = portProbe.address().port;
  await new Promise(resolve => portProbe.close(resolve));
  let startError;
  mongo = spawn(process.env.MONGOD_BINARY || 'mongod', ['--dbpath', dataDir, '--bind_ip', '127.0.0.1', '--port', String(port), '--quiet'], { stdio: 'ignore', windowsHide: true });
  mongo.on('error', error => { startError = error; });
  const deadline = Date.now() + 25000;
  while (true) {
    if (startError) throw startError;
    if (mongo.exitCode !== null) throw new Error('Isolated test MongoDB could not start');
    try { await mongoose.connect('mongodb://127.0.0.1:' + port + '/freshdash_test', { serverSelectionTimeoutMS: 500 }); break; }
    catch (error) { if (Date.now() > deadline) throw error; await pause(100); }
  }
  await Promise.all([User, Product, Order, Review, Cart, Coupon].map(model => model.init()));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});
after(async () => {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await mongoose.disconnect();
  if (mongo && mongo.exitCode === null) { mongo.kill(); await new Promise(resolve => { mongo.once('exit', resolve); setTimeout(resolve, 5000).unref(); }); }
  if (dataDir) {
    // Cleanup is restricted to the exact temporary directory created by this test.
    assert.equal(dirname(resolve(dataDir)), resolve(tmpdir()));
    assert.ok(basename(dataDir).startsWith('freshdash-test-'));
    await rm(dataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  }
});
test('validation rejects malformed addresses and unsafe image types', () => {
  assert.throws(() => address({ ...shipping, phone: '123' }));
  assert.throws(() => image('javascript:alert(1)'));
  assert.throws(() => image('data:image/svg+xml;base64,PHN2Zz4='));
  assert.equal(new RegExp(escapeRegex('a[b].*')).test('a[b].*'), true);
});
test('seller, customer, stock, review and delivery workflows', async t => {
  const seller = await account('Alice Farm', 'seller');
  const seller2 = await account('Bob Market', 'seller');
  const buyer = await account('Test Customer');
  const stranger = await account('Another Customer');
  let apples, bread, order;

  await t.test('store profile is public while account information stays private', async () => {
    const updated = await request('/sellers/me', { token: seller.token, method: 'PUT', body: { name: 'Green Orchard', logo, description: 'Fruit from our farm.' } });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.password, undefined);
    const profile = await request('/sellers/' + seller._id);
    assert.equal(profile.data.sellerProfile.name, 'Green Orchard');
    assert.equal(profile.data.sellerProfile.logo, logo);
    assert.equal(profile.data.email, undefined);
    assert.equal(profile.data.addresses, undefined);
    assert.equal((await request('/sellers/me', { token: buyer.token, method: 'PUT', body: { name: 'Fake Store' } })).status, 403);
  });
  await t.test('sellers publish options, photos, nutrition and stock with ownership checks', async () => {
    apples = await createProduct(seller, { variants: [{ label: '500 g', price: 50, stock: 10 }, { label: '1 kg', price: 90, stock: 4 }] });
    bread = await createProduct(seller2, { name: 'Sourdough bread', brand: 'Test Bakery', category: 'Bakery', price: 80, originalPrice: 100 });
    assert.equal(apples.seller.sellerProfile.name, 'Green Orchard');
    assert.equal(apples.variants.length, 2);
    assert.equal((await request('/products', { token: buyer.token, method: 'POST', body: productBody({}) })).status, 403);
    assert.equal((await request('/products/' + apples._id, { token: seller2.token, method: 'PUT', body: { ...apples, inStock: true } })).status, 404);
    assert.equal((await request('/products/' + apples._id, { token: buyer.token, method: 'DELETE' })).status, 403);
    const detail = await request('/products/' + apples._id);
    assert.equal(detail.data.nutrition, '52 kcal per 100 g');
    assert.equal(detail.data.images.length, 1);
    assert.equal(detail.data.seller.email, undefined);
  });
  await t.test('catalog filters, pagination and price sorting work together', async () => {
    const filtered = await request('/products?seller=' + seller._id + '&brand=Test%20Farm&minPrice=40&maxPrice=60&minDiscount=25&availability=in');
    assert.equal(filtered.status, 200);
    assert.equal(filtered.data.total, 1);
    const sorted = await request('/products?sort=price_desc&limit=1');
    assert.equal(sorted.data.products[0]._id, bread._id);
    assert.equal(sorted.data.pages, 2);
    assert.equal((await request('/products?search=%5B.*')).data.total, 0);
    assert.equal((await request('/products?minPrice=200&maxPrice=10')).status, 400);
    assert.equal((await request('/products?sort=__proto__')).status, 400);
  });
  await t.test('customer profile and address book persist without changing account role', async () => {
    const updated = await request('/auth/me', { token: buyer.token, method: 'PUT', body: { name: 'Updated Customer', email: buyer.email, phone: shipping.phone, role: 'seller' } });
    assert.equal(updated.data.role, 'user');
    assert.equal(updated.data.name, 'Updated Customer');
    const home = await request('/auth/addresses', { token: buyer.token, method: 'POST', body: { ...shipping, label: 'Home' } });
    assert.equal(home.data.addresses[0].isDefault, true);
    const work = await request('/auth/addresses', { token: buyer.token, method: 'POST', body: { ...shipping, label: 'Work', isDefault: true } });
    assert.equal(work.data.addresses.filter(entry => entry.isDefault).length, 1);
    const edited = await request('/auth/addresses/' + work.data.addresses[1]._id, { token: buyer.token, method: 'PUT', body: { ...shipping, label: 'Office', isDefault: true } });
    assert.equal(edited.data.addresses[1].label, 'Office');
    assert.equal((await request('/auth/addresses/' + work.data.addresses[1]._id, { token: stranger.token, method: 'DELETE' })).status, 404);
    assert.equal((await request('/auth/addresses', { token: buyer.token, method: 'POST', body: { ...shipping, pincode: 'bad' } })).status, 400);
    const removed = await request('/auth/addresses/' + work.data.addresses[1]._id, { token: buyer.token, method: 'DELETE' });
    assert.equal(removed.data.addresses.length, 1);
    assert.equal(removed.data.addresses[0].isDefault, true);
  });
  await t.test('guest cart merges once and an account cart is shared across browser sessions', async () => {
    const guest = 'sess_' + randomUUID();
    const added = await request('/cart/' + guest + '/items', { method: 'POST', body: { productId: apples._id, variantId: apples.variants[0]._id, quantity: 2 } });
    assert.equal(added.status, 200);
    assert.equal((await request('/cart/' + guest + '/items', { method: 'POST', body: { productId: apples._id, quantity: 1 } })).status, 400);
    assert.equal((await request('/cart/' + guest + '/items', { method: 'POST', body: { productId: apples._id, variantId: apples.variants[0]._id, quantity: 999 } })).status, 409);
    assert.equal((await request('/cart/' + guest + '/items', { method: 'POST', body: { productId: bread._id, quantity: -1 } })).status, 400);
    await request('/cart/session/items', { token: buyer.token, method: 'POST', body: { productId: bread._id, quantity: 1 } });
    const merged = await request('/cart/merge', { token: buyer.token, method: 'POST', body: { sessionId: guest } });
    assert.equal(merged.data.items.length, 2);
    const again = await request('/cart/merge', { token: buyer.token, method: 'POST', body: { sessionId: guest } });
    assert.equal(again.data.items.find(item => item.product._id === apples._id).quantity, 2);
    const otherDevice = await request('/cart/sess_' + randomUUID(), { token: buyer.token });
    assert.equal(otherDevice.data.items.length, 2);
    assert.equal((await request('/cart/user_' + buyer._id)).status, 400);
    assert.equal((await request('/cart/' + guest)).data.items.length, 0);
  });
  await t.test('checkout calculates prices and coupons on the server and separates sellers', async () => {
    await Coupon.create({ code: 'TEST10', discountPercent: 10 });
    const key = randomUUID();
    const body = {
      checkoutKey: key, deliveryAddress: shipping, totalAmount: 1, couponCode: 'TEST10',
      items: [{ product: apples._id, variantId: apples.variants[0]._id, quantity: 2, price: 1 }, { product: bread._id, quantity: 1 }],
    };
    const placed = await request('/orders', { token: buyer.token, method: 'POST', body });
    assert.equal(placed.status, 201, JSON.stringify(placed.data));
    order = placed.data;
    assert.equal(order.totalAmount, 162);
    assert.equal(order.discountAmount, 18);
    assert.equal(order.status, 'created');
    assert.equal(order.fulfillments.length, 2);
    assert.equal(order.fulfillmentStatus, 'confirmed');
    assert.equal((await request('/products/' + apples._id)).data.variants[0].stock, 8);
    assert.equal((await request('/orders', { token: buyer.token, method: 'POST', body })).data._id, order._id);
    assert.equal((await request('/products/' + apples._id)).data.variants[0].stock, 8);
    assert.equal((await request('/orders', { token: stranger.token, method: 'POST', body })).status, 409);
    assert.equal((await request('/orders/sess_' + randomUUID(), { token: buyer.token })).data.length, 1);
    assert.equal((await request('/orders/sess_' + randomUUID(), { token: stranger.token })).data.length, 0);
    const sellerOrders = await request('/orders/seller/mine', { token: seller.token });
    assert.equal(sellerOrders.data[0].items.length, 1);
    assert.equal(sellerOrders.data[0].totalAmount, 90);
    assert.equal(sellerOrders.data[0].items[0].name, apples.name);
    assert.equal((await request('/cart/session', { token: buyer.token })).data.items.length, 0);
    const stale = await request('/products/' + apples._id, { token: seller.token, method: 'PUT', body: { ...apples, inStock: true } });
    assert.equal(stale.status, 409);
  });
  await t.test('order stages enforce seller ownership, sequential updates and independent deliveries', async () => {
    assert.equal((await request('/orders/' + order._id + '/fulfillment', { token: buyer.token, method: 'PUT', body: { status: 'delivered' } })).status, 403);
    const outsider = await account('Other Seller', 'seller');
    assert.equal((await request('/orders/' + order._id + '/fulfillment', { token: outsider.token, method: 'PUT', body: { status: 'preparing' } })).status, 404);
    assert.equal((await request('/orders/' + order._id + '/fulfillment', { token: seller.token, method: 'PUT', body: { status: 'delivered' } })).status, 400);
    for (const status of ['preparing', 'out_for_delivery', 'delivered']) {
      const updated = await request('/orders/' + order._id + '/fulfillment', { token: seller.token, method: 'PUT', body: { status, deliveryPartner: { name: 'Test Driver', phone: '9876543211' }, estimatedDeliveryAt: new Date(Date.now() + 3600000).toISOString() } });
      assert.equal(updated.status, 200, JSON.stringify(updated.data));
    }
    const tracked = (await request('/orders/session', { token: buyer.token })).data[0];
    assert.equal(tracked.fulfillmentStatus, 'confirmed');
    assert.equal(tracked.fulfillments.find(group => group.seller === seller._id).history.length, 4);
    assert.equal(tracked.fulfillments.find(group => group.seller === seller2._id).status, 'confirmed');
    for (const status of ['preparing', 'out_for_delivery', 'delivered']) await request('/orders/' + order._id + '/fulfillment', { token: seller2.token, method: 'PUT', body: { status } });
    assert.equal((await request('/orders/session', { token: buyer.token })).data[0].fulfillmentStatus, 'delivered');
  });
  await t.test('reviews carry verified purchase badges only for delivered purchases and aggregate correctly', async () => {
    const own = await request('/products/' + apples._id + '/reviews', { token: seller.token, method: 'POST', body: { rating: 5, comment: 'My product' } });
    assert.equal(own.status, 403);
    const verified = await request('/products/' + apples._id + '/reviews', { token: buyer.token, method: 'POST', body: { rating: 5, comment: 'Fresh and crisp.', photos: [logo] } });
    assert.equal(verified.status, 201);
    assert.equal(verified.data.verifiedPurchase, true);
    const unverified = await request('/products/' + apples._id + '/reviews', { token: stranger.token, method: 'POST', body: { rating: 3, comment: 'Looks interesting.', verifiedPurchase: true } });
    assert.equal(unverified.data.verifiedPurchase, false);
    assert.equal((await request('/products/' + apples._id)).data.ratingAverage, 4);
    await request('/products/' + apples._id + '/reviews', { token: buyer.token, method: 'POST', body: { rating: 4, comment: 'Updated review.' } });
    const detail = (await request('/products/' + apples._id)).data;
    assert.equal(detail.ratingAverage, 3.5);
    assert.equal(detail.reviewCount, 2);
    assert.equal((await request('/products?minRating=4')).data.total, 0);
    assert.equal((await request('/products/' + apples._id + '/reviews', { token: buyer.token, method: 'POST', body: { rating: 6, comment: 'Invalid' } })).status, 400);
  });
  await t.test('concurrent checkouts cannot oversell and failed baskets release reserved stock', async () => {
    const limited = await createProduct(seller, { name: 'Last basket', stock: 1, price: 10 });
    const attempt = () => request('/orders', { token: buyer.token, method: 'POST', body: { checkoutKey: randomUUID(), deliveryAddress: shipping, items: [{ product: limited._id, quantity: 1 }] } });
    const outcomes = await Promise.all([attempt(), attempt()]);
    assert.deepEqual(outcomes.map(item => item.status).sort(), [201, 409]);
    assert.equal((await Product.findById(limited._id)).stock, 0);
    const beforeStock = (await Product.findById(bread._id)).stock;
    const bad = await request('/orders', { token: buyer.token, method: 'POST', body: { checkoutKey: randomUUID(), deliveryAddress: shipping, items: [{ product: bread._id, quantity: 1 }, { product: limited._id, quantity: 1 }] } });
    assert.equal(bad.status, 409);
    assert.equal((await Product.findById(bread._id)).stock, beforeStock);
  });
  await t.test('guest orders can be claimed once and disappear from the old guest session', async () => {
    const guest = 'sess_' + randomUUID();
    const placed = await request('/orders', { method: 'POST', body: { sessionId: guest, checkoutKey: randomUUID(), deliveryAddress: shipping, items: [{ product: bread._id, quantity: 1 }] } });
    assert.equal(placed.status, 201);
    await request('/cart/merge', { token: stranger.token, method: 'POST', body: { sessionId: guest } });
    assert.equal((await request('/orders/' + guest)).data.length, 0);
    assert.equal((await request('/orders/session', { token: stranger.token })).data[0]._id, placed.data._id);
    await request('/cart/merge', { token: buyer.token, method: 'POST', body: { sessionId: guest } });
    assert.equal((await Order.findById(placed.data._id)).user.toString(), stranger._id);
  });
  await t.test('stock edits and product removal preserve historical orders', async () => {
    const fresh = (await request('/products/' + bread._id)).data;
    const updated = await request('/products/' + bread._id, { token: seller2.token, method: 'PUT', body: { ...fresh, price: 85, stock: 30, inStock: true } });
    assert.equal(updated.status, 200, JSON.stringify(updated.data));
    assert.equal(updated.data.stock, 30);
    assert.equal((await request('/products/' + bread._id, { token: seller.token, method: 'DELETE' })).status, 404);
    assert.equal((await request('/products/' + bread._id, { token: seller2.token, method: 'DELETE' })).status, 200);
    assert.equal((await request('/products/' + bread._id)).status, 404);
    assert.equal((await request('/products?seller=' + seller2._id)).data.total, 0);
    assert.equal((await Order.findById(order._id)).items.find(item => String(item.product) === bread._id).price, 80);
  });
  await t.test('FreshDash setup claims ownerless products and existing tracking records', async () => {
    const ownerless = await Product.create(productBody({ name: 'FreshDash Onions', price: 30, stock: 10 }));
    const legacy = await Order.create({
      checkoutKey: randomUUID(),
      sessionId: 'sess_' + randomUUID(),
      items: [{ product: ownerless._id, name: ownerless.name, price: 30, quantity: 2 }],
      totalAmount: 60,
      deliveryAddress: shipping,
      fulfillments: [{ name: 'FreshDash', status: 'confirmed', history: [{ status: 'confirmed', at: new Date() }] }],
      status: 'created',
    });
    const email = randomUUID() + '@local.invalid';
    const setup = await provisionFreshDashStore({ email, password: 'FreshDashTest123!' });
    assert.equal(setup.assignedProducts, 1);
    assert.equal(setup.migratedOrders, 1);
    assert.equal(setup.createdPassword, 'FreshDashTest123!');
    assert.equal(String((await Product.findById(ownerless._id)).seller), String(setup.seller._id));
    const migrated = await Order.findById(legacy._id);
    assert.equal(String(migrated.items[0].seller), String(setup.seller._id));
    assert.equal(String(migrated.fulfillments[0].seller), String(setup.seller._id));
    const rerun = await provisionFreshDashStore({ email, password: 'ShouldNotReplace123!' });
    assert.equal(rerun.assignedProducts, 0);
    assert.equal(rerun.createdPassword, '');
    const stored = await User.findById(setup.seller._id).select('+password');
    assert.equal(await stored.matchPassword('FreshDashTest123!'), true);
    assert.equal(await stored.matchPassword('ShouldNotReplace123!'), false);
  });
});
