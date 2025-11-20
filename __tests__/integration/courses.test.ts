import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { GET as getCourses, POST as createCourse, mockCourses } from '@/app/api/courses/route';

describe('Integration | /api/courses', () => {
  let mongoServer: MongoMemoryServer;

  const buildPostRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/courses', {
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
    await Course.deleteMany({});
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

  it('ควร seed คอร์ส mock เมื่อฐานข้อมูลว่าง', async () => {
    const response = await getCourses();
    const courses = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(courses)).toBe(true);
    expect(courses.length).toBe(mockCourses.length);
    expect(courses[0]).toHaveProperty('name');
    expect(await Course.countDocuments()).toBe(mockCourses.length);
  });

  it('ควรสร้างคอร์สใหม่เมื่อ POST ด้วยข้อมูลถูกต้อง', async () => {
    const payload = {
      name: 'คอร์สทดสอบเลข ม.4',
      description: 'คอร์สสำหรับการทดสอบระบบ',
      category: 'คณิตศาสตร์',
      level: 'ม.4',
      price: 1234,
      schedule: 'เสาร์ 09:00-12:00',
      image: 'https://example.com/course.png',
      duration: '3 เดือน',
      maxStudents: 15,
      isOnline: true,
      isOnsite: false,
      lessons: [
        {
          title: 'บทที่ 1',
          description: 'เนื้อหาแรก',
          order: 1,
          subLessons: [
            { title: 'ย่อย 1', description: 'รายละเอียด', order: 1, duration: '60 นาที' },
          ],
        },
      ],
    };

    const request = buildPostRequest(payload);
    const response = await createCourse(request);
    const course = await response.json();

    expect(response.status).toBe(201);
    expect(course.name).toBe(payload.name);
    expect(await Course.countDocuments()).toBe(1);
  });
});

