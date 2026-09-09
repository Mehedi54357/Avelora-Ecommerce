import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/avelora_dev';
const ADMIN_EMAIL = (process.env.INITIAL_ADMIN_EMAIL || 'aveloraelegance@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';

async function resetSuperAdmin() {
  console.log('🔄 Connecting to MongoDB:', MONGO_URI.replace(/:([^:@]+)@/, ':****@'));
  await mongoose.connect(MONGO_URI);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed.');
  }

  const usersCollection = db.collection('users');
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const emailsToSeed = Array.from(new Set([ADMIN_EMAIL, 'aveloraelegance@gmail.com', 'admin@avelora.com']));

  for (const email of emailsToSeed) {
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            role: 'SUPER_ADMIN',
            isActive: true,
            passwordHash,
            updatedAt: new Date(),
          },
        },
      );
      console.log(`✅ Updated existing SUPER_ADMIN account: ${email}`);
    } else {
      await usersCollection.insertOne({
        name: 'AVELORA Super Admin',
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✨ Created new SUPER_ADMIN account: ${email}`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 Super Admin Credentials Synchronized Successfully!');
  console.log('📧 Email   : aveloraelegance@gmail.com (and admin@avelora.com)');
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

resetSuperAdmin().catch((err) => {
  console.error('❌ Failed to reset super admin:', err.message);
  process.exit(1);
});
