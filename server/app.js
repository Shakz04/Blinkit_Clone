import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import paymentRoutes from './routes/payment.js';
import authRoutes from './routes/auth.js';
import couponRoutes from './routes/coupons.js';
import orderRoutes from './routes/orders.js';
import sellerRoutes from './routes/sellers.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sellers', sellerRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Blinkit API is running' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === 'VersionError' ? 409 : ['ValidationError', 'CastError'].includes(error.name) ? 400 : error.code === 11000 ? 409 : 500);
  res.status(status).json({ error: error.name === 'VersionError' ? 'Your cart changed. Refresh and try again.' : status === 500 ? 'Something went wrong. Please try again.' : error.code === 11000 ? 'This record already exists' : error.message });
});
export default app;
