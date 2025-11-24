import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Course from '@/models/Course';

export async function POST() {
  try {
    await connectDB();

    // หา course Physics
    const physicsCourse = await Course.findOne({
      $or: [
        { name: { $regex: /ฟิสิกส์/i } },
        { category: 'ฟิสิกส์' }
      ]
    }).sort({ createdAt: -1 });

    if (!physicsCourse) {
      return NextResponse.json(
        { error: 'ไม่พบ course ฟิสิกส์ในระบบ กรุณาสร้าง course ฟิสิกส์ก่อน' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อสอบ Physics อยู่แล้วหรือไม่
    const existingExam = await Exam.findOne({
      title: 'ข้อสอบวิชา Physics',
      courseId: physicsCourse._id
    });

    if (existingExam) {
      return NextResponse.json(
        { message: 'ข้อสอบ Physics มีอยู่แล้วในระบบ', exam: existingExam },
        { status: 200 }
      );
    }

    // สร้างข้อสอบ Physics 10 ข้อ
    const physicsExam = {
      title: 'ข้อสอบวิชา Physics',
      courseId: physicsCourse._id,
      description: 'ข้อสอบวิชา Physics จำนวน 10 ข้อ เวลา 15 นาที ครอบคลุมเนื้อหากลศาสตร์ ไฟฟ้า แสง ความร้อน และคลื่น',
      duration: 15, // 15 นาที
      totalScore: 15, // คะแนนเต็ม 15 คะแนน
      isActive: true,
      passingScore: 7, // ผ่านที่ 7 ข้อขึ้นไป
      questions: [
        {
          questionText: 'วัตถุเคลื่อนที่ด้วยความเร็วคงที่ 10 m/s เป็นเวลา 5 วินาที ระยะทางที่วัตถุเคลื่อนที่ได้เป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['50 m', '15 m', '2 m', '5 m'],
          correctAnswer: '50 m',
          points: 2,
          explanation: 'ใช้สูตร s = vt = 10 × 5 = 50 m',
        },
        {
          questionText: 'แรงที่กระทำต่อวัตถุมวล 5 kg ให้เกิดความเร่ง 2 m/s² มีค่าเท่าใด?',
          questionType: 'multiple-choice',
          options: ['10 N', '7 N', '2.5 N', '3 N'],
          correctAnswer: '10 N',
          points: 1,
          explanation: 'ใช้สูตร F = ma = 5 × 2 = 10 N',
        },
        {
          questionText: 'พลังงานศักย์โน้มถ่วงของวัตถุมวล 2 kg ที่สูงจากพื้นดิน 10 m (g = 10 m/s²) มีค่าเท่าใด?',
          questionType: 'multiple-choice',
          options: ['20 J', '200 J', '100 J', '10 J'],
          correctAnswer: '200 J',
          points: 2,
          explanation: 'ใช้สูตร Ep = mgh = 2 × 10 × 10 = 200 J',
        },
        {
          questionText: 'เมื่อแสงผ่านจากอากาศเข้าสู่น้ำ ความเร็วของแสงจะเกิดอะไรขึ้น?',
          questionType: 'multiple-choice',
          options: ['เพิ่มขึ้น', 'ลดลง', 'คงที่', 'ขึ้นอยู่กับความยาวคลื่น'],
          correctAnswer: 'ลดลง',
          points: 1,
          explanation: 'เมื่อแสงผ่านจากตัวกลางที่มีดัชนีหักเหต่ำไปสูง ความเร็วจะลดลง',
        },
        {
          questionText: 'กระแสไฟฟ้า 2 A ไหลผ่านตัวต้านทาน 10 Ω เป็นเวลา 5 วินาที พลังงานที่ใช้ไปเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['100 J', '200 J', '50 J', '20 J'],
          correctAnswer: '200 J',
          points: 2,
          explanation: 'ใช้สูตร W = I²Rt = (2)² × 10 × 5 = 4 × 10 × 5 = 200 J',
        },
        {
          questionText: 'คลื่นเสียงมีความถี่ 500 Hz และความยาวคลื่น 0.68 m ความเร็วของคลื่นเสียงเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['340 m/s', '500 m/s', '680 m/s', '250 m/s'],
          correctAnswer: '340 m/s',
          points: 1,
          explanation: 'ใช้สูตร v = fλ = 500 × 0.68 = 340 m/s',
        },
        {
          questionText: 'วัตถุที่อุณหภูมิ 100°C ถูกนำไปใส่ในน้ำ 0°C 1 kg (ความจุความร้อนจำเพาะน้ำ = 4200 J/kg·K) ถ้าน้ำได้รับความร้อน 42000 J อุณหภูมิสุดท้ายของน้ำเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['10°C', '20°C', '30°C', '40°C'],
          correctAnswer: '10°C',
          points: 2,
          explanation: 'ใช้สูตร Q = mcΔT → 42000 = 1 × 4200 × ΔT → ΔT = 10°C ดังนั้นอุณหภูมิสุดท้าย = 0 + 10 = 10°C',
        },
        {
          questionText: 'แรงลัพธ์ที่กระทำต่อวัตถุที่อยู่นิ่งมีค่าเท่าใด?',
          questionType: 'multiple-choice',
          options: ['มากกว่าศูนย์', 'เท่ากับศูนย์', 'น้อยกว่าศูนย์', 'ไม่สามารถบอกได้'],
          correctAnswer: 'เท่ากับศูนย์',
          points: 1,
          explanation: 'ตามกฎข้อที่ 1 ของนิวตัน วัตถุที่อยู่นิ่งจะมีแรงลัพธ์เท่ากับศูนย์',
        },
        {
          questionText: 'เมื่อประจุไฟฟ้า +2 C และ -3 C อยู่ห่างกัน 2 m แรงระหว่างประจุเป็นเท่าใด? (k = 9×10⁹ N·m²/C²)',
          questionType: 'multiple-choice',
          options: ['-1.35×10¹⁰ N', '1.35×10¹⁰ N', '-2.7×10¹⁰ N', '2.7×10¹⁰ N'],
          correctAnswer: '-1.35×10¹⁰ N',
          points: 1,
          explanation: 'ใช้สูตร F = k(q₁q₂)/r² = (9×10⁹)(2)(-3)/(2)² = -54×10⁹/4 = -1.35×10¹⁰ N (ลบหมายถึงแรงดึงดูด)',
        },
        {
          questionText: 'วัตถุเคลื่อนที่ด้วยความเร็วเริ่มต้น 20 m/s และความเร่ง -5 m/s² วัตถุจะหยุดนิ่งเมื่อเวลาผ่านไปกี่วินาที?',
          questionType: 'multiple-choice',
          options: ['4 s', '5 s', '10 s', '15 s'],
          correctAnswer: '4 s',
          points: 2,
          explanation: 'ใช้สูตร v = u + at เมื่อหยุดนิ่ง v = 0 → 0 = 20 + (-5)t → 5t = 20 → t = 4 s',
        },
      ],
    };

    const createdExam = await Exam.create(physicsExam);
    const populatedExam = await Exam.findById(createdExam._id)
      .populate('courseId', 'name category level');

    return NextResponse.json(
      { 
        message: 'สร้างข้อสอบ Physics สำเร็จ',
        exam: populatedExam 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error seeding physics exam:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}

