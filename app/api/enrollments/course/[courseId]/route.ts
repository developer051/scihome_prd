import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Registration from '@/models/Registration';
import Course from '@/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectDB();
    
    // ตรวจสอบว่า courseId มีอยู่จริง
    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลคอร์ส' },
        { status: 404 }
      );
    }
    
    // ดึงข้อมูล enrollment ของคอร์ส
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const query: any = {
      courseId: params.courseId,
    };
    
    if (status) {
      query.status = status;
    }
    
    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'name email phone username gradeLevel school photo dateOfBirth')
      .populate('courseId', 'name description category level price schedule image duration maxStudents isOnline isOnsite')
      .sort({ enrolledAt: -1 });
    
    return NextResponse.json({
      course: {
        _id: course._id,
        name: course.name,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        schedule: course.schedule,
        image: course.image,
        duration: course.duration,
        maxStudents: course.maxStudents,
        isOnline: course.isOnline,
        isOnsite: course.isOnsite,
      },
      enrollments: enrollments,
      total: enrollments.length,
      confirmedCount: enrollments.filter((e: any) => e.status === 'confirmed').length,
    });
    
  } catch (error: any) {
    console.error('Error fetching course enrollments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch course enrollments' },
      { status: 500 }
    );
  }
}

