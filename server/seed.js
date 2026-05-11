import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const products = [
  { name: 'Fresh Tomatoes', price: 45, category: 'Vegetables', unit: '500g', image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200&h=200&fit=crop' },
  { name: 'Onions', price: 30, category: 'Vegetables', unit: '1 kg', image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=200&h=200&fit=crop' },
  { name: 'Potatoes', price: 35, category: 'Vegetables', unit: '1 kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop' },
  { name: 'Carrots', price: 50, category: 'Vegetables', unit: '500g', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop' },
  { name: 'Bananas', price: 60, category: 'Fruits', unit: '1 dozen', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop' },
  { name: 'Apples', price: 120, category: 'Fruits', unit: '1 kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop' },
  { name: 'Oranges', price: 80, category: 'Fruits', unit: '1 kg', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop' },
  { name: 'Milk', price: 55, category: 'Dairy', unit: '1L', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop' },
  { name: 'Curd', price: 40, category: 'Dairy', unit: '400g', image: 'https://images.unsplash.com/photo-1571212515416-d4e44a9169a4?w=200&h=200&fit=crop' },
  { name: 'Butter', price: 55, category: 'Dairy', unit: '100g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop' },
  { name: 'Bread', price: 35, category: 'Bakery', unit: '400g', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' },
  { name: 'Eggs', price: 72, category: 'Bakery', unit: '12 pcs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop' },
  { name: 'Rice', price: 65, category: 'Groceries', unit: '1 kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
  { name: 'Dal', price: 120, category: 'Groceries', unit: '1 kg', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&h=200&fit=crop' },
  { name: 'Cooking Oil', price: 180, category: 'Groceries', unit: '1L', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
  { name: 'Coca Cola', price: 90, category: 'Beverages', unit: '2L', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop' },
  { name: 'Mineral Water', price: 20, category: 'Beverages', unit: '1L', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop' },
  { name: 'Lays Chips', price: 20, category: 'Snacks', unit: '52g', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop' },
  { name: 'Parle-G Biscuits', price: 10, category: 'Snacks', unit: '100g', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop' },
  { name: 'Maggi Noodles', price: 12, category: 'Snacks', unit: '70g', image: 'https://images.unsplash.com/photo-1569718212165-3a24415914dc?w=200&h=200&fit=crop' },
];

const coupons = [
  { code: 'FIRSTORDER', discountPercent: 10 },
  { code: 'ANNIVERSARY', discountPercent: 30 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit');
    await Product.deleteMany({});
    await Product.insertMany(products);
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log(`✓ Seeded ${products.length} products, ${coupons.length} coupons`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
