import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Course from '@/models/Course';

export async function POST() {
  try {
    await connectDB();

    // หา course เคมี
    const chemistryCourse = await Course.findOne({
      $or: [
        { name: { $regex: /เคมี/i } },
        { category: 'เคมี' }
      ]
    }).sort({ createdAt: -1 });

    if (!chemistryCourse) {
      return NextResponse.json(
        { error: 'ไม่พบ course เคมีในระบบ กรุณาสร้าง course เคมีก่อน' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อสอบเคมี Mock Exam อยู่แล้วหรือไม่
    const existingExam = await Exam.findOne({
      title: 'Mock Exam วิชาเคมี',
      courseId: chemistryCourse._id
    });

    if (existingExam) {
      return NextResponse.json(
        { message: 'Mock Exam วิชาเคมี มีอยู่แล้วในระบบ', exam: existingExam },
        { status: 200 }
      );
    }

    // สร้างข้อสอบเคมี Mock Exam 10 ข้อ
    const chemistryExam = {
      title: 'Mock Exam วิชาเคมี',
      courseId: chemistryCourse._id,
      description: 'Mock Exam วิชาเคมี จำนวน 10 ข้อ เวลา 10 นาที คะแนนเต็ม 10 คะแนน ครอบคลุมเนื้อหาโครงสร้างอะตอม พันธะเคมี สมดุลเคมี กรด-เบส และปฏิกิริยาเคมี',
      duration: 10, // 10 นาที
      totalScore: 10, // คะแนนเต็ม 10 คะแนน
      isActive: true,
      passingScore: 5, // ผ่านที่ 5 คะแนนขึ้นไป
      questions: [
        {
          questionText: 'อะตอมของธาตุใดที่มีจำนวนโปรตอน 11 ตัว และจำนวนอิเล็กตรอน 11 ตัว?',
          questionType: 'multiple-choice',
          options: ['โซเดียม (Na)', 'แมกนีเซียม (Mg)', 'อะลูมิเนียม (Al)', 'โพแทสเซียม (K)'],
          correctAnswer: 'โซเดียม (Na)',
          points: 1,
          explanation: 'โซเดียม (Na) มีเลขอะตอม 11 ซึ่งหมายถึงมีจำนวนโปรตอน 11 ตัว และในอะตอมที่เป็นกลางจะมีจำนวนอิเล็กตรอนเท่ากับจำนวนโปรตอน',
        },
        {
          questionText: 'พันธะใดที่เกิดจากการใช้ร่วมกันของอิเล็กตรอนระหว่างอะตอม?',
          questionType: 'multiple-choice',
          options: ['พันธะไอออนิก', 'พันธะโคเวเลนต์', 'พันธะโลหะ', 'พันธะไฮโดรเจน'],
          correctAnswer: 'พันธะโคเวเลนต์',
          points: 1,
          explanation: 'พันธะโคเวเลนต์เกิดจากการใช้ร่วมกันของอิเล็กตรอนระหว่างอะตอมที่ไม่ใช่โลหะ',
        },
        {
          questionText: 'สารละลายที่มีค่า pH = 7 จัดเป็นสารละลายประเภทใด?',
          questionType: 'multiple-choice',
          options: ['กรด', 'เบส', 'กลาง', 'บัฟเฟอร์'],
          correctAnswer: 'กลาง',
          points: 1,
          explanation: 'สารละลายที่มีค่า pH = 7 เป็นสารละลายกลาง (neutral) ซึ่งมีความเข้มข้นของ H⁺ และ OH⁻ เท่ากัน',
        },
        {
          questionText: 'ปฏิกิริยาเคมีใดที่แสดงการเกิดออกซิเดชัน?',
          questionType: 'multiple-choice',
          options: ['Cu²⁺ + 2e⁻ → Cu', 'Fe²⁺ → Fe³⁺ + e⁻', 'Cl₂ + 2e⁻ → 2Cl⁻', 'Na⁺ + e⁻ → Na'],
          correctAnswer: 'Fe²⁺ → Fe³⁺ + e⁻',
          points: 1,
          explanation: 'การเกิดออกซิเดชันคือการสูญเสียอิเล็กตรอน Fe²⁺ สูญเสียอิเล็กตรอน 1 ตัวกลายเป็น Fe³⁺',
        },
        {
          questionText: 'ตามหลักของเลอ ชาเตอลิเยร์ เมื่อเพิ่มความดันให้กับระบบที่อยู่ในสมดุล ระบบจะปรับตัวอย่างไร?',
          questionType: 'multiple-choice',
          options: ['เลื่อนไปทางที่มีจำนวนโมลก๊าซน้อยกว่า', 'เลื่อนไปทางที่มีจำนวนโมลก๊าซมากกว่า', 'ไม่เปลี่ยนแปลง', 'ขึ้นอยู่กับอุณหภูมิ'],
          correctAnswer: 'เลื่อนไปทางที่มีจำนวนโมลก๊าซน้อยกว่า',
          points: 1,
          explanation: 'ตามหลักของเลอ ชาเตอลิเยร์ เมื่อเพิ่มความดัน ระบบจะปรับตัวโดยเลื่อนสมดุลไปทางที่มีจำนวนโมลก๊าซน้อยกว่าเพื่อลดความดัน',
        },
        {
          questionText: 'สารประกอบใดที่มีพันธะไอออนิก?',
          questionType: 'multiple-choice',
          options: ['H₂O', 'CO₂', 'NaCl', 'CH₄'],
          correctAnswer: 'NaCl',
          points: 1,
          explanation: 'NaCl เป็นสารประกอบไอออนิกที่เกิดจากโลหะ (Na) และอโลหะ (Cl) โดย Na ให้อิเล็กตรอนแก่ Cl',
        },
        {
          questionText: 'จำนวนอะตอมของออกซิเจนในโมเลกุล H₂SO₄ มีกี่อะตอม?',
          questionType: 'multiple-choice',
          options: ['1', '2', '4', '6'],
          correctAnswer: '4',
          points: 1,
          explanation: 'H₂SO₄ มีออกซิเจน 4 อะตอม (O₄)',
        },
        {
          questionText: 'กรดใดที่มีความแรงมากที่สุด?',
          questionType: 'multiple-choice',
          options: ['CH₃COOH (กรดอะซิติก)', 'HCl (กรดไฮโดรคลอริก)', 'H₂CO₃ (กรดคาร์บอนิก)', 'H₃PO₄ (กรดฟอสฟอริก)'],
          correctAnswer: 'HCl (กรดไฮโดรคลอริก)',
          points: 1,
          explanation: 'HCl เป็นกรดแก่ (strong acid) ที่แตกตัวได้สมบูรณ์ในน้ำ ส่วนกรดอื่นๆ เป็นกรดอ่อนที่แตกตัวได้บางส่วน',
        },
        {
          questionText: 'ในปฏิกิริยา 2H₂ + O₂ → 2H₂O ถ้าใช้ H₂ 4 โมล จะได้ H₂O กี่โมล?',
          questionType: 'multiple-choice',
          options: ['2 โมล', '4 โมล', '6 โมล', '8 โมล'],
          correctAnswer: '4 โมล',
          points: 1,
          explanation: 'จากสมการ 2H₂ → 2H₂O อัตราส่วน H₂ : H₂O = 2 : 2 = 1 : 1 ดังนั้น H₂ 4 โมล จะได้ H₂O 4 โมล',
        },
        {
          questionText: 'ธาตุใดอยู่ในหมู่ VIII A (หมู่ 18) ของตารางธาตุ?',
          questionType: 'multiple-choice',
          options: ['ไฮโดรเจน', 'คาร์บอน', 'นีออน', 'โซเดียม'],
          correctAnswer: 'นีออน',
          points: 1,
          explanation: 'นีออน (Ne) อยู่ในหมู่ VIII A หรือหมู่ 18 ซึ่งเป็นหมู่ก๊าซมีตระกูล (Noble gases)',
        },
      ],
    };

    const createdExam = await Exam.create(chemistryExam);
    const populatedExam = await Exam.findById(createdExam._id)
      .populate('courseId', 'name category level');

    return NextResponse.json(
      { 
        message: 'สร้าง Mock Exam วิชาเคมี สำเร็จ',
        exam: populatedExam 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error seeding chemistry exam:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}

