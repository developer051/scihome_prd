import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, courseId } = body;
    
    // ตรวจสอบว่ามี userId และ courseId หรือไม่
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ userId และ courseId' },
        { status: 400 }
      );
    }
    
    // ค้นหาข้อมูลผู้ใช้
    const user = await Registration.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      );
    }
    
    // ค้นหาข้อมูลคอร์ส
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลคอร์ส' },
        { status: 404 }
      );
    }
    
    // ตรวจสอบว่ามีการลงทะเบียนคอร์สนี้ไปแล้วหรือไม่
    const existingEnrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId,
    });
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'คุณได้สมัครคอร์สนี้ไปแล้ว' },
        { status: 400 }
      );
    }
    
    // สร้าง enrollment record ใหม่
    const enrollment = await Enrollment.create({
      studentId: userId,
      courseId: courseId,
      status: 'pending', // ตั้งเป็น pending เพื่อให้ admin อนุมัติ
      enrolledAt: new Date(),
    });
    
    // Populate ข้อมูลก่อนส่งกลับ
    await enrollment.populate('studentId', 'name email phone username gradeLevel school photo');
    await enrollment.populate('courseId', 'name description category level price schedule image duration');
    
    return NextResponse.json({
      message: 'สมัครเรียนสำเร็จ รอการอนุมัติจาก admin',
      enrollment: enrollment,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Enrollment error:', error);
    
    // จัดการ error จาก MongoDB (เช่น duplicate key)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'คุณได้สมัครคอร์สนี้ไปแล้ว' },
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
      { error: error.message || 'เกิดข้อผิดพลาดในการสมัครเรียน' },
      { status: 500 }
    );
  }
}

