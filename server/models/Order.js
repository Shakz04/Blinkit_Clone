import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  variantId: String,
  unit: String,
  image: String,
});

const orderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, sparse: true, unique: true },
  razorpayPaymentId: String,
  sessionId: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  checkoutKey: { type: String, sparse: true, unique: true },
  paymentMethod: { type: String, default: 'cod' },
  subtotal: Number,
  discountAmount: { type: Number, default: 0 },
  couponCode: String,
  fulfillments: [{
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    status: { type: String, enum: ['confirmed', 'preparing', 'out_for_delivery', 'delivered'], default: 'confirmed' },
    history: [{ status: String, at: { type: Date, default: Date.now } }],
    deliveryPartner: { name: String, phone: String },
    estimatedDeliveryAt: Date,
  }],
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created',
  },
  deliveryAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
