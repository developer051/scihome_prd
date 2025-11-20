import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    const registrations = await Registration.find({}).sort({ createdAt: -1 });
    return NextResponse.json(registrations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting registration process...');
    
    // เชื่อมต่อ MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');
    
    const body = await request.json();
    console.log('Received registration data:', { ...body, password: '***' });
    
    // Validate required fields
    const { name, phone, email, username, password, dateOfBirth, gradeLevel, school, photo, course, courseId, message } = body;
    
    if (!name || !phone || !email || !username || !password || !dateOfBirth || !gradeLevel || !school || !course) {
      console.error('Missing required fields:', { name, phone, email, username, password: !!password, dateOfBirth, gradeLevel, school, course });
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await Registration.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      console.error('Username already exists:', username);
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // สร้าง registration โดยใช้ hashed password
    // ลบ confirmPassword ออกถ้ามี
    const { confirmPassword, ...registrationDataWithoutConfirm } = body;
    
    const registrationData = {
      ...registrationDataWithoutConfirm,
      username: username.toLowerCase(),
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      courseId: courseId || '', // เพิ่ม courseId ถ้ามี
      message: message || '', // รับ message ถ้ามี
      photo: (photo && photo.trim() !== '') ? photo.trim() : '', // ตรวจสอบให้แน่ใจว่า photo เป็น string และไม่ใช่ whitespace เท่านั้น
    };

    console.log('Creating registration in MongoDB...');
    const registration = await Registration.create(registrationData);
    console.log('Registration created successfully:', registration._id);
    
    // ไม่ส่ง password กลับไป
    const { password: _, ...registrationResponse } = registration.toObject();
    
    return NextResponse.json(registrationResponse, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    
    // จัดการ error จาก MongoDB (เช่น duplicate key)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น' },
        { status: 400 }
      );
    }
    
    // จัดการ validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: `Validation Error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create registration' },
      { status: 500 }
    );
  }
}
