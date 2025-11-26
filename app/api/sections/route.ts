import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Section from '@/models/Section';

import Category from '@/models/Category';
import Course from '@/models/Course';

export async function GET() {
  try {
    await connectDB();
    let sections = await Section.find({}).sort({ order: 1 });
    
    // If no sections exist, seed them
    if (sections.length === 0) {
      try {
        // Import and call seed function directly
        const { seedSectionsCategories } = await import('../seed-sections-categories/route');
        await seedSectionsCategories();
        sections = await Section.find({}).sort({ order: 1 });
      } catch (seedError) {
        console.error('Error seeding sections:', seedError);
        // Fallback: try to seed manually
        await seedData();
        sections = await Section.find({}).sort({ order: 1 });
      }
    }
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

async function seedData() {
  // Create Sections
  const sections = await Section.insertMany([
    {
      name: 'คอร์สแพทย์ - วิทย์สุขภาพ',
      description: 'หลักสูตรเตรียมสอบเข้าคณะแพทยศาสตร์และวิทยาศาสตร์สุขภาพ',
      order: 1,
    },
    {
      name: 'คอร์สวิศวะ',
      description: 'หลักสูตรเตรียมสอบเข้าคณะวิศวกรรมศาสตร์',
      order: 2,
    },
    {
      name: 'คอร์ส Upgrade [ม.4, ม.5]',
      description: 'หลักสูตรเสริมความรู้สำหรับนักเรียนชั้นม.4 และ ม.5',
      order: 3,
    },
    {
      name: 'TGAT',
      description: 'หลักสูตรเตรียมสอบ TGAT (Thai General Aptitude Test)',
      order: 4,
    },
    {
      name: 'TPAT',
      description: 'หลักสูตรเตรียมสอบ TPAT (Thai Professional Aptitude Test)',
      order: 5,
    },
    {
      name: 'A-Level',
      description: 'หลักสูตรเตรียมสอบ A-Level',
      order: 6,
    },
  ]);

  // Create Categories
  const section1 = sections[0];
  const section2 = sections[1];
  const section3 = sections[2];
  const section4 = sections[3];
  const section5 = sections[4];
  const section6 = sections[5];

  const categories = await Category.insertMany([
    { name: 'Online', description: 'หลักสูตรออนไลน์', sectionId: section1._id, order: 1 },
    { name: 'Online', description: 'หลักสูตรออนไลน์', sectionId: section2._id, order: 1 },
    { name: 'คอร์ส Upgrade [ม.4]', description: 'หลักสูตรเสริมความรู้สำหรับนักเรียนชั้นม.4', sectionId: section3._id, order: 1 },
    { name: 'คอร์ส Upgrade [ม.5]', description: 'หลักสูตรเสริมความรู้สำหรับนักเรียนชั้นม.5', sectionId: section3._id, order: 2 },
    { name: 'TGAT 1', description: 'TGAT Part 1', sectionId: section4._id, order: 1 },
    { name: 'TGAT 2', description: 'TGAT Part 2', sectionId: section4._id, order: 2 },
    { name: 'TGAT 3', description: 'TGAT Part 3', sectionId: section4._id, order: 3 },
    { name: 'TPAT 1', description: 'TPAT Part 1', sectionId: section5._id, order: 1 },
    { name: 'TPAT 3', description: 'TPAT Part 3', sectionId: section5._id, order: 2 },
    { name: 'A-Level คณิตศาสตร์', description: 'A-Level วิชาคณิตศาสตร์', sectionId: section6._id, order: 1 },
    { name: 'A-Level ฟิสิกส์', description: 'A-Level วิชาฟิสิกส์', sectionId: section6._id, order: 2 },
    { name: 'A-Level เคมี', description: 'A-Level วิชาเคมี', sectionId: section6._id, order: 3 },
    { name: 'A-Level ชีวะวิทยา', description: 'A-Level วิชาชีวะวิทยา', sectionId: section6._id, order: 4 },
    { name: 'A-Level ภาษาไทย', description: 'A-Level วิชาภาษาไทย', sectionId: section6._id, order: 5 },
    { name: 'A-Level สังคมศึกษา', description: 'A-Level วิชาสังคมศึกษา', sectionId: section6._id, order: 6 },
    { name: 'A-Level ภาษาอังกฤษ', description: 'A-Level วิชาภาษาอังกฤษ', sectionId: section6._id, order: 7 },
  ]);

  // Create Courses for Section 3
  const categoryUpgradeM4 = categories.find(cat => cat.name === 'คอร์ส Upgrade [ม.4]');
  const categoryUpgradeM5 = categories.find(cat => cat.name === 'คอร์ส Upgrade [ม.5]');

  const coursesM4 = [];
  if (categoryUpgradeM4) {
    const subjects = [
      { name: 'ฟิสิกส์', term: 'เทอม 1' },
      { name: 'ฟิสิกส์', term: 'เทอม 2' },
      { name: 'ชีวะวิทยา', term: 'เทอม 1' },
      { name: 'ชีวะวิทยา', term: 'เทอม 2' },
      { name: 'เคมี', term: 'เทอม 1' },
      { name: 'เคมี', term: 'เทอม 2' },
    ];

    subjects.forEach((subject) => {
      coursesM4.push({
        name: `${subject.name} [ม.4 ${subject.term}]`,
        description: `หลักสูตร${subject.name} สำหรับนักเรียนชั้นม.4 ${subject.term}`,
        category: subject.name,
        level: 'ม.4',
        sectionId: section3._id,
        categoryId: categoryUpgradeM4._id,
        price: 2500,
        schedule: 'จันทร์-พุธ 17:00-19:00',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        duration: '3 เดือน',
        maxStudents: 30,
        isOnline: true,
        isOnsite: false,
        lessons: [],
      });
    });

    coursesM4.push({
      name: 'Combo Pack 3 วิชา [ม.4]',
      description: 'แพ็ครวม 3 วิชา: ฟิสิกส์ เคมี ชีวะวิทยา สำหรับนักเรียนชั้นม.4',
      category: 'Combo',
      level: 'ม.4',
      sectionId: section3._id,
      categoryId: categoryUpgradeM4._id,
      price: 6500,
      schedule: 'จันทร์-พุธ 17:00-19:00',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      duration: '3 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: false,
      lessons: [],
    });
  }

  const coursesM5 = [];
  if (categoryUpgradeM5) {
    const subjects = [
      { name: 'ฟิสิกส์', term: 'เทอม 1' },
      { name: 'ฟิสิกส์', term: 'เทอม 2' },
      { name: 'ชีวะวิทยา', term: 'เทอม 1' },
      { name: 'ชีวะวิทยา', term: 'เทอม 2' },
      { name: 'เคมี', term: 'เทอม 1' },
      { name: 'เคมี', term: 'เทอม 2' },
    ];

    subjects.forEach((subject) => {
      coursesM5.push({
        name: `${subject.name} [ม.5 ${subject.term}]`,
        description: `หลักสูตร${subject.name} สำหรับนักเรียนชั้นม.5 ${subject.term}`,
        category: subject.name,
        level: 'ม.5',
        sectionId: section3._id,
        categoryId: categoryUpgradeM5._id,
        price: 2500,
        schedule: 'จันทร์-พุธ 17:00-19:00',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        duration: '3 เดือน',
        maxStudents: 30,
        isOnline: true,
        isOnsite: false,
        lessons: [],
      });
    });

    coursesM5.push({
      name: 'Combo Pack 3 วิชา [ม.5]',
      description: 'แพ็ครวม 3 วิชา: ฟิสิกส์ เคมี ชีวะวิทยา สำหรับนักเรียนชั้นม.5',
      category: 'Combo',
      level: 'ม.5',
      sectionId: section3._id,
      categoryId: categoryUpgradeM5._id,
      price: 6500,
      schedule: 'จันทร์-พุธ 17:00-19:00',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      duration: '3 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: false,
      lessons: [],
    });
  }

  const allCourses = [...coursesM4, ...coursesM5];
  if (allCourses.length > 0) {
    await Course.insertMany(allCourses);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const section = await Section.create(body);
    return NextResponse.json(section, { status: 201 });
  } catch (error: any) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section', details: error.message },
      { status: 500 }
    );
  }
}

