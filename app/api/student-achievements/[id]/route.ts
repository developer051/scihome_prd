import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentAchievement from '@/models/StudentAchievement';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const achievement = await StudentAchievement.findById(params.id);
    
    if (!achievement) {
      return NextResponse.json({ error: 'Student achievement not found' }, { status: 404 });
    }
    
    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error fetching student achievement:', error);
    return NextResponse.json({ error: 'Failed to fetch student achievement' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const achievement = await StudentAchievement.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!achievement) {
      return NextResponse.json({ error: 'Student achievement not found' }, { status: 404 });
    }
    
    return NextResponse.json(achievement);
  } catch (error: any) {
    console.error('Error updating student achievement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update student achievement' },
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
    const achievement = await StudentAchievement.findByIdAndDelete(params.id);
    
    if (!achievement) {
      return NextResponse.json({ error: 'Student achievement not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Student achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting student achievement:', error);
    return NextResponse.json({ error: 'Failed to delete student achievement' }, { status: 500 });
  }
}



