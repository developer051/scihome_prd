import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Registration from '@/models/Registration';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    
    // สร้าง query object
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (courseId) {
      query.courseId = courseId;
    }
    
    // ดึงข้อมูล enrollment พร้อม populate ข้อมูลนักเรียนและคอร์ส
    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'name email phone username gradeLevel school photo')
      .populate('courseId', 'name description category level price schedule image duration')
      .sort({ enrolledAt: -1 });
    
    return NextResponse.json(enrollments);
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId, courseId, status, enrollmentDate, notes } = body;
    
    // ตรวจสอบ required fields
    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ studentId และ courseId' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่า studentId มีอยู่จริง
    const student = await Registration.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลนักเรียน' },
        { status: 404 }
      );
    }
    
    // ตรวจสอบว่า courseId มีอยู่จริง
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลคอร์ส' },
        { status: 404 }
      );
    }
    
    // ตรวจสอบว่ามีการลงทะเบียนซ้ำหรือไม่
    const existingEnrollment = await Enrollment.findOne({
      studentId: studentId,
      courseId: courseId,
    });
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'นักเรียนได้ลงทะเบียนคอร์สนี้ไปแล้ว' },
        { status: 400 }
      );
    }
    
    // สร้าง enrollment ใหม่
    const enrollmentData: any = {
      studentId: studentId,
      courseId: courseId,
      enrolledAt: new Date(),
    };
    
    if (status) {
      enrollmentData.status = status;
    }
    
    if (enrollmentDate) {
      enrollmentData.enrollmentDate = new Date(enrollmentDate);
    }
    
    if (notes) {
      enrollmentData.notes = notes;
    }
    
    const enrollment = await Enrollment.create(enrollmentData);
    
    // Populate ข้อมูลก่อนส่งกลับ
    await enrollment.populate('studentId', 'name email phone username gradeLevel school photo');
    await enrollment.populate('courseId', 'name description category level price schedule image duration');
    
    return NextResponse.json({
      message: 'ลงทะเบียนสำเร็จ',
      enrollment: enrollment,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Enrollment error:', error);
    
    // จัดการ error จาก MongoDB (เช่น duplicate key)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'นักเรียนได้ลงทะเบียนคอร์สนี้ไปแล้ว' },
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
      { error: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' },
      { status: 500 }
    );
  }
}

