import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudblitz_enquiry_management';

async function main() {
  await mongoose.connect(MONGO_URI);

  const email = process.env.ADMIN_EMAIL || 'admin@cloudblitz.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.passwordHash = password;
    await existing.save();
    console.log(`Admin updated: ${email}`);
  } else {
    await User.create({ name: 'Admin', email, passwordHash: password, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
