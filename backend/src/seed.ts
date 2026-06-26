import 'dotenv/config';
import { connectDB } from './config/db';
import { User, hashPassword } from './models/User';
import { Role } from './types';
import mongoose from 'mongoose';

const PASSWORD = process.env.SEED_PASSWORD || 'Password@123';

const SEED_USERS: Array<{ name: string; email: string; role: Role }> = [
  { name: 'Admin User', email: 'admin@lms.local', role: 'admin' },
  { name: 'Sales Exec', email: 'sales@lms.local', role: 'sales' },
  { name: 'Sanction Exec', email: 'sanction@lms.local', role: 'sanction' },
  { name: 'Disbursement Exec', email: 'disbursement@lms.local', role: 'disbursement' },
  { name: 'Collection Exec', email: 'collection@lms.local', role: 'collection' },
  { name: 'Demo Borrower', email: 'borrower@lms.local', role: 'borrower' },
];

async function main() {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');

  const passwordHash = await hashPassword(PASSWORD);
  for (const u of SEED_USERS) {
    await User.findOneAndUpdate(
      { email: u.email },
      { $set: { ...u, passwordHash } },
      { upsert: true, new: true }
    );
    console.log(`✓ ${u.role.padEnd(13)} ${u.email}`);
  }

  console.log(`\nAll users share the password: ${PASSWORD}\n`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
