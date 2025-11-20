import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function GET() {
  try {
    await connectDB();
    const exams = await Exam.find({})
      .populate('courseId', 'name category level')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.courseId || !body.questions || body.questions.length === 0) {
      return NextResponse.json(
        { error: 'Title, courseId, and questions are required' },
        { status: 400 }
      );
    }

    // Calculate totalScore from questions if not provided
    if (!body.totalScore && body.questions) {
      body.totalScore = body.questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);
    }

    const exam = await Exam.create(body);
    const populatedExam = await Exam.findById(exam._id).populate('courseId', 'name category level');
    
    return NextResponse.json(populatedExam, { status: 201 });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create exam' },
      { status: 500 }
    );
  }
}







