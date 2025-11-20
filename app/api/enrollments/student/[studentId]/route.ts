import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Registration from '@/models/Registration';
import Course from '@/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await connectDB();
    
    // ตรวจสอบว่า studentId มีอยู่จริง
    const student = await Registration.findById(params.studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลนักเรียน' },
        { status: 404 }
      );
    }
    
    // ดึงข้อมูล enrollment ของนักเรียน
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const query: any = {
      studentId: params.studentId,
    };
    
    if (status) {
      query.status = status;
    }
    
    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'name email phone username gradeLevel school photo')
      .populate('courseId', 'name description category level price schedule image duration isOnline isOnsite')
      .sort({ enrolledAt: -1 });
    
    return NextResponse.json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        username: student.username,
        gradeLevel: student.gradeLevel,
        school: student.school,
        photo: student.photo,
      },
      enrollments: enrollments,
      total: enrollments.length,
    });
    
  } catch (error: any) {
    console.error('Error fetching student enrollments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student enrollments' },
      { status: 500 }
    );
  }
}

