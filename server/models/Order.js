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
});

const orderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, sparse: true, unique: true },
  razorpayPaymentId: String,
  sessionId: String,
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
