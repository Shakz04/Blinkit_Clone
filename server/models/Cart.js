import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  variantId: { type: String, default: '' },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true, optimisticConcurrency: true });

export default mongoose.model('Cart', cartSchema);
