import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Course from '@/models/Course';

export async function POST() {
  try {
    await connectDB();

    // หา course A-Level สังคมศึกษา
    const socialStudiesCourse = await Course.findOne({
      $or: [
        { name: { $regex: /A-Level.*สังคมศึกษา/i } },
        { name: { $regex: /สังคมศึกษา.*A-Level/i } },
        { category: 'สังคมศึกษา', level: { $regex: /A-Level|เตรียมสอบ/i } }
      ]
    }).sort({ createdAt: -1 });

    if (!socialStudiesCourse) {
      return NextResponse.json(
        { error: 'ไม่พบ course A-Level สังคมศึกษาในระบบ กรุณาสร้าง course A-Level สังคมศึกษาก่อน' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อสอบ A-Level สังคมศึกษาอยู่แล้วหรือไม่
    const existingExam = await Exam.findOne({
      title: 'ข้อสอบวิชา A-Level สังคมศึกษา',
      courseId: socialStudiesCourse._id
    });

    if (existingExam) {
      return NextResponse.json(
        { message: 'ข้อสอบวิชา A-Level สังคมศึกษา มีอยู่แล้วในระบบ', exam: existingExam },
        { status: 200 }
      );
    }

    // สร้างข้อสอบ A-Level สังคมศึกษา 10 ข้อ
    const socialStudiesExam = {
      title: 'ข้อสอบวิชา A-Level สังคมศึกษา',
      courseId: socialStudiesCourse._id,
      description: 'ข้อสอบวิชา A-Level สังคมศึกษา จำนวน 10 ข้อ เวลา 10 นาที คะแนนเต็ม 10 คะแนน ครอบคลุมเนื้อหาประวัติศาสตร์ไทย เศรษฐศาสตร์ การเมืองการปกครอง ภูมิศาสตร์ และศาสนา',
      duration: 10, // 10 นาที
      totalScore: 10, // คะแนนเต็ม 10 คะแนน
      isActive: true,
      passingScore: 5, // ผ่านที่ 5 คะแนนขึ้นไป
      questions: [
        {
          questionText: 'สมัยสุโขทัยเป็นราชธานีของไทย มีการปกครองแบบใด?',
          questionType: 'multiple-choice',
          options: ['สมบูรณาญาสิทธิราชย์', 'ประชาธิปไตย', 'พ่อปกครองลูก', 'สาธารณรัฐ'],
          correctAnswer: 'พ่อปกครองลูก',
          points: 1,
          explanation: 'สมัยสุโขทัยมีการปกครองแบบ "พ่อปกครองลูก" โดยพระมหากษัตริย์ทรงเป็นเสมือนพ่อของประชาชน มีความใกล้ชิดและเอาใจใส่ประชาชน',
        },
        {
          questionText: 'หลักการทางเศรษฐกิจใดที่เน้นการให้รัฐควบคุมการผลิตและการกระจายสินค้า?',
          questionType: 'multiple-choice',
          options: ['ระบบทุนนิยม', 'ระบบสังคมนิยม', 'ระบบผสม', 'ระบบเสรีนิยม'],
          correctAnswer: 'ระบบสังคมนิยม',
          points: 1,
          explanation: 'ระบบสังคมนิยม (Socialism) เน้นการให้รัฐเป็นเจ้าของและควบคุมปัจจัยการผลิต เพื่อให้เกิดการกระจายรายได้อย่างเท่าเทียม',
        },
        {
          questionText: 'รัฐธรรมนูญฉบับแรกของไทยประกาศใช้เมื่อใด?',
          questionType: 'multiple-choice',
          options: ['พ.ศ. 2475', 'พ.ศ. 2476', 'พ.ศ. 2477', 'พ.ศ. 2480'],
          correctAnswer: 'พ.ศ. 2475',
          points: 1,
          explanation: 'รัฐธรรมนูญฉบับแรกของไทยประกาศใช้เมื่อวันที่ 10 ธันวาคม พ.ศ. 2475 หลังจากเกิดการเปลี่ยนแปลงการปกครองจากระบอบสมบูรณาญาสิทธิราชย์เป็นระบอบประชาธิปไตย',
        },
        {
          questionText: 'ภูมิภาคใดของไทยที่มีลักษณะเป็นที่ราบสูงและมีอากาศหนาวเย็น?',
          questionType: 'multiple-choice',
          options: ['ภาคเหนือ', 'ภาคกลาง', 'ภาคตะวันออก', 'ภาคใต้'],
          correctAnswer: 'ภาคเหนือ',
          points: 1,
          explanation: 'ภาคเหนือของไทยมีลักษณะเป็นที่ราบสูงและภูเขา มีอากาศหนาวเย็นในฤดูหนาว โดยเฉพาะในจังหวัดเชียงใหม่ เชียงราย และแม่ฮ่องสอน',
        },
        {
          questionText: 'ศาสนาพุทธในประเทศไทยเป็นนิกายใด?',
          questionType: 'multiple-choice',
          options: ['มหายาน', 'เถรวาท', 'วัชรยาน', 'เซน'],
          correctAnswer: 'เถรวาท',
          points: 1,
          explanation: 'ศาสนาพุทธในประเทศไทยเป็นนิกายเถรวาท (Theravada) ซึ่งเป็นนิกายดั้งเดิมที่ยึดถือพระไตรปิฎกเป็นหลัก',
        },
        {
          questionText: 'การปฏิรูปการปกครองในสมัยรัชกาลที่ 5 มีจุดประสงค์หลักเพื่ออะไร?',
          questionType: 'multiple-choice',
          options: ['เพิ่มอำนาจของขุนนาง', 'รวมอำนาจเข้าสู่ส่วนกลาง', 'แยกอำนาจให้ท้องถิ่น', 'ลดอำนาจของพระมหากษัตริย์'],
          correctAnswer: 'รวมอำนาจเข้าสู่ส่วนกลาง',
          points: 1,
          explanation: 'การปฏิรูปการปกครองในสมัยรัชกาลที่ 5 มีจุดประสงค์เพื่อรวมอำนาจเข้าสู่ส่วนกลาง เพื่อให้การปกครองมีประสิทธิภาพและป้องกันการแทรกแซงจากต่างชาติ',
        },
        {
          questionText: 'GDP (Gross Domestic Product) คืออะไร?',
          questionType: 'multiple-choice',
          options: ['รายได้รวมของประเทศ', 'มูลค่าสินค้าและบริการที่ผลิตในประเทศในช่วงเวลาหนึ่ง', 'รายได้เฉลี่ยต่อหัวของประชากร', 'มูลค่าการส่งออกของประเทศ'],
          correctAnswer: 'มูลค่าสินค้าและบริการที่ผลิตในประเทศในช่วงเวลาหนึ่ง',
          points: 1,
          explanation: 'GDP (Gross Domestic Product) คือมูลค่ารวมของสินค้าและบริการขั้นสุดท้ายที่ผลิตภายในประเทศในช่วงเวลาหนึ่ง (โดยปกติ 1 ปี)',
        },
        {
          questionText: 'องค์กรปกครองส่วนท้องถิ่นประเภทใดที่มีอำนาจในการบริหารงานสูงสุด?',
          questionType: 'multiple-choice',
          options: ['องค์การบริหารส่วนตำบล (อบต.)', 'เทศบาล', 'องค์การบริหารส่วนจังหวัด (อบจ.)', 'กรุงเทพมหานคร'],
          correctAnswer: 'กรุงเทพมหานคร',
          points: 1,
          explanation: 'กรุงเทพมหานครเป็นองค์กรปกครองส่วนท้องถิ่นที่มีอำนาจในการบริหารงานสูงสุด มีสถานะพิเศษและมีอำนาจในการบริหารงานคล้ายกับจังหวัด',
        },
        {
          questionText: 'แม่น้ำสายใดที่ยาวที่สุดในประเทศไทย?',
          questionType: 'multiple-choice',
          options: ['แม่น้ำเจ้าพระยา', 'แม่น้ำโขง', 'แม่น้ำมูล', 'แม่น้ำชี'],
          correctAnswer: 'แม่น้ำมูล',
          points: 1,
          explanation: 'แม่น้ำมูลเป็นแม่น้ำสายที่ยาวที่สุดในประเทศไทย มีความยาวประมาณ 641 กิโลเมตร ไหลผ่านจังหวัดต่างๆ ในภาคอีสาน',
        },
        {
          questionText: 'หลักการสำคัญของระบอบประชาธิปไตยคืออะไร?',
          questionType: 'multiple-choice',
          options: ['อำนาจอธิปไตยเป็นของพระมหากษัตริย์', 'อำนาจอธิปไตยเป็นของประชาชน', 'อำนาจอธิปไตยเป็นของรัฐบาล', 'อำนาจอธิปไตยเป็นของศาล'],
          correctAnswer: 'อำนาจอธิปไตยเป็นของประชาชน',
          points: 1,
          explanation: 'หลักการสำคัญของระบอบประชาธิปไตยคืออำนาจอธิปไตยเป็นของประชาชน โดยประชาชนเป็นผู้เลือกผู้แทนไปใช้อำนาจในรัฐสภา',
        },
      ],
    };

    const createdExam = await Exam.create(socialStudiesExam);
    const populatedExam = await Exam.findById(createdExam._id)
      .populate('courseId', 'name category level');

    return NextResponse.json(
      { 
        message: 'สร้างข้อสอบวิชา A-Level สังคมศึกษา สำเร็จ',
        exam: populatedExam 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error seeding social studies exam:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}




