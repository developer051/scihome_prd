import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Registration from '@/models/Registration';
import Course from '@/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const enrollment = await Enrollment.findById(params.id)
      .populate('studentId', 'name email phone username gradeLevel school photo')
      .populate('courseId', 'name description category level price schedule image duration');
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลการลงทะเบียน' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(enrollment);
  } catch (error: any) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { status, enrollmentDate, notes, studentId, courseId } = body;
    
    // ค้นหา enrollment
    const enrollment = await Enrollment.findById(params.id);
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลการลงทะเบียน' },
        { status: 404 }
      );
    }
    
    // ตรวจสอบว่า studentId เปลี่ยนและมีอยู่จริง
    if (studentId && studentId !== enrollment.studentId.toString()) {
      const student = await Registration.findById(studentId);
      if (!student) {
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลนักเรียน' },
          { status: 404 }
        );
      }
      enrollment.studentId = studentId;
    }
    
    // ตรวจสอบว่า courseId เปลี่ยนและมีอยู่จริง
    if (courseId && courseId !== enrollment.courseId.toString()) {
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลคอร์ส' },
          { status: 404 }
        );
      }
      
      // ตรวจสอบว่ามีการลงทะเบียนซ้ำหรือไม่ (ถ้าเปลี่ยน courseId)
      const existingEnrollment = await Enrollment.findOne({
        studentId: enrollment.studentId,
        courseId: courseId,
        _id: { $ne: params.id },
      });
      
      if (existingEnrollment) {
        return NextResponse.json(
          { error: 'นักเรียนได้ลงทะเบียนคอร์สนี้ไปแล้ว' },
          { status: 400 }
        );
      }
      
      enrollment.courseId = courseId;
    }
    
    // อัปเดตข้อมูล
    if (status !== undefined) {
      enrollment.status = status;
    }
    
    if (enrollmentDate !== undefined) {
      enrollment.enrollmentDate = enrollmentDate ? new Date(enrollmentDate) : null;
    }
    
    if (notes !== undefined) {
      enrollment.notes = notes;
    }
    
    await enrollment.save();
    
    // Populate ข้อมูลก่อนส่งกลับ
    await enrollment.populate('studentId', 'name email phone username gradeLevel school photo');
    await enrollment.populate('courseId', 'name description category level price schedule image duration');
    
    return NextResponse.json({
      message: 'อัปเดตข้อมูลการลงทะเบียนสำเร็จ',
      enrollment: enrollment,
    });
    
  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    
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
      { error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const enrollment = await Enrollment.findByIdAndDelete(params.id);
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลการลงทะเบียน' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'ลบข้อมูลการลงทะเบียนสำเร็จ',
    });
    
  } catch (error: any) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    );
  }
}

