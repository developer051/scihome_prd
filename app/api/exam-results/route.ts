import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamResult from '@/models/ExamResult';
import Registration from '@/models/Registration';
import Exam from '@/models/Exam';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const examId = searchParams.get('examId');
    
    // สร้าง query object
    const query: any = {};
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (examId) {
      query.examId = examId;
    }
    
    // ดึงข้อมูล exam results พร้อม populate ข้อมูลนักเรียนและข้อสอบ
    const examResults = await ExamResult.find(query)
      .populate('studentId', 'name email phone username gradeLevel school photo')
      .populate('examId', 'title description courseId duration totalScore passingScore')
      .sort({ completedAt: -1 });
    
    return NextResponse.json(examResults);
  } catch (error: any) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch exam results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId, examId, score, totalScore, percentage, isPassed, answers, timeSpent } = body;
    
    // ตรวจสอบ required fields
    if (!studentId || !examId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ studentId และ examId' },
        { status: 400 }
      );
    }
    
    if (score === undefined || totalScore === undefined || percentage === undefined || isPassed === undefined) {
      return NextResponse.json(
        { error: 'กรุณาระบุ score, totalScore, percentage และ isPassed' },
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
    
    // ตรวจสอบว่า examId มีอยู่จริง
    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลข้อสอบ' },
        { status: 404 }
      );
    }
    
    // สร้าง exam result ใหม่
    const examResultData: any = {
      studentId: studentId,
      examId: examId,
      score: score,
      totalScore: totalScore,
      percentage: percentage,
      isPassed: isPassed,
      answers: answers || [],
      completedAt: new Date(),
      timeSpent: timeSpent || 0,
    };
    
    const examResult = await ExamResult.create(examResultData);
    
    // Populate ข้อมูลก่อนส่งกลับ
    await examResult.populate('studentId', 'name email phone username gradeLevel school photo');
    await examResult.populate('examId', 'title description courseId duration totalScore passingScore');
    
    return NextResponse.json({
      message: 'บันทึกผลการสอบสำเร็จ',
      examResult: examResult,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Exam result error:', error);
    
    // จัดการ validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: `Validation Error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการบันทึกผลการสอบ' },
      { status: 500 }
    );
  }
}

