import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/200x200?text=Product',
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  unit: {
    type: String,
    default: '1 pc',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  brand: { type: String, default: '' },
  images: [String],
  ingredients: { type: String, default: '' },
  nutrition: { type: String, default: '' },
  stock: { type: Number, min: 0, default: null },
  variants: [{
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0.01 },
    stock: { type: Number, required: true, min: 0 },
  }],
  archived: { type: Boolean, default: false },
  ratingAverage: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
