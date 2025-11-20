import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { POST as loginHandler } from '@/app/api/auth/login/route';

describe('Integration | POST /api/auth/login', () => {
  let mongoServer: MongoMemoryServer;

  const buildRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

  beforeAll(async () => {
    // เคลียร์ connection cache และปิด connection เก่าก่อน
    if (global.mongoose) {
      global.mongoose = { conn: null, promise: null };
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectDB();
  });

  afterEach(async () => {
    await Registration.deleteMany({});
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('ควรเข้าสู่ระบบได้เมื่อ username และ password ถูกต้อง', async () => {
    const password = 's3cret123';
    await Registration.create({
      name: 'Test User',
      phone: '0812345678',
      email: 'test@example.com',
      username: 'testuser',
      password: await bcrypt.hash(password, 10),
      dateOfBirth: new Date('2005-01-01'),
      gradeLevel: 'ม.4',
      school: 'Sci High',
      photo: '',
      course: 'Physics',
      message: '',
      status: 'pending',
    });

    const request = buildRequest({ username: 'testuser', password });
    const response = await loginHandler(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('เข้าสู่ระบบสำเร็จ');
    expect(payload.user.username).toBe('testuser');
    expect(payload.user).not.toHaveProperty('password');
  });

  it('ควรส่งสถานะ 401 เมื่อรหัสผ่านไม่ถูกต้อง', async () => {
    await Registration.create({
      name: 'Wrong Password User',
      phone: '0812345679',
      email: 'wrong@example.com',
      username: 'wrongpass',
      password: await bcrypt.hash('correct-password', 10),
      dateOfBirth: new Date('2006-05-01'),
      gradeLevel: 'ม.5',
      school: 'Sci High',
      photo: '',
      course: 'Chemistry',
      message: '',
      status: 'pending',
    });

    const request = buildRequest({ username: 'wrongpass', password: 'incorrect' });
    const response = await loginHandler(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  });
});

