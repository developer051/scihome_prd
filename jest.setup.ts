process.env.NODE_ENV = 'test';

// เคลียร์ mongoose connection cache เพื่อป้องกันการเชื่อมต่อกับ database จริงระหว่าง test
import mongoose from 'mongoose';

// เคลียร์ global cache
if (global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

// ปิด connection เก่าถ้ามี
if (mongoose.connection.readyState !== 0) {
  mongoose.connection.close();
}

