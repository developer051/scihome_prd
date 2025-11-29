import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentAchievement from '@/models/StudentAchievement';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    
    const query = all ? {} : { isActive: true };
    const achievements = await StudentAchievement.find(query)
      .sort({ order: 1, createdAt: -1 });
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch student achievements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const achievement = await StudentAchievement.create(body);
    return NextResponse.json(achievement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student achievement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student achievement' },
      { status: 500 }
    );
  }
}

