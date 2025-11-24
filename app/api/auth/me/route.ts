import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // ดึง userId จาก query parameter หรือ header
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ userId' },
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
    
    // ค้นหาคอร์สเรียนทั้งหมดที่ผู้ใช้ลงทะเบียนไว้
    // โดยค้นหาจาก registrations ที่มี username หรือ email เดียวกัน
    const registrations = await Registration.find({
      $or: [
        { username: user.username },
        { email: user.email }
      ]
    }).select('courseId course status createdAt');
    
    // ดึงข้อมูลคอร์สเรียนจาก courseId ทั้งหมด
    // แปลง courseId เป็น ObjectId ถ้าจำเป็น
    const courseIds = registrations
      .map(reg => {
        if (!reg.courseId || reg.courseId.trim() === '') {
          return null;
        }
        // ตรวจสอบว่าเป็น ObjectId ที่ถูกต้องหรือไม่
        if (mongoose.Types.ObjectId.isValid(reg.courseId)) {
          return new mongoose.Types.ObjectId(reg.courseId);
        }
        return null;
      })
      .filter((id): id is mongoose.Types.ObjectId => id !== null);
    
    const courses = courseIds.length > 0 
      ? await Course.find({ _id: { $in: courseIds } })
      : [];
    
    // จัดรูปแบบข้อมูลคอร์สเรียนพร้อมสถานะการลงทะเบียน
    const coursesWithStatus = courses.map(course => {
      const registration = registrations.find(reg => {
        if (!reg.courseId || reg.courseId.trim() === '') {
          return false;
        }
        // เปรียบเทียบ courseId กับ course._id
        try {
          const regCourseId = new mongoose.Types.ObjectId(reg.courseId);
          return regCourseId.toString() === course._id.toString();
        } catch {
          return reg.courseId.toString() === course._id.toString();
        }
      });
      
      return {
        ...course.toObject(),
        registrationStatus: registration?.status || 'pending',
        registeredAt: registration?.createdAt || null,
      };
    });
    
    // สร้าง response โดยไม่รวม password
    const { password: _, ...userResponse } = user.toObject();
    
    return NextResponse.json({
      user: userResponse,
      courses: coursesWithStatus,
      totalCourses: coursesWithStatus.length,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Get user data error:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

