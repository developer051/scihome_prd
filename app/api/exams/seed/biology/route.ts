import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Course from '@/models/Course';

export async function POST() {
  try {
    await connectDB();

    // หา course ชีววิทยา ม.6
    const biologyCourse = await Course.findOne({
      $or: [
        { name: { $regex: /ชีววิทยา.*ม\.6/i } },
        { name: { $regex: /ชีววิทยา.*มัธยม.*6/i } },
        { category: 'ชีววิทยา', level: 'ม.6' }
      ]
    }).sort({ createdAt: -1 });

    if (!biologyCourse) {
      return NextResponse.json(
        { error: 'ไม่พบ course ชีววิทยา ม.6 ในระบบ กรุณาสร้าง course ชีววิทยา ม.6 ก่อน' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อสอบชีววิทยา ม.6 เข้มข้นอยู่แล้วหรือไม่
    const existingExam = await Exam.findOne({
      title: 'ข้อสอบวิชาชีววิทยา ม.6 เข้มข้น',
      courseId: biologyCourse._id
    });

    if (existingExam) {
      return NextResponse.json(
        { message: 'ข้อสอบชีววิทยา ม.6 เข้มข้น มีอยู่แล้วในระบบ', exam: existingExam },
        { status: 200 }
      );
    }

    // สร้างข้อสอบชีววิทยา ม.6 เข้มข้น 10 ข้อ
    const biologyExam = {
      title: 'ข้อสอบวิชาชีววิทยา ม.6 เข้มข้น',
      courseId: biologyCourse._id,
      description: 'ข้อสอบวิชาชีววิทยา ม.6 เข้มข้น จำนวน 10 ข้อ เวลา 15 นาที ครอบคลุมเนื้อหาเซลล์ พันธุกรรม ระบบต่างๆ ในร่างกาย นิเวศวิทยา และวิวัฒนาการ',
      duration: 15, // 15 นาที
      totalScore: 15, // คะแนนเต็ม 15 คะแนน
      isActive: true,
      passingScore: 8, // ผ่านที่ 8 คะแนนขึ้นไป
      questions: [
        {
          questionText: 'กระบวนการใดที่เกิดขึ้นในไมโทคอนเดรียและผลิต ATP มากที่สุด?',
          questionType: 'multiple-choice',
          options: ['ไกลโคไลซิส', 'วัฏจักรเครบส์', 'ห่วงโซ่การถ่ายทอดอิเล็กตรอน', 'การหมัก'],
          correctAnswer: 'ห่วงโซ่การถ่ายทอดอิเล็กตรอน',
          points: 2,
          explanation: 'ห่วงโซ่การถ่ายทอดอิเล็กตรอน (Electron Transport Chain) ผลิต ATP ได้มากที่สุดประมาณ 28-34 ATP ต่อโมเลกุลกลูโคส เกิดขึ้นที่เยื่อหุ้มชั้นในของไมโทคอนเดรีย',
        },
        {
          questionText: 'ในกระบวนการถ่ายทอดลักษณะทางพันธุกรรม ถ้าพ่อและแม่มีจีโนไทป์เป็น Aa และ aa ตามลำดับ ลูกจะมีฟีโนไทป์แบบเด่นกี่เปอร์เซ็นต์?',
          questionType: 'multiple-choice',
          options: ['0%', '25%', '50%', '100%'],
          correctAnswer: '50%',
          points: 1,
          explanation: 'พ่อ Aa × แม่ aa → ลูกได้ Aa (50%) และ aa (50%) ดังนั้นฟีโนไทป์แบบเด่น (A-) = 50%',
        },
        {
          questionText: 'ออร์แกเนลล์ใดในเซลล์พืชที่ทำหน้าที่สังเคราะห์ด้วยแสง?',
          questionType: 'multiple-choice',
          options: ['ไมโทคอนเดรีย', 'คลอโรพลาสต์', 'ไรโบโซม', 'กอลจิคอมเพล็กซ์'],
          correctAnswer: 'คลอโรพลาสต์',
          points: 1,
          explanation: 'คลอโรพลาสต์ (Chloroplast) เป็นออร์แกเนลล์ที่มีคลอโรฟิลล์และทำหน้าที่สังเคราะห์ด้วยแสงในเซลล์พืช',
        },
        {
          questionText: 'ฮอร์โมนใดที่หลั่งจากตับอ่อนและช่วยลดระดับน้ำตาลในเลือด?',
          questionType: 'multiple-choice',
          options: ['กลูคากอน', 'อินซูลิน', 'อะดรีนาลีน', 'คอร์ติซอล'],
          correctAnswer: 'อินซูลิน',
          points: 1,
          explanation: 'อินซูลิน (Insulin) หลั่งจากเบต้าเซลล์ของตับอ่อน ช่วยให้เซลล์ดูดซึมกลูโคสจากเลือดและลดระดับน้ำตาลในเลือด',
        },
        {
          questionText: 'ในห่วงโซ่อาหาร สิ่งมีชีวิตใดที่เป็นผู้บริโภคลำดับที่ 1 (Primary Consumer)?',
          questionType: 'multiple-choice',
          options: ['พืช', 'สัตว์กินพืช', 'สัตว์กินเนื้อ', 'แบคทีเรียย่อยสลาย'],
          correctAnswer: 'สัตว์กินพืช',
          points: 1,
          explanation: 'ผู้บริโภคลำดับที่ 1 คือสัตว์กินพืช (Herbivore) ที่กินผู้ผลิต (พืช) เป็นอาหาร',
        },
        {
          questionText: 'กระบวนการใดที่ทำให้เกิดความหลากหลายทางพันธุกรรมในสิ่งมีชีวิต?',
          questionType: 'multiple-choice',
          options: ['ไมโทซิส', 'ไมโอซิส', 'การแบ่งเซลล์แบบไบนารี', 'การโคลน'],
          correctAnswer: 'ไมโอซิส',
          points: 2,
          explanation: 'ไมโอซิส (Meiosis) เป็นกระบวนการแบ่งเซลล์ที่ทำให้เกิดการแลกเปลี่ยนยีน (Crossing over) และการแยกโครโมโซมแบบสุ่ม ทำให้เกิดความหลากหลายทางพันธุกรรม',
        },
        {
          questionText: 'ระบบใดในร่างกายมนุษย์ที่ทำหน้าที่กรองของเสียและควบคุมสมดุลของน้ำและอิเล็กโทรไลต์?',
          questionType: 'multiple-choice',
          options: ['ระบบหายใจ', 'ระบบย่อยอาหาร', 'ระบบขับถ่าย', 'ระบบไหลเวียนเลือด'],
          correctAnswer: 'ระบบขับถ่าย',
          points: 1,
          explanation: 'ระบบขับถ่าย (Excretory System) โดยเฉพาะไต ทำหน้าที่กรองของเสียจากเลือดและควบคุมสมดุลของน้ำและอิเล็กโทรไลต์ในร่างกาย',
        },
        {
          questionText: 'ตามทฤษฎีวิวัฒนาการของดาร์วิน กลไกหลักที่ทำให้เกิดวิวัฒนาการคืออะไร?',
          questionType: 'multiple-choice',
          options: ['การกลายพันธุ์', 'การคัดเลือกโดยธรรมชาติ', 'การย้ายถิ่น', 'การแยกตัวของประชากร'],
          correctAnswer: 'การคัดเลือกโดยธรรมชาติ',
          points: 2,
          explanation: 'การคัดเลือกโดยธรรมชาติ (Natural Selection) เป็นกลไกหลักที่ดาร์วินเสนอ โดยสิ่งมีชีวิตที่มีลักษณะเหมาะสมกับสิ่งแวดล้อมจะอยู่รอดและสืบพันธุ์ได้ดีกว่า',
        },
        {
          questionText: 'ในกระบวนการหายใจระดับเซลล์ สารตั้งต้นหลักคืออะไร?',
          questionType: 'multiple-choice',
          options: ['กลูโคสและออกซิเจน', 'โปรตีนและไขมัน', 'กรดอะมิโนและน้ำ', 'คาร์บอนไดออกไซด์และน้ำ'],
          correctAnswer: 'กลูโคสและออกซิเจน',
          points: 2,
          explanation: 'กระบวนการหายใจระดับเซลล์ใช้กลูโคส (C₆H₁₂O₆) และออกซิเจน (O₂) เป็นสารตั้งต้น ผลิตคาร์บอนไดออกไซด์ น้ำ และ ATP',
        },
        {
          questionText: 'DNA และ RNA แตกต่างกันอย่างไร?',
          questionType: 'multiple-choice',
          options: ['DNA มีน้ำตาลไรโบส RNA มีน้ำตาลดีออกซีไรโบส', 'DNA มีเบสยูราซิล RNA มีเบสไทมีน', 'DNA เป็นสายคู่ RNA เป็นสายเดี่ยว', 'DNA อยู่ในนิวเคลียส RNA อยู่ในไซโทพลาซึมเท่านั้น'],
          correctAnswer: 'DNA เป็นสายคู่ RNA เป็นสายเดี่ยว',
          points: 2,
          explanation: 'DNA (Deoxyribonucleic acid) เป็นสายคู่ (double-stranded) ส่วน RNA (Ribonucleic acid) เป็นสายเดี่ยว (single-stranded) โดยทั่วไป',
        },
      ],
    };

    const createdExam = await Exam.create(biologyExam);
    const populatedExam = await Exam.findById(createdExam._id)
      .populate('courseId', 'name category level');

    return NextResponse.json(
      { 
        message: 'สร้างข้อสอบชีววิทยา ม.6 เข้มข้น สำเร็จ',
        exam: populatedExam 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error seeding biology exam:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}

