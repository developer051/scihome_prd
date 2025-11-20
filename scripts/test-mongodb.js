const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // ตรวจสอบ collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // ตรวจสอบ registrations collection
    const Registration = mongoose.connection.collection('registrations');
    const count = await Registration.countDocuments();
    console.log(`\n📊 Total registrations: ${count}`);
    
    if (count > 0) {
      const sample = await Registration.findOne();
      console.log('\n📝 Sample registration:');
      console.log(JSON.stringify(sample, null, 2));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();

