import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const DEFAULT_STORE_EMAIL = 'freshdash.operations@local.invalid';

function temporaryPassword() {
  return `${randomBytes(12).toString('base64url')}!9aA`;
}

function storeName(user) {
  return user.sellerProfile?.name || user.name || 'FreshDash';
}

export async function provisionFreshDashStore({
  email = process.env.FRESHDASH_SELLER_EMAIL || DEFAULT_STORE_EMAIL,
  password = process.env.FRESHDASH_SELLER_PASSWORD,
  resetPassword = false,
} = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  let seller = await User.findOne({ email: normalizedEmail });
  let createdPassword = '';

  if (seller && seller.role !== 'seller') {
    throw new Error(`The FreshDash operations email belongs to a non-seller account: ${normalizedEmail}`);
  }

  if (!seller) {
    createdPassword = password || temporaryPassword();
    seller = await User.create({
      name: 'FreshDash Operations',
      email: normalizedEmail,
      password: createdPassword,
      role: 'seller',
      sellerProfile: {
        name: 'FreshDash',
        description: 'Fresh groceries and everyday essentials, sold directly by FreshDash.',
      },
    });
  } else if (resetPassword) {
    createdPassword = password || temporaryPassword();
    seller.password = createdPassword;
    await seller.save();
  }

  const productResult = await Product.updateMany(
    { seller: null },
    { $set: { seller: seller._id } },
  );

  const products = await Product.find({}).select('_id seller').lean();
  const productSellers = new Map(products.map(product => [String(product._id), product.seller || seller._id]));
  const legacyOrders = await Order.find({
    $or: [
      { items: { $elemMatch: { seller: null } } },
      { fulfillments: { $elemMatch: { seller: null } } },
      { 'fulfillments.0': { $exists: false } },
    ],
  });

  const sellerIds = new Set([String(seller._id)]);
  for (const order of legacyOrders) {
    for (const item of order.items) {
      if (!item.seller) item.seller = productSellers.get(String(item.product)) || seller._id;
      sellerIds.add(String(item.seller));
    }
  }
  const sellers = await User.find({ _id: { $in: [...sellerIds] } }).select('name sellerProfile').lean();
  const sellerNames = new Map(sellers.map(user => [String(user._id), storeName(user)]));

  let migratedOrders = 0;
  for (const order of legacyOrders) {
    if (!order.fulfillments.length) {
      const groups = new Map();
      for (const item of order.items) {
        const key = String(item.seller || seller._id);
        if (!groups.has(key)) groups.set(key, {
          seller: item.seller || seller._id,
          name: sellerNames.get(key) || 'FreshDash',
          status: 'confirmed',
          history: [{ status: 'confirmed', at: order.createdAt || new Date() }],
        });
      }
      order.fulfillments = [...groups.values()];
    } else {
      for (const fulfillment of order.fulfillments) {
        if (!fulfillment.seller) {
          fulfillment.seller = seller._id;
          fulfillment.name = storeName(seller);
        }
      }
    }
    await order.save();
    migratedOrders += 1;
  }

  return {
    seller,
    createdPassword,
    assignedProducts: productResult.modifiedCount,
    migratedOrders,
  };
}
