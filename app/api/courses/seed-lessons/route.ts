import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

// Import mockCourses from route.ts

export async function POST(request: NextRequest) {
  try {
    console.log('Starting seed-lessons API...');
    await connectDB();
    
    // ดึงข้อมูลหลักสูตรทั้งหมด
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses in database`);
    
    // สร้าง map ของ lessons ตามชื่อหลักสูตร
    const lessonsMap = new Map();
    
    // ใช้ข้อมูลจาก route.ts โดยการ import
    const routeModule = await import('../route');
    const { mockCourses } = routeModule;
    
    console.log(`Loaded ${mockCourses.length} mock courses`);
    
    // สร้าง map จาก mockCourses
    mockCourses.forEach((mockCourse: any) => {
      if (mockCourse.lessons && mockCourse.lessons.length > 0) {
        lessonsMap.set(mockCourse.name, mockCourse.lessons);
        console.log(`Added lessons for: ${mockCourse.name} (${mockCourse.lessons.length} lessons)`);
      }
    });
    
    console.log(`Lessons map size: ${lessonsMap.size}`);
    
    // อัปเดต lessons ให้กับหลักสูตรทั้งหมด
    const updatePromises = courses.map(async (course) => {
      if (!course.lessons || course.lessons.length === 0) {
        const lessons = lessonsMap.get(course.name);
        if (lessons && lessons.length > 0) {
          console.log(`Updating lessons for course: ${course.name}`);
          await Course.findByIdAndUpdate(course._id, {
            $set: { lessons: lessons }
          });
          return { name: course.name, updated: true };
        } else {
          console.log(`No lessons found for course: ${course.name}`);
        }
      } else {
        console.log(`Course ${course.name} already has ${course.lessons.length} lessons`);
      }
      return { name: course.name, updated: false };
    });
    
    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter(r => r.updated).length;
    
    console.log(`Seed completed. Updated ${updatedCount} courses.`);
    
    return NextResponse.json({
      message: `Lessons data seeded successfully. Updated ${updatedCount} courses.`,
      results: results,
      totalCourses: courses.length,
      updatedCount: updatedCount
    });
  } catch (error: any) {
    console.error('Error seeding lessons:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to seed lessons', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

