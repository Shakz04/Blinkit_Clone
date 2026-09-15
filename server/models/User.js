import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['user', 'seller'],
    default: 'user',
  },
  phone: { type: String, default: '' },
  sellerProfile: {
    name: { type: String, default: '' },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  addresses: [{ label: String, name: String, phone: String, address: String, city: String, pincode: String, isDefault: { type: Boolean, default: false } }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
