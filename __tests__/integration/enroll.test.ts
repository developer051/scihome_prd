import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { POST as enrollHandler } from '@/app/api/enroll/route';

describe('Integration | POST /api/enroll', () => {
  let mongoServer: MongoMemoryServer;

  const buildRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/enroll', {
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

  beforeEach(async () => {
    await Promise.all([
      Registration.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      Registration.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
    ]);
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

  const createStudentAndCourse = async () => {
    const student = await Registration.create({
      name: 'Integration Student',
      phone: '0811111111',
      email: 'integration@example.com',
      username: 'integration',
      password: 'hashed-pass',
      dateOfBirth: new Date('2005-02-01'),
      gradeLevel: 'ม.5',
      school: 'Sci High',
      photo: '',
      course: 'Physics',
      message: '',
      status: 'pending',
    });

    const course = await Course.create({
      name: 'Physics Intensive',
      description: 'รายละเอียดคอร์ส',
      category: 'ฟิสิกส์',
      level: 'ม.5',
      price: 4500,
      schedule: 'เสาร์ 09:00-12:00',
      image: 'https://example.com/physics.jpg',
      duration: '4 เดือน',
      maxStudents: 20,
      isOnline: true,
      isOnsite: true,
      lessons: [
        {
          title: 'บทที่ 1',
          description: 'เริ่มต้น',
          order: 1,
          subLessons: [
            { title: 'ย่อย 1', description: 'รายละเอียด', order: 1, duration: '60 นาที' },
          ],
        },
      ],
    });

    return { student, course };
  };

  it('ควรสมัครคอร์สได้สำเร็จเมื่อข้อมูลถูกต้อง', async () => {
    const { student, course } = await createStudentAndCourse();

    const request = buildRequest({
      userId: student._id.toString(),
      courseId: course._id.toString(),
    });

    const response = await enrollHandler(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.message).toBe('สมัครเรียนสำเร็จ รอการอนุมัติจาก admin');
    expect(payload.enrollment.studentId._id).toBe(student._id.toString());
    expect(payload.enrollment.courseId._id).toBe(course._id.toString());
    expect(await Enrollment.countDocuments()).toBe(1);
  });

  it('ควรป้องกันการสมัครคอร์สซ้ำ', async () => {
    const { student, course } = await createStudentAndCourse();
    const requestPayload = {
      userId: student._id.toString(),
      courseId: course._id.toString(),
    };

    const firstResponse = await enrollHandler(buildRequest(requestPayload));
    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await enrollHandler(buildRequest(requestPayload));
    const payload = await duplicateResponse.json();

    expect(duplicateResponse.status).toBe(400);
    expect(payload.error).toBe('คุณได้สมัครคอร์สนี้ไปแล้ว');
    expect(await Enrollment.countDocuments()).toBe(1);
  });
});

