import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Ensure lessons array is properly handled with youtubeLink
    const updateData: any = { ...body };
    if (body.lessons !== undefined) {
      // Process lessons to ensure youtubeLink is properly saved
      updateData.lessons = body.lessons.map((lesson: any) => ({
        ...lesson,
        youtubeLink: lesson.youtubeLink || '',
        // Process subLessons to ensure youtubeLink is properly saved
        subLessons: lesson.subLessons?.map((subLesson: any) => ({
          ...subLesson,
          youtubeLink: subLesson.youtubeLink || '',
        })) || [],
      }));
    }
    
    const course = await Course.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Log for debugging
    console.log('Course updated successfully:', {
      courseId: course._id,
      lessonsCount: course.lessons?.length || 0,
      hasYoutubeLinks: course.lessons?.some((l: any) => l.youtubeLink) || false,
    });
    
    return NextResponse.json(course);
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course', details: error.message },
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
    const course = await Course.findByIdAndDelete(params.id);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
