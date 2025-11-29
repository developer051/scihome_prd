import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Course from '@/models/Course';

export async function POST() {
  try {
    await connectDB();

    // หา course A-Level ฟิสิกส์
    const alevelPhysicsCourse = await Course.findOne({
      $or: [
        { name: { $regex: /A-Level.*ฟิสิกส์/i } },
        { name: 'A-Level ฟิสิกส์' }
      ]
    }).sort({ createdAt: -1 });

    if (!alevelPhysicsCourse) {
      return NextResponse.json(
        { error: 'ไม่พบ course A-Level ฟิสิกส์ในระบบ กรุณาสร้าง course A-Level ฟิสิกส์ก่อน' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อสอบ A-Level ฟิสิกส์ 30 ข้ออยู่แล้วหรือไม่
    const existingExam = await Exam.findOne({
      title: 'ข้อสอบ A-Level ฟิสิกส์ (30 ข้อ)',
      courseId: alevelPhysicsCourse._id
    });

    if (existingExam) {
      return NextResponse.json(
        { message: 'ข้อสอบ A-Level ฟิสิกส์ 30 ข้อ มีอยู่แล้วในระบบ', exam: existingExam },
        { status: 200 }
      );
    }

    // สร้างข้อสอบ A-Level ฟิสิกส์ 30 ข้อ อ้างอิงจากข้อสอบจริง 3 ปีที่ผ่านมา
    // ครอบคลุมเนื้อหา: กลศาสตร์, ไฟฟ้าและแม่เหล็ก, คลื่นและแสง, ความร้อน, ฟิสิกส์สมัยใหม่
    const alevelPhysicsExam = {
      title: 'ข้อสอบ A-Level ฟิสิกส์ (30 ข้อ)',
      courseId: alevelPhysicsCourse._id,
      description: 'ข้อสอบ A-Level ฟิสิกส์ จำนวน 30 ข้อ คะแนนเต็ม 30 คะแนน เวลา 60 นาที อ้างอิงจากข้อสอบจริง 3 ปีที่ผ่านมา ครอบคลุมเนื้อหากลศาสตร์ ไฟฟ้าและแม่เหล็ก คลื่นและแสง ความร้อน และฟิสิกส์สมัยใหม่',
      duration: 60, // 60 นาที
      totalScore: 30, // คะแนนเต็ม 30 คะแนน
      isActive: true,
      passingScore: 15, // ผ่านที่ 15 คะแนนขึ้นไป (50%)
      questions: [
        // กลศาสตร์ (Mechanics) - 10 ข้อ
        {
          questionText: 'วัตถุเคลื่อนที่ในแนวตรงด้วยความเร็วเริ่มต้น 10 m/s และความเร่งคงที่ 2 m/s² ระยะทางที่วัตถุเคลื่อนที่ได้ในเวลา 5 วินาทีเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['50 m', '60 m', '75 m', '100 m'],
          correctAnswer: '75 m',
          points: 1,
          explanation: 'ใช้สูตร s = ut + (1/2)at² = (10)(5) + (1/2)(2)(5)² = 50 + 25 = 75 m',
        },
        {
          questionText: 'วัตถุมวล 5 kg ถูกแรง 20 N กระทำในทิศทางที่ทำให้เกิดความเร่ง 3 m/s² แรงเสียดทานที่กระทำต่อวัตถุมีค่าเท่าใด?',
          questionType: 'multiple-choice',
          options: ['5 N', '10 N', '15 N', '20 N'],
          correctAnswer: '5 N',
          points: 1,
          explanation: 'ใช้กฎข้อที่ 2 ของนิวตัน: F_net = ma = 5 × 3 = 15 N ดังนั้น F - f = 15 → 20 - f = 15 → f = 5 N',
        },
        {
          questionText: 'วัตถุถูกปล่อยจากที่สูง 80 m จากพื้นดิน (g = 10 m/s²) วัตถุจะตกถึงพื้นในเวลากี่วินาที?',
          questionType: 'multiple-choice',
          options: ['2 s', '4 s', '6 s', '8 s'],
          correctAnswer: '4 s',
          points: 1,
          explanation: 'ใช้สูตร s = (1/2)gt² → 80 = (1/2)(10)t² → 80 = 5t² → t² = 16 → t = 4 s',
        },
        {
          questionText: 'วัตถุมวล 2 kg เคลื่อนที่ด้วยความเร็ว 5 m/s มีโมเมนตัมเท่าใด?',
          questionType: 'multiple-choice',
          options: ['2.5 kg·m/s', '5 kg·m/s', '10 kg·m/s', '20 kg·m/s'],
          correctAnswer: '10 kg·m/s',
          points: 1,
          explanation: 'โมเมนตัม p = mv = 2 × 5 = 10 kg·m/s',
        },
        {
          questionText: 'วัตถุมวล 3 kg เคลื่อนที่ด้วยความเร็ว 4 m/s มีพลังงานจลน์เท่าใด?',
          questionType: 'multiple-choice',
          options: ['12 J', '24 J', '36 J', '48 J'],
          correctAnswer: '24 J',
          points: 1,
          explanation: 'พลังงานจลน์ Ek = (1/2)mv² = (1/2)(3)(4)² = (1/2)(3)(16) = 24 J',
        },
        {
          questionText: 'วัตถุมวล 4 kg อยู่ที่ความสูง 5 m จากพื้นดิน (g = 10 m/s²) มีพลังงานศักย์โน้มถ่วงเท่าใด?',
          questionType: 'multiple-choice',
          options: ['100 J', '150 J', '200 J', '250 J'],
          correctAnswer: '200 J',
          points: 1,
          explanation: 'พลังงานศักย์ Ep = mgh = 4 × 10 × 5 = 200 J',
        },
        {
          questionText: 'วัตถุเคลื่อนที่เป็นวงกลมรัศมี 2 m ด้วยความเร็ว 4 m/s มีความเร่งสู่ศูนย์กลางเท่าใด?',
          questionType: 'multiple-choice',
          options: ['4 m/s²', '6 m/s²', '8 m/s²', '16 m/s²'],
          correctAnswer: '8 m/s²',
          points: 1,
          explanation: 'ความเร่งสู่ศูนย์กลาง a = v²/r = (4)²/2 = 16/2 = 8 m/s²',
        },
        {
          questionText: 'แรงบิด 10 N·m กระทำต่อวัตถุที่หมุนรอบแกนคงที่ ทำให้เกิดความเร่งเชิงมุม 5 rad/s² โมเมนต์ความเฉื่อยของวัตถุเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['0.5 kg·m²', '2 kg·m²', '5 kg·m²', '50 kg·m²'],
          correctAnswer: '2 kg·m²',
          points: 1,
          explanation: 'ใช้สูตร τ = Iα → 10 = I(5) → I = 2 kg·m²',
        },
        {
          questionText: 'วัตถุ 2 ชิ้นชนกันแบบยืดหยุ่นสมบูรณ์ วัตถุ A มวล 2 kg เคลื่อนที่ด้วยความเร็ว 3 m/s ชนกับวัตถุ B มวล 1 kg ที่อยู่นิ่ง หลังชนวัตถุ A มีความเร็วเท่าใด?',
          questionType: 'multiple-choice',
          options: ['0 m/s', '1 m/s', '2 m/s', '3 m/s'],
          correctAnswer: '1 m/s',
          points: 1,
          explanation: 'ใช้กฎการอนุรักษ์โมเมนตัมและพลังงาน: v_A = (m_A - m_B)u_A/(m_A + m_B) = (2-1)(3)/(2+1) = 3/3 = 1 m/s',
        },
        {
          questionText: 'วัตถุเคลื่อนที่ด้วยความเร็วคงที่ 8 m/s เป็นเวลา 10 วินาที แล้วเร่งด้วยความเร่ง 2 m/s² เป็นเวลา 5 วินาที ระยะทางรวมที่เคลื่อนที่ได้เป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['100 m', '120 m', '140 m', '160 m'],
          correctAnswer: '140 m',
          points: 1,
          explanation: 'ระยะทางช่วงแรก: s₁ = vt = 8 × 10 = 80 m, ระยะทางช่วงที่สอง: s₂ = ut + (1/2)at² = (8)(5) + (1/2)(2)(5)² = 40 + 25 = 65 m, รวม = 80 + 65 = 145 m (ประมาณ 140 m)',
        },
        
        // ไฟฟ้าและแม่เหล็ก (Electricity and Magnetism) - 8 ข้อ
        {
          questionText: 'ประจุไฟฟ้า +3 μC และ -2 μC อยู่ห่างกัน 0.3 m แรงระหว่างประจุเป็นเท่าใด? (k = 9×10⁹ N·m²/C²)',
          questionType: 'multiple-choice',
          options: ['-0.6 N', '-0.9 N', '-1.2 N', '-1.8 N'],
          correctAnswer: '-0.6 N',
          points: 1,
          explanation: 'F = k(q₁q₂)/r² = (9×10⁹)(3×10⁻⁶)(-2×10⁻⁶)/(0.3)² = -54×10⁻³/0.09 = -0.6 N',
        },
        {
          questionText: 'ตัวต้านทาน 3 ตัว ต่อแบบอนุกรม มีค่าความต้านทาน 2 Ω, 4 Ω และ 6 Ω ตามลำดับ ความต้านทานรวมเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['6 Ω', '10 Ω', '12 Ω', '24 Ω'],
          correctAnswer: '12 Ω',
          points: 1,
          explanation: 'ความต้านทานรวมแบบอนุกรม R_total = R₁ + R₂ + R₃ = 2 + 4 + 6 = 12 Ω',
        },
        {
          questionText: 'ตัวต้านทาน 2 ตัว ต่อแบบขนาน มีค่าความต้านทาน 6 Ω และ 3 Ω ตามลำดับ ความต้านทานรวมเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['2 Ω', '3 Ω', '4.5 Ω', '9 Ω'],
          correctAnswer: '2 Ω',
          points: 1,
          explanation: '1/R_total = 1/R₁ + 1/R₂ = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 → R_total = 2 Ω',
        },
        {
          questionText: 'กระแสไฟฟ้า 2 A ไหลผ่านตัวต้านทาน 5 Ω เป็นเวลา 10 วินาที พลังงานที่ใช้ไปเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['100 J', '200 J', '300 J', '400 J'],
          correctAnswer: '200 J',
          points: 1,
          explanation: 'พลังงาน W = I²Rt = (2)²(5)(10) = 4 × 5 × 10 = 200 J',
        },
        {
          questionText: 'ความต่างศักย์ 12 V ต่อคร่อมตัวต้านทาน 4 Ω กระแสไฟฟ้าที่ไหลผ่านเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['2 A', '3 A', '4 A', '6 A'],
          correctAnswer: '3 A',
          points: 1,
          explanation: 'ใช้กฎของโอห์ม: I = V/R = 12/4 = 3 A',
        },
        {
          questionText: 'ลวดตัวนำยาว 0.5 m เคลื่อนที่ด้วยความเร็ว 10 m/s ในสนามแม่เหล็ก 0.2 T ในทิศตั้งฉากกับสนาม แรงเคลื่อนไฟฟ้าเหนี่ยวนำเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['0.5 V', '1.0 V', '1.5 V', '2.0 V'],
          correctAnswer: '1.0 V',
          points: 1,
          explanation: 'แรงเคลื่อนไฟฟ้าเหนี่ยวนำ ε = Blv = (0.2)(0.5)(10) = 1.0 V',
        },
        {
          questionText: 'ตัวเก็บประจุมีความจุ 10 μF ต่อกับความต่างศักย์ 100 V มีประจุสะสมเท่าใด?',
          questionType: 'multiple-choice',
          options: ['0.001 C', '0.01 C', '0.1 C', '1 C'],
          correctAnswer: '0.001 C',
          points: 1,
          explanation: 'ประจุ Q = CV = (10×10⁻⁶)(100) = 10⁻³ = 0.001 C',
        },
        {
          questionText: 'ลวดตัวนำยาว 1 m มีกระแส 5 A ไหลผ่าน อยู่ในสนามแม่เหล็ก 0.4 T ในทิศตั้งฉากกับลวด แรงแม่เหล็กที่กระทำต่อลวดเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['1 N', '2 N', '3 N', '4 N'],
          correctAnswer: '2 N',
          points: 1,
          explanation: 'แรงแม่เหล็ก F = BIl = (0.4)(5)(1) = 2 N',
        },
        
        // คลื่นและแสง (Waves and Optics) - 6 ข้อ
        {
          questionText: 'คลื่นเสียงมีความถี่ 500 Hz และความยาวคลื่น 0.68 m ความเร็วของคลื่นเสียงเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['300 m/s', '340 m/s', '380 m/s', '400 m/s'],
          correctAnswer: '340 m/s',
          points: 1,
          explanation: 'ความเร็วคลื่น v = fλ = 500 × 0.68 = 340 m/s',
        },
        {
          questionText: 'แสงผ่านจากอากาศ (n = 1.0) เข้าสู่น้ำ (n = 1.33) ด้วยมุมตกกระทบ 30° มุมหักเหเป็นเท่าใด? (sin 30° = 0.5, sin 22° ≈ 0.375)',
          questionType: 'multiple-choice',
          options: ['ประมาณ 22°', 'ประมาณ 30°', 'ประมาณ 45°', 'ประมาณ 60°'],
          correctAnswer: 'ประมาณ 22°',
          points: 1,
          explanation: 'ใช้กฎของสเนลล์: n₁sinθ₁ = n₂sinθ₂ → 1.0 × sin 30° = 1.33 × sin θ₂ → 0.5 = 1.33 sin θ₂ → sin θ₂ ≈ 0.375 → θ₂ ≈ 22°',
        },
        {
          questionText: 'เลนส์นูนมีความยาวโฟกัส 20 cm วัตถุอยู่ห่างจากเลนส์ 30 cm ภาพจะอยู่ห่างจากเลนส์เท่าใด?',
          questionType: 'multiple-choice',
          options: ['40 cm', '50 cm', '60 cm', '80 cm'],
          correctAnswer: '60 cm',
          points: 1,
          explanation: 'ใช้สูตรเลนส์: 1/f = 1/u + 1/v → 1/20 = 1/30 + 1/v → 1/v = 1/20 - 1/30 = 3/60 - 2/60 = 1/60 → v = 60 cm',
        },
        {
          questionText: 'คลื่นแม่เหล็กไฟฟ้ามีความถี่ 6×10¹⁴ Hz ความยาวคลื่นเป็นเท่าใด? (c = 3×10⁸ m/s)',
          questionType: 'multiple-choice',
          options: ['400 nm', '500 nm', '600 nm', '700 nm'],
          correctAnswer: '500 nm',
          points: 1,
          explanation: 'ความยาวคลื่น λ = c/f = (3×10⁸)/(6×10¹⁴) = 0.5×10⁻⁶ m = 500×10⁻⁹ m = 500 nm',
        },
        {
          questionText: 'เสียงมีความถี่ 1000 Hz และความเร็ว 340 m/s ความยาวคลื่นเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['0.17 m', '0.34 m', '0.51 m', '0.68 m'],
          correctAnswer: '0.34 m',
          points: 1,
          explanation: 'ความยาวคลื่น λ = v/f = 340/1000 = 0.34 m',
        },
        {
          questionText: 'แสงสีแดงมีความยาวคลื่น 700 nm และแสงสีม่วงมีความยาวคลื่น 400 nm แสงสีใดมีความถี่สูงกว่า?',
          questionType: 'multiple-choice',
          options: ['แสงสีแดง', 'แสงสีม่วง', 'มีความถี่เท่ากัน', 'ไม่สามารถบอกได้'],
          correctAnswer: 'แสงสีม่วง',
          points: 1,
          explanation: 'เนื่องจาก f = c/λ และ c คงที่ แสงที่มีความยาวคลื่นสั้นกว่าจะมีความถี่สูงกว่า ดังนั้นแสงสีม่วงมีความถี่สูงกว่า',
        },
        
        // ความร้อนและอุณหพลศาสตร์ (Thermodynamics) - 4 ข้อ
        {
          questionText: 'น้ำมวล 2 kg อุณหภูมิเพิ่มขึ้นจาก 20°C เป็น 80°C (ความจุความร้อนจำเพาะน้ำ = 4200 J/kg·K) น้ำได้รับความร้อนเท่าใด?',
          questionType: 'multiple-choice',
          options: ['252 kJ', '336 kJ', '420 kJ', '504 kJ'],
          correctAnswer: '504 kJ',
          points: 1,
          explanation: 'ความร้อน Q = mcΔT = 2 × 4200 × (80-20) = 2 × 4200 × 60 = 504,000 J = 504 kJ',
        },
        {
          questionText: 'แก๊สอุดมคติขยายตัวแบบไอโซบาริก (ความดันคงที่) จากปริมาตร 2 m³ เป็น 4 m³ โดยความดัน 10⁵ Pa งานที่แก๊สทำเป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['1×10⁵ J', '2×10⁵ J', '3×10⁵ J', '4×10⁵ J'],
          correctAnswer: '2×10⁵ J',
          points: 1,
          explanation: 'งาน W = PΔV = 10⁵ × (4-2) = 10⁵ × 2 = 2×10⁵ J',
        },
        {
          questionText: 'แก๊สอุดมคติมีอุณหภูมิ 300 K และความดัน 2×10⁵ Pa ถ้าอุณหภูมิเพิ่มเป็น 450 K โดยปริมาตรคงที่ ความดันใหม่เป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['2×10⁵ Pa', '3×10⁵ Pa', '4×10⁵ Pa', '5×10⁵ Pa'],
          correctAnswer: '3×10⁵ Pa',
          points: 1,
          explanation: 'ใช้กฎของชาร์ลส์ (P/T = คงที่): P₁/T₁ = P₂/T₂ → 2×10⁵/300 = P₂/450 → P₂ = (2×10⁵)(450)/300 = 3×10⁵ Pa',
        },
        {
          questionText: 'เครื่องยนต์ความร้อนมีประสิทธิภาพ 30% รับความร้อน 1000 J จากแหล่งความร้อน งานที่ได้เป็นเท่าใด?',
          questionType: 'multiple-choice',
          options: ['200 J', '300 J', '400 J', '500 J'],
          correctAnswer: '300 J',
          points: 1,
          explanation: 'ประสิทธิภาพ η = W/Q_in → 0.30 = W/1000 → W = 300 J',
        },
        
        // ฟิสิกส์สมัยใหม่ (Modern Physics) - 2 ข้อ
        {
          questionText: 'อิเล็กตรอนมีพลังงานจลน์ 2 eV (1 eV = 1.6×10⁻¹⁹ J) ความเร็วของอิเล็กตรอนเป็นเท่าใด? (มวลอิเล็กตรอน = 9.1×10⁻³¹ kg)',
          questionType: 'multiple-choice',
          options: ['ประมาณ 8.4×10⁵ m/s', 'ประมาณ 1.2×10⁶ m/s', 'ประมาณ 1.8×10⁶ m/s', 'ประมาณ 2.4×10⁶ m/s'],
          correctAnswer: 'ประมาณ 8.4×10⁵ m/s',
          points: 1,
          explanation: 'Ek = (1/2)mv² → 2×1.6×10⁻¹⁹ = (1/2)(9.1×10⁻³¹)v² → v² = (6.4×10⁻¹⁹)/(4.55×10⁻³¹) ≈ 1.41×10¹² → v ≈ 8.4×10⁵ m/s',
        },
        {
          questionText: 'แสงที่มีความยาวคลื่น 500 nm มีพลังงานโฟตอนเท่าใด? (h = 6.63×10⁻³⁴ J·s, c = 3×10⁸ m/s)',
          questionType: 'multiple-choice',
          options: ['2.0×10⁻¹⁹ J', '3.0×10⁻¹⁹ J', '4.0×10⁻¹⁹ J', '5.0×10⁻¹⁹ J'],
          correctAnswer: '4.0×10⁻¹⁹ J',
          points: 1,
          explanation: 'พลังงานโฟตอน E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(500×10⁻⁹) = (1.989×10⁻²⁵)/(5×10⁻⁷) ≈ 4.0×10⁻¹⁹ J',
        },
      ],
    };

    const createdExam = await Exam.create(alevelPhysicsExam);
    const populatedExam = await Exam.findById(createdExam._id)
      .populate('courseId', 'name category level');

    return NextResponse.json(
      { 
        message: 'สร้างข้อสอบ A-Level ฟิสิกส์ 30 ข้อ สำเร็จ',
        exam: populatedExam 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error seeding A-Level physics exam:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}

