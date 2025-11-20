const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Course = require('../models/Course').default;
const Teacher = require('../models/Teacher').default;
const News = require('../models/News').default;
const Testimonial = require('../models/Testimonial').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function seedData() {
  try {
    // Clear existing data
    await Course.deleteMany({});
    await Teacher.deleteMany({});
    await News.deleteMany({});
    await Testimonial.deleteMany({});

    console.log('Cleared existing data');

    // Seed Courses
    const courses = [
      {
        name: 'คณิตศาสตร์ ม.4-6 (เตรียมสอบเข้ามหาวิทยาลัย)',
        description: 'หลักสูตรคณิตศาสตร์ระดับมัธยมปลายที่ครอบคลุมเนื้อหาทั้งหมดสำหรับการเตรียมสอบเข้ามหาวิทยาลัย เน้นการทำโจทย์และการวิเคราะห์ปัญหา',
        category: 'คณิตศาสตร์',
        level: 'ม.4',
        price: 15000,
        schedule: 'จันทร์-พุธ-ศุกร์ 18:00-20:00',
        image: '/images/course-math.jpg',
        duration: '6 เดือน',
        maxStudents: 15,
        isOnline: true,
        isOnsite: true,
      },
      {
        name: 'ภาษาอังกฤษ TOEIC 600+',
        description: 'หลักสูตรภาษาอังกฤษเพื่อเตรียมสอบ TOEIC เน้นการฟัง การอ่าน และไวยากรณ์ เพื่อให้ได้คะแนน 600 ขึ้นไป',
        category: 'ภาษาอังกฤษ',
        level: 'เตรียมสอบเข้า',
        price: 12000,
        schedule: 'อังคาร-พฤหัสบดี 19:00-21:00',
        image: '/images/course-english.jpg',
        duration: '4 เดือน',
        maxStudents: 20,
        isOnline: true,
        isOnsite: false,
      },
      {
        name: 'ฟิสิกส์ ม.5-6 (PAT2)',
        description: 'หลักสูตรฟิสิกส์สำหรับการสอบ PAT2 ครอบคลุมเนื้อหาทั้งหมดของฟิสิกส์ระดับมัธยมปลาย พร้อมเทคนิคการทำข้อสอบ',
        category: 'ฟิสิกส์',
        level: 'ม.5',
        price: 18000,
        schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
        image: '/images/course-physics.jpg',
        duration: '8 เดือน',
        maxStudents: 12,
        isOnline: false,
        isOnsite: true,
      },
      {
        name: 'เคมี ม.4-6 (PAT2)',
        description: 'หลักสูตรเคมีสำหรับการสอบ PAT2 เน้นการทำความเข้าใจเนื้อหาและการฝึกทำโจทย์ที่หลากหลาย',
        category: 'เคมี',
        level: 'ม.4',
        price: 16000,
        schedule: 'จันทร์-พุธ 17:00-19:00',
        image: '/images/course-chemistry.jpg',
        duration: '6 เดือน',
        maxStudents: 18,
        isOnline: true,
        isOnsite: true,
      },
      {
        name: 'ชีววิทยา ม.4-6 (PAT2)',
        description: 'หลักสูตรชีววิทยาสำหรับการสอบ PAT2 ครอบคลุมเนื้อหาทั้งหมดพร้อมการจำและการทำความเข้าใจ',
        category: 'ชีววิทยา',
        level: 'ม.4',
        price: 14000,
        schedule: 'อังคาร-พฤหัสบดี 18:00-20:00',
        image: '/images/course-biology.jpg',
        duration: '5 เดือน',
        maxStudents: 16,
        isOnline: true,
        isOnsite: true,
      },
      {
        name: 'สังคมศึกษา ม.6 (O-NET)',
        description: 'หลักสูตรสังคมศึกษาสำหรับการสอบ O-NET ครอบคลุมเนื้อหาทั้งหมดของสังคมศึกษา พร้อมเทคนิคการจำและการทำข้อสอบ',
        category: 'สังคมศึกษา',
        level: 'ม.6',
        price: 8000,
        schedule: 'เสาร์ 14:00-17:00',
        image: '/images/course-social.jpg',
        duration: '3 เดือน',
        maxStudents: 25,
        isOnline: true,
        isOnsite: true,
      },
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`Created ${createdCourses.length} courses`);

    // Seed Teachers
    const teachers = [
      {
        name: 'อาจารย์สมชาย ใจดี',
        image: '/images/teacher-1.jpg',
        education: 'ปริญญาโท คณิตศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
        expertise: ['แคลคูลัส', 'พีชคณิต', 'เรขาคณิต', 'สถิติ'],
        experience: 8,
        achievements: [
          'นักเรียนสอบติดคณะวิศวกรรมศาสตร์ จุฬาฯ 95%',
          'นักเรียนได้คะแนน PAT1 เฉลี่ย 180+ คะแนน',
          'ได้รับรางวัลครูดีเด่นประจำปี 2023'
        ],
        bio: 'อาจารย์สมชายเป็นครูผู้สอนคณิตศาสตร์ที่มีประสบการณ์กว่า 8 ปี เน้นการสอนให้เข้าใจหลักการและสามารถนำไปประยุกต์ใช้ได้จริง',
        subjects: ['คณิตศาสตร์'],
      },
      {
        name: 'อาจารย์สมหญิง เก่งอังกฤษ',
        image: '/images/teacher-2.jpg',
        education: 'ปริญญาโท ภาษาอังกฤษ มหาวิทยาลัยธรรมศาสตร์',
        expertise: ['TOEIC', 'TOEFL', 'IELTS', 'Grammar', 'Speaking'],
        experience: 6,
        achievements: [
          'นักเรียนสอบ TOEIC ได้คะแนนเฉลี่ย 750+ คะแนน',
          'นักเรียนสอบ IELTS ได้คะแนนเฉลี่ย 7.0+ คะแนน',
          'มีประสบการณ์สอนในต่างประเทศ 2 ปี'
        ],
        bio: 'อาจารย์สมหญิงเป็นครูผู้สอนภาษาอังกฤษที่มีประสบการณ์การสอนทั้งในประเทศไทยและต่างประเทศ เน้นการสื่อสารและการใช้งานจริง',
        subjects: ['ภาษาอังกฤษ'],
      },
      {
        name: 'อาจารย์สมศักดิ์ ฟิสิกส์เก่ง',
        image: '/images/teacher-3.jpg',
        education: 'ปริญญาเอก ฟิสิกส์ มหาวิทยาลัยมหิดล',
        expertise: ['กลศาสตร์', 'ไฟฟ้า', 'แม่เหล็ก', 'แสง', 'คลื่น'],
        experience: 10,
        achievements: [
          'นักเรียนสอบติดคณะวิศวกรรมศาสตร์ 90%',
          'นักเรียนได้คะแนน PAT2 ฟิสิกส์ เฉลี่ย 150+ คะแนน',
          'เป็นผู้เขียนหนังสือฟิสิกส์ขายดี'
        ],
        bio: 'อาจารย์สมศักดิ์เป็นครูผู้สอนฟิสิกส์ที่มีประสบการณ์กว่า 10 ปี เน้นการทำความเข้าใจหลักการและการประยุกต์ใช้',
        subjects: ['ฟิสิกส์'],
      },
      {
        name: 'อาจารย์สมพร เคมีดี',
        image: '/images/teacher-4.jpg',
        education: 'ปริญญาโท เคมี มหาวิทยาลัยเกษตรศาสตร์',
        expertise: ['เคมีอินทรีย์', 'เคมีอนินทรีย์', 'เคมีฟิสิกส์', 'เคมีวิเคราะห์'],
        experience: 7,
        achievements: [
          'นักเรียนสอบติดคณะเภสัชศาสตร์ 85%',
          'นักเรียนได้คะแนน PAT2 เคมี เฉลี่ย 140+ คะแนน',
          'มีผลงานวิจัยตีพิมพ์ในวารสารนานาชาติ'
        ],
        bio: 'อาจารย์สมพรเป็นครูผู้สอนเคมีที่มีประสบการณ์กว่า 7 ปี เน้นการทำความเข้าใจและเชื่อมโยงกับชีวิตประจำวัน',
        subjects: ['เคมี'],
      },
    ];

    const createdTeachers = await Teacher.insertMany(teachers);
    console.log(`Created ${createdTeachers.length} teachers`);

    // Seed News
    const news = [
      {
        title: 'เปิดรับสมัครหลักสูตรใหม่ ภาคเรียนที่ 2/2567',
        content: 'สถาบัน SciHome เปิดรับสมัครหลักสูตรใหม่สำหรับภาคเรียนที่ 2/2567 เริ่มเรียนวันที่ 1 พฤศจิกายน 2567 หลักสูตรครอบคลุมทุกวิชาและทุกระดับชั้น',
        image: '/images/news-1.jpg',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-10-01'),
      },
      {
        title: 'ผลการสอบเข้ามหาวิทยาลัย 2567',
        content: 'นักเรียนของ SciHome มีอัตราการสอบติดมหาวิทยาลัย 95% ในปี 2567 โดยมีนักเรียนสอบติดคณะวิศวกรรมศาสตร์ จุฬาฯ มากที่สุด',
        image: '/images/news-2.jpg',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-09-15'),
      },
      {
        title: 'กิจกรรมทดลองเรียนฟรี เดือนตุลาคม',
        content: 'สถาบัน SciHome จัดกิจกรรมทดลองเรียนฟรีทุกหลักสูตรในเดือนตุลาคม 2567 เพื่อให้นักเรียนและผู้ปกครองได้สัมผัสบรรยากาศการเรียนจริง',
        image: '/images/news-3.jpg',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-10-15'),
      },
    ];

    const createdNews = await News.insertMany(news);
    console.log(`Created ${createdNews.length} news articles`);

    // Seed Testimonials
    const testimonials = [
      {
        studentName: 'น้องน้ำ',
        message: 'เรียนคณิตศาสตร์กับอาจารย์สมชายแล้วเข้าใจมากขึ้นมากเลยค่ะ จากที่ได้คะแนน 60-70 ตอนนี้ได้ 85-90 แล้วค่ะ',
        image: '/images/student-1.jpg',
        course: 'คณิตศาสตร์ ม.4-6',
        rating: 5,
        isApproved: true,
      },
      {
        studentName: 'น้องฟ้า',
        message: 'อาจารย์สมหญิงสอนภาษาอังกฤษได้ดีมากค่ะ ทำให้ผมสอบ TOEIC ได้ 750 คะแนน จากที่เคยได้แค่ 500 คะแนน',
        image: '/images/student-2.jpg',
        course: 'ภาษาอังกฤษ TOEIC',
        rating: 5,
        isApproved: true,
      },
      {
        studentName: 'น้องดิน',
        message: 'เรียนฟิสิกส์กับอาจารย์สมศักดิ์แล้วเข้าใจมากขึ้นมากครับ จากที่เกลียดฟิสิกส์ ตอนนี้ชอบแล้วครับ',
        image: '/images/student-3.jpg',
        course: 'ฟิสิกส์ ม.5-6',
        rating: 5,
        isApproved: true,
      },
      {
        studentName: 'น้องลม',
        message: 'อาจารย์สมพรสอนเคมีได้เข้าใจง่ายมากค่ะ ทำให้สอบ PAT2 เคมีได้คะแนนดีมาก',
        image: '/images/student-4.jpg',
        course: 'เคมี ม.4-6',
        rating: 4,
        isApproved: true,
      },
    ];

    const createdTestimonials = await Testimonial.insertMany(testimonials);
    console.log(`Created ${createdTestimonials.length} testimonials`);

    console.log('Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function main() {
  await connectDB();
  await seedData();
}

main();
