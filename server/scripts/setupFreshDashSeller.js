import 'dotenv/config';
import mongoose from 'mongoose';
import { provisionFreshDashStore } from '../lib/defaultStore.js';

const resetPassword = process.argv.includes('--reset-password');

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit');
  const result = await provisionFreshDashStore({ resetPassword });
  console.log(`FreshDash seller: ${result.seller.email}`);
  console.log(`Assigned products: ${result.assignedProducts}`);
  console.log(`Migrated orders: ${result.migratedOrders}`);
  if (result.createdPassword) {
    console.log(`Temporary password: ${result.createdPassword}`);
    console.log('Keep this password private. It is shown only because the account was created or reset.');
  } else {
    console.log('The seller account already existed, so its password was not changed.');
  }
} catch (error) {
  console.error(`FreshDash setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
