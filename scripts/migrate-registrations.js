const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';

// Registration Schema (simplified for migration)
const RegistrationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);

async function migrateRegistrations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // อัปเดต documents ที่ไม่มี courseId
    const result = await Registration.updateMany(
      { courseId: { $exists: false } },
      { $set: { courseId: '' } }
    );

    console.log(`\n📊 Migration Results:`);
    console.log(`  - Documents matched: ${result.matchedCount}`);
    console.log(`  - Documents modified: ${result.modifiedCount}`);

    // สร้าง indexes ใหม่
    console.log('\n📇 Creating indexes...');
    
    try {
      await Registration.collection.createIndex({ email: 1 });
      console.log('  ✅ Index created: email');
    } catch (e) {
      console.log('  ⚠️  Index email already exists or error:', e.message);
    }

    try {
      await Registration.collection.createIndex({ status: 1, createdAt: -1 });
      console.log('  ✅ Index created: status + createdAt');
    } catch (e) {
      console.log('  ⚠️  Index status + createdAt already exists or error:', e.message);
    }

    try {
      await Registration.collection.createIndex({ course: 1 });
      console.log('  ✅ Index created: course');
    } catch (e) {
      console.log('  ⚠️  Index course already exists or error:', e.message);
    }

    try {
      await Registration.collection.createIndex({ createdAt: -1 });
      console.log('  ✅ Index created: createdAt');
    } catch (e) {
      console.log('  ⚠️  Index createdAt already exists or error:', e.message);
    }

    console.log('\n✅ Migration completed successfully!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateRegistrations();

