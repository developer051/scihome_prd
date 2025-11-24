import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamResult from '@/models/ExamResult';
import Registration from '@/models/Registration';
import Exam from '@/models/Exam';

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
    
    // ดึงข้อมูล exam results ของนักเรียน
    const examResults = await ExamResult.find({ studentId: params.studentId })
      .populate('examId', 'title description courseId duration totalScore passingScore')
      .sort({ completedAt: -1 });
    
    // คำนวณสถิติ
    const totalExams = examResults.length;
    const passedExams = examResults.filter(result => result.isPassed).length;
    const averagePercentage = totalExams > 0
      ? examResults.reduce((sum, result) => sum + result.percentage, 0) / totalExams
      : 0;
    
    // ดึงข้อสอบล่าสุด (5 รายการ)
    const latestExams = examResults.slice(0, 5);
    
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
      examResults: examResults,
      statistics: {
        totalExams: totalExams,
        passedExams: passedExams,
        failedExams: totalExams - passedExams,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
      },
      latestExams: latestExams,
      total: totalExams,
    });
    
  } catch (error: any) {
    console.error('Error fetching student exam results:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student exam results' },
      { status: 500 }
    );
  }
}

