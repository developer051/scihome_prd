import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const exam = await Exam.findById(params.id)
      .populate('courseId', 'name category level');
    
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Calculate totalScore from questions if questions are updated
    if (body.questions && body.questions.length > 0 && !body.totalScore) {
      body.totalScore = body.questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);
    }

    const exam = await Exam.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('courseId', 'name category level');
    
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    return NextResponse.json(exam);
  } catch (error: any) {
    console.error('Error updating exam:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update exam' },
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
    const exam = await Exam.findByIdAndDelete(params.id);
    
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}







