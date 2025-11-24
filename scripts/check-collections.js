const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';

async function checkCollections() {
  try {
    console.log('🔍 กำลังเชื่อมต่อ MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ!\n');
    
    // ตรวจสอบ collections ทั้งหมด
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📋 Collections ทั้งหมดใน database:');
    if (collections.length === 0) {
      console.log('  ⚠️  ไม่มี collection ใดๆ ใน database');
    } else {
      collections.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.name}`);
      });
    }
    
    // ตรวจสอบว่าไม่มี collection "registrations"
    console.log('\n🔎 กำลังตรวจสอบ collection "registrations"...');
    const hasRegistrations = collections.some(col => col.name === 'registrations');
    
    if (hasRegistrations) {
      console.log('  ❌ พบ collection "registrations" ใน database!');
      const registrationsCollection = db.collection('registrations');
      const count = await registrationsCollection.countDocuments();
      console.log(`  📊 จำนวน documents: ${count}`);
      
      if (count > 0) {
        console.log('\n  ⚠️  มีข้อมูลใน collection "registrations"');
        console.log('  💡 ควรตรวจสอบว่าต้องการย้ายข้อมูลไปยัง collection "studentmanagement" หรือไม่');
      }
    } else {
      console.log('  ✅ ไม่พบ collection "registrations" ใน database');
      console.log('  ✅ ตรงตามที่ต้องการ - ไม่มี collection "registrations"');
    }
    
    // ตรวจสอบ collection "studentmanagement" ที่ใช้จริง
    console.log('\n🔎 กำลังตรวจสอบ collection "studentmanagement"...');
    const hasStudentManagement = collections.some(col => col.name === 'studentmanagement');
    
    if (hasStudentManagement) {
      const studentManagementCollection = db.collection('studentmanagement');
      const count = await studentManagementCollection.countDocuments();
      console.log(`  ✅ พบ collection "studentmanagement"`);
      console.log(`  📊 จำนวน documents: ${count}`);
    } else {
      console.log('  ⚠️  ไม่พบ collection "studentmanagement"');
      console.log('  💡 Collection นี้เป็น collection ที่ใช้จริงตาม model Registration');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ การตรวจสอบเสร็จสมบูรณ์!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

checkCollections();


