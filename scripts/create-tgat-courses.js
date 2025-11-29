const mongoose = require('mongoose');
require('dotenv').config();

function ensureEncodedCredentials(uri) {
  if (!uri.includes('@')) {
    return uri;
  }

  const [prefix, rest] = uri.split('://');
  const [credentials, host] = rest.split('@');
  const [username, password] = credentials.split(':');

  const safeUsername = encodeURIComponent(username);
  const safePassword = encodeURIComponent(password);

  return (
    `${prefix}://${safeUsername}:${safePassword}@${host}`
  );
}

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';
const MONGODB_URI = ensureEncodedCredentials(rawUri);

// Course Schema (simplified for script)
const CourseSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  level: String,
  sectionId: mongoose.Schema.Types.ObjectId,
  categoryId: mongoose.Schema.Types.ObjectId,
  price: Number,
  schedule: String,
  image: String,
  duration: String,
  maxStudents: Number,
  isOnline: Boolean,
  isOnsite: Boolean,
  isActive: Boolean,
  endDate: Date,
  lessons: [{
    title: String,
    description: String,
    order: Number,
    youtubeLink: String,
    subLessons: [{
      title: String,
      description: String,
      order: Number,
      duration: String,
      youtubeLink: String,
    }],
  }],
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const Section = mongoose.models.Section || mongoose.model('Section', new mongoose.Schema({}, { strict: false }));
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

async function createTGATCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find TGAT section
    const tgatSection = await Section.findOne({ name: 'TGAT' });
    if (!tgatSection) {
      throw new Error('TGAT section not found');
    }
    console.log('Found TGAT section:', tgatSection._id);

    // Find TGAT categories
    const tgat1Category = await Category.findOne({ name: 'TGAT 1', sectionId: tgatSection._id });
    const tgat2Category = await Category.findOne({ name: 'TGAT 2', sectionId: tgatSection._id });
    const tgat3Category = await Category.findOne({ name: 'TGAT 3', sectionId: tgatSection._id });

    if (!tgat1Category || !tgat2Category || !tgat3Category) {
      throw new Error('TGAT categories not found');
    }
    console.log('Found TGAT categories:', {
      tgat1: tgat1Category._id,
      tgat2: tgat2Category._id,
      tgat3: tgat3Category._id
    });

    // TGAT 1: English Communication
    const tgat1Data = {
      name: 'TGAT 1 - การสื่อสารภาษาอังกฤษ (English Communication)',
      description: 'หลักสูตรเตรียมสอบ TGAT 1 (การสื่อสารภาษาอังกฤษ) สำหรับนักเรียนที่ต้องการพัฒนาทักษะการสื่อสารภาษาอังกฤษทั้ง 4 ด้าน ได้แก่ การฟัง (Listening) การพูด (Speaking) การอ่าน (Reading) และการเขียน (Writing) เพื่อใช้ในการสอบ TGAT และการสื่อสารในชีวิตประจำวัน',
      category: null,
      level: 'เตรียมสอบเข้า',
      sectionId: tgatSection._id,
      categoryId: tgat1Category._id,
      price: 5500,
      schedule: 'จันทร์-พุธ-ศุกร์ 18:00-20:00',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      duration: '5 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'การฟัง (Listening)',
          description: 'พัฒนาทักษะการฟังภาษาอังกฤษเพื่อความเข้าใจ ครอบคลุมการฟังบทสนทนา การบรรยาย และการจับใจความสำคัญ',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พื้นฐานการฟังภาษาอังกฤษ',
              description: 'เรียนรู้เทคนิคการฟังภาษาอังกฤษเบื้องต้น การจับใจความสำคัญ และการทำความเข้าใจบริบท',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การฟังบทสนทนา (Conversations)',
              description: 'ฝึกฟังบทสนทนาในสถานการณ์ต่างๆ เช่น การสนทนาในร้านอาหาร ที่โรงพยาบาล ในโรงเรียน',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การฟังการบรรยาย (Lectures)',
              description: 'ฝึกฟังการบรรยายทางวิชาการ การจดบันทึก และการสรุปใจความสำคัญ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การฟังข่าวและรายการ',
              description: 'ฝึกฟังข่าว รายการโทรทัศน์ และพอดแคสต์ภาษาอังกฤษ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการฟัง',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตการฟัง',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การอ่าน (Reading)',
          description: 'พัฒนาทักษะการอ่านภาษาอังกฤษเพื่อความเข้าใจ ครอบคลุมการอ่านบทความ บทความวิชาการ และการวิเคราะห์ข้อความ',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เทคนิคการอ่านเร็ว (Speed Reading)',
              description: 'เรียนรู้เทคนิคการอ่านเร็ว การสแกน (Scanning) และการสกิม (Skimming)',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอ่านเพื่อความเข้าใจ (Reading Comprehension)',
              description: 'ฝึกการอ่านบทความและทำความเข้าใจเนื้อหา การหาหัวข้อหลัก และรายละเอียดสนับสนุน',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอ่านบทความวิชาการ (Academic Reading)',
              description: 'ฝึกการอ่านบทความวิชาการ การวิเคราะห์ข้อความ และการสรุปใจความสำคัญ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอ่านข่าวและบทความทั่วไป',
              description: 'ฝึกการอ่านข่าว บทความนิตยสาร และบล็อกโพสต์ภาษาอังกฤษ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คำศัพท์และบริบท (Vocabulary in Context)',
              description: 'เรียนรู้การเดาความหมายคำศัพท์จากบริบท และการเพิ่มพูนคำศัพท์',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการอ่าน',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตการอ่าน',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การเขียน (Writing)',
          description: 'พัฒนาทักษะการเขียนภาษาอังกฤษ ครอบคลุมการเขียนย่อหน้า เรียงความ จดหมาย และการเขียนเชิงวิชาการ',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พื้นฐานการเขียนภาษาอังกฤษ',
              description: 'เรียนรู้โครงสร้างประโยค การใช้เครื่องหมายวรรคตอน และหลักไวยากรณ์พื้นฐาน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนย่อหน้า (Paragraph Writing)',
              description: 'เรียนรู้โครงสร้างย่อหน้า การเขียนประโยคหัวข้อ และประโยคสนับสนุน',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเรียงความ (Essay Writing)',
              description: 'ฝึกการเขียนเรียงความประเภทต่างๆ เช่น Descriptive, Narrative, Argumentative, Compare and Contrast',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนจดหมายและอีเมล',
              description: 'เรียนรู้การเขียนจดหมายทางการและไม่เป็นทางการ การเขียนอีเมล และการเขียนข้อความ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเชิงวิชาการ (Academic Writing)',
              description: 'ฝึกการเขียนรายงาน การสรุป และการเขียนเชิงวิชาการ',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการเขียน',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตการเขียน',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การพูด (Speaking)',
          description: 'พัฒนาทักษะการพูดภาษาอังกฤษ ครอบคลุมการออกเสียง การสนทนา และการนำเสนอ',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การออกเสียง (Pronunciation)',
              description: 'เรียนรู้การออกเสียงภาษาอังกฤษที่ถูกต้อง เสียงพยัญชนะ สระ และการเน้นเสียง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การสนทนาในสถานการณ์ต่างๆ',
              description: 'ฝึกการสนทนาในสถานการณ์ต่างๆ เช่น การแนะนำตัว การซื้อของ การถามทาง',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแสดงความคิดเห็นและการอภิปราย',
              description: 'ฝึกการแสดงความคิดเห็น การอภิปราย และการโต้แย้งอย่างมีเหตุผล',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การนำเสนอ (Presentation)',
              description: 'เรียนรู้เทคนิคการนำเสนอภาษาอังกฤษ การใช้ภาษากาย และการสื่อสารที่มีประสิทธิภาพ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการพูด',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตการพูด',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ไวยากรณ์และคำศัพท์ (Grammar and Vocabulary)',
          description: 'เรียนรู้ไวยากรณ์ภาษาอังกฤษที่สำคัญและเพิ่มพูนคำศัพท์',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'Tenses และการใช้',
              description: 'เรียนรู้ Tenses ต่างๆ และการใช้ที่ถูกต้อง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'Parts of Speech',
              description: 'ศึกษาเกี่ยวกับ Noun, Verb, Adjective, Adverb และการใช้',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ประโยคซับซ้อน (Complex Sentences)',
              description: 'เรียนรู้การสร้างประโยคซับซ้อน การใช้ Relative Clauses และ Conditional Sentences',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คำศัพท์ที่ใช้บ่อย',
              description: 'เรียนรู้คำศัพท์ที่ใช้บ่อยในการสอบและชีวิตประจำวัน',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'Idioms และ Phrasal Verbs',
              description: 'เรียนรู้ Idioms และ Phrasal Verbs ที่ใช้บ่อย',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ข้อสอบจำลอง TGAT 1',
          description: 'ฝึกทำข้อสอบจำลอง TGAT 1 แบบเต็มรูปแบบ เพื่อเตรียมความพร้อมก่อนสอบจริง',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบจำลองชุดที่ 1',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 1 ชุดที่ 1 พร้อมเฉลยและอธิบาย',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 2',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 1 ชุดที่ 2 พร้อมเฉลยและอธิบาย',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 3',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 1 ชุดที่ 3 พร้อมเฉลยและอธิบาย',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อสอบและเทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคการทำข้อสอบ TGAT 1 ให้ได้คะแนนสูงและการจัดการเวลา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // TGAT 2: Critical and Logical Thinking
    const tgat2Data = {
      name: 'TGAT 2 - การคิดอย่างมีเหตุผล (Critical and Logical Thinking)',
      description: 'หลักสูตรเตรียมสอบ TGAT 2 (การคิดอย่างมีเหตุผล) สำหรับนักเรียนที่ต้องการพัฒนาทักษะการคิดวิเคราะห์ การใช้เหตุผลเชิงตรรกะ และการแก้ปัญหาอย่างเป็นระบบ ครอบคลุมการวิเคราะห์ข้อมูล การประเมินข้อโต้แย้ง และการแก้ปัญหาทางคณิตศาสตร์พื้นฐาน',
      category: null,
      level: 'เตรียมสอบเข้า',
      sectionId: tgatSection._id,
      categoryId: tgat2Category._id,
      price: 5500,
      schedule: 'อังคาร-พฤหัสบดี 18:00-20:00',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      duration: '5 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'พื้นฐานการคิดวิเคราะห์ (Critical Thinking Basics)',
          description: 'เรียนรู้หลักการคิดวิเคราะห์ การแยกแยะข้อมูล และการระบุประเด็นสำคัญ',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'หลักการคิดวิเคราะห์',
              description: 'เรียนรู้หลักการพื้นฐานของการคิดวิเคราะห์ การตั้งคำถาม และการแยกแยะข้อมูล',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การระบุประเด็นสำคัญ',
              description: 'ฝึกการระบุประเด็นหลักและประเด็นรอง การแยกแยะข้อเท็จจริงและความคิดเห็น',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อความ',
              description: 'เรียนรู้การวิเคราะห์ข้อความ การหาหลักฐานสนับสนุน และการสรุปผล',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการคิดวิเคราะห์',
              description: 'ฝึกทำแบบฝึกหัดการคิดวิเคราะห์เบื้องต้น',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การคิดเชิงตรรกะ (Logical Thinking)',
          description: 'ศึกษาเกี่ยวกับตรรกะพื้นฐาน การใช้เหตุผล และการวิเคราะห์ความสัมพันธ์',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ตรรกะพื้นฐาน (Basic Logic)',
              description: 'เรียนรู้ตรรกะพื้นฐาน ประพจน์ และการเชื่อมประพจน์',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การใช้เหตุผล (Reasoning)',
              description: 'ศึกษาเกี่ยวกับการให้เหตุผลแบบอุปนัย (Inductive) และนิรนัย (Deductive)',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ความสัมพันธ์',
              description: 'ฝึกการวิเคราะห์ความสัมพันธ์ระหว่างตัวแปร ข้อมูล และแนวคิดต่างๆ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การหาข้อสรุป (Inference)',
              description: 'เรียนรู้การหาข้อสรุปจากข้อมูลที่กำหนด และการตรวจสอบความถูกต้อง',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการคิดเชิงตรรกะ',
              description: 'ฝึกทำแบบฝึกหัดการคิดเชิงตรรกะ',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การวิเคราะห์ข้อมูลและสถิติ (Data Analysis)',
          description: 'เรียนรู้การอ่านและวิเคราะห์ข้อมูลทางสถิติ กราฟ และตาราง',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การอ่านตารางและกราฟ',
              description: 'เรียนรู้การอ่านและตีความตาราง กราฟเส้น กราฟแท่ง และกราฟวงกลม',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สถิติพื้นฐาน',
              description: 'ศึกษาเกี่ยวกับค่าเฉลี่ย มัธยฐาน ฐานนิยม และการกระจายข้อมูล',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อมูล',
              description: 'ฝึกการวิเคราะห์ข้อมูล การหาความสัมพันธ์ และการสรุปผล',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การประเมินความน่าเชื่อถือของข้อมูล',
              description: 'เรียนรู้การประเมินความน่าเชื่อถือของข้อมูลและแหล่งที่มา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการวิเคราะห์ข้อมูล',
              description: 'ฝึกทำแบบฝึกหัดการวิเคราะห์ข้อมูลและสถิติ',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การแก้ปัญหาทางคณิตศาสตร์ (Mathematical Problem Solving)',
          description: 'ฝึกทักษะการแก้ปัญหาทางคณิตศาสตร์พื้นฐานและการใช้เหตุผลทางคณิตศาสตร์',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การแก้ปัญหาแบบเป็นขั้นตอน',
              description: 'เรียนรู้วิธีการแก้ปัญหาทางคณิตศาสตร์แบบเป็นขั้นตอน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คณิตศาสตร์พื้นฐาน',
              description: 'ทบทวนคณิตศาสตร์พื้นฐานที่จำเป็น เช่น พีชคณิต เรขาคณิต และสถิติ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแก้ปัญหาที่ซับซ้อน',
              description: 'ฝึกการแก้ปัญหาทางคณิตศาสตร์ที่ซับซ้อนและใช้หลายแนวคิด',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การตรวจสอบคำตอบ',
              description: 'เรียนรู้วิธีการตรวจสอบความถูกต้องของคำตอบ',
              order: 4,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการแก้ปัญหาทางคณิตศาสตร์',
              description: 'ฝึกทำแบบฝึกหัดการแก้ปัญหาทางคณิตศาสตร์',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การประเมินข้อโต้แย้ง (Argument Evaluation)',
          description: 'เรียนรู้การประเมินข้อโต้แย้ง การระบุข้อสมมติฐาน และการหาข้อบกพร่องในการให้เหตุผล',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โครงสร้างของข้อโต้แย้ง',
              description: 'เรียนรู้โครงสร้างของข้อโต้แย้ง ข้อสมมติฐาน และข้อสรุป',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การระบุข้อสมมติฐาน',
              description: 'ฝึกการระบุข้อสมมติฐานที่ซ่อนอยู่ในข้อโต้แย้ง',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อบกพร่องในการให้เหตุผล (Logical Fallacies)',
              description: 'เรียนรู้ข้อบกพร่องในการให้เหตุผลที่พบบ่อย เช่น Ad Hominem, Straw Man',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การประเมินความแข็งแกร่งของข้อโต้แย้ง',
              description: 'ฝึกการประเมินความแข็งแกร่งของข้อโต้แย้งและการหาหลักฐานสนับสนุน',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการประเมินข้อโต้แย้ง',
              description: 'ฝึกทำแบบฝึกหัดการประเมินข้อโต้แย้ง',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การตัดสินใจและการแก้ปัญหา (Decision Making and Problem Solving)',
          description: 'เรียนรู้กระบวนการตัดสินใจและการแก้ปัญหาอย่างเป็นระบบ',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'กระบวนการตัดสินใจ',
              description: 'เรียนรู้กระบวนการตัดสินใจ การระบุทางเลือก และการประเมินผล',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแก้ปัญหาอย่างเป็นระบบ',
              description: 'ฝึกการแก้ปัญหาอย่างเป็นระบบ การระบุปัญหา และการหาวิธีแก้ไข',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การคิดนอกกรอบ (Creative Thinking)',
              description: 'เรียนรู้การคิดนอกกรอบและการหาวิธีแก้ปัญหาที่สร้างสรรค์',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรณีศึกษา',
              description: 'วิเคราะห์กรณีศึกษาการตัดสินใจและการแก้ปัญหา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการตัดสินใจและการแก้ปัญหา',
              description: 'ฝึกทำแบบฝึกหัดการตัดสินใจและการแก้ปัญหา',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ข้อสอบจำลอง TGAT 2',
          description: 'ฝึกทำข้อสอบจำลอง TGAT 2 แบบเต็มรูปแบบ เพื่อเตรียมความพร้อมก่อนสอบจริง',
          order: 7,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบจำลองชุดที่ 1',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 2 ชุดที่ 1 พร้อมเฉลยและอธิบาย',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 2',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 2 ชุดที่ 2 พร้อมเฉลยและอธิบาย',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 3',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 2 ชุดที่ 3 พร้อมเฉลยและอธิบาย',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อสอบและเทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคการทำข้อสอบ TGAT 2 ให้ได้คะแนนสูงและการจัดการเวลา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // TGAT 3: Future Workforce Competencies
    const tgat3Data = {
      name: 'TGAT 3 - สมรรถนะการทำงานในอนาคต (Future Workforce Competencies)',
      description: 'หลักสูตรเตรียมสอบ TGAT 3 (สมรรถนะการทำงานในอนาคต) สำหรับนักเรียนที่ต้องการพัฒนาทักษะที่จำเป็นสำหรับการทำงานในอนาคต ครอบคลุมการสร้างคุณค่าและนวัตกรรม การแก้ปัญหาที่ซับซ้อน การบริหารจัดการอารมณ์ และการมีส่วนร่วมและรับผิดชอบต่อสังคม',
      category: null,
      level: 'เตรียมสอบเข้า',
      sectionId: tgatSection._id,
      categoryId: tgat3Category._id,
      price: 5500,
      schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      duration: '5 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'การสร้างคุณค่าและนวัตกรรม (Value Creation and Innovation)',
          description: 'เรียนรู้การสร้างคุณค่าและนวัตกรรม การคิดสร้างสรรค์ และการพัฒนาผลิตภัณฑ์หรือบริการใหม่',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'หลักการสร้างคุณค่า',
              description: 'เรียนรู้หลักการสร้างคุณค่า การระบุความต้องการของลูกค้า และการสร้างโซลูชัน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การคิดสร้างสรรค์ (Creative Thinking)',
              description: 'ศึกษาเกี่ยวกับการคิดสร้างสรรค์ เทคนิคการระดมสมอง และการคิดนอกกรอบ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กระบวนการนวัตกรรม',
              description: 'เรียนรู้กระบวนการนวัตกรรม ตั้งแต่การระบุปัญหาไปจนถึงการนำเสนอโซลูชัน',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การพัฒนาผลิตภัณฑ์และบริการ',
              description: 'ฝึกการพัฒนาผลิตภัณฑ์และบริการใหม่ที่ตอบสนองความต้องการ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรณีศึกษานวัตกรรม',
              description: 'วิเคราะห์กรณีศึกษานวัตกรรมที่ประสบความสำเร็จ',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการสร้างคุณค่าและนวัตกรรม',
              description: 'ฝึกทำแบบฝึกหัดการสร้างคุณค่าและนวัตกรรม',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การแก้ปัญหาที่ซับซ้อน (Complex Problem Solving)',
          description: 'พัฒนาทักษะการแก้ปัญหาที่ซับซ้อน การวิเคราะห์ปัญหา และการหาวิธีแก้ไขที่มีประสิทธิภาพ',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การระบุและวิเคราะห์ปัญหา',
              description: 'เรียนรู้การระบุปัญหา การวิเคราะห์สาเหตุ และการกำหนดขอบเขตของปัญหา',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการแก้ปัญหา',
              description: 'ศึกษาเทคนิคการแก้ปัญหาต่างๆ เช่น Root Cause Analysis, SWOT Analysis',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแก้ปัญหาที่มีหลายตัวแปร',
              description: 'ฝึกการแก้ปัญหาที่มีหลายตัวแปรและปัจจัยที่เกี่ยวข้อง',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การประเมินและเลือกวิธีแก้ไข',
              description: 'เรียนรู้การประเมินทางเลือกและเลือกวิธีแก้ไขที่เหมาะสมที่สุด',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การนำวิธีแก้ไขไปปฏิบัติ',
              description: 'ฝึกการวางแผนและนำวิธีแก้ไขไปปฏิบัติอย่างเป็นระบบ',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรณีศึกษาและการแก้ปัญหา',
              description: 'วิเคราะห์กรณีศึกษาการแก้ปัญหาที่ซับซ้อน',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการแก้ปัญหาที่ซับซ้อน',
              description: 'ฝึกทำแบบฝึกหัดการแก้ปัญหาที่ซับซ้อน',
              order: 7,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การบริหารจัดการอารมณ์ (Emotional Governance)',
          description: 'เรียนรู้การบริหารจัดการอารมณ์ ความฉลาดทางอารมณ์ (EQ) และการทำงานร่วมกับผู้อื่น',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ความฉลาดทางอารมณ์ (Emotional Intelligence)',
              description: 'เรียนรู้ความฉลาดทางอารมณ์ การรู้จักอารมณ์ของตนเองและผู้อื่น',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การบริหารจัดการอารมณ์ตนเอง',
              description: 'ฝึกการบริหารจัดการอารมณ์ตนเอง การควบคุมความเครียด และการจัดการกับอารมณ์เชิงลบ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเข้าใจอารมณ์ผู้อื่น (Empathy)',
              description: 'เรียนรู้การเข้าใจอารมณ์และความรู้สึกของผู้อื่น การเอาใจใส่',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การสื่อสารที่มีประสิทธิภาพ',
              description: 'ฝึกการสื่อสารที่มีประสิทธิภาพ การฟังอย่างตั้งใจ และการแสดงออกอย่างเหมาะสม',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การจัดการความขัดแย้ง',
              description: 'เรียนรู้การจัดการความขัดแย้งและการแก้ปัญหาความไม่เข้าใจ',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการบริหารจัดการอารมณ์',
              description: 'ฝึกทำแบบฝึกหัดการบริหารจัดการอารมณ์',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การมีส่วนร่วมและรับผิดชอบต่อสังคม (Civic Engagement)',
          description: 'เรียนรู้การมีส่วนร่วมในสังคม การรับผิดชอบต่อสังคม และการเป็นพลเมืองที่ดี',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'บทบาทของพลเมืองในสังคม',
              description: 'เรียนรู้บทบาทของพลเมืองในสังคม สิทธิและหน้าที่พลเมือง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การมีส่วนร่วมในสังคม',
              description: 'ศึกษาเกี่ยวกับการมีส่วนร่วมในสังคม การเป็นอาสาสมัคร และการช่วยเหลือชุมชน',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ความรับผิดชอบต่อสังคม (Social Responsibility)',
              description: 'เรียนรู้ความรับผิดชอบต่อสังคม การดูแลสิ่งแวดล้อม และการพัฒนาที่ยั่งยืน',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเป็นผู้นำและการทำงานเป็นทีม',
              description: 'ฝึกการเป็นผู้นำ การทำงานเป็นทีม และการสร้างแรงบันดาลใจ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแก้ปัญหาสังคม',
              description: 'เรียนรู้การระบุและแก้ปัญหาสังคม การสร้างการเปลี่ยนแปลงเชิงบวก',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรณีศึกษาการมีส่วนร่วมในสังคม',
              description: 'วิเคราะห์กรณีศึกษาการมีส่วนร่วมในสังคมและการสร้างการเปลี่ยนแปลง',
              order: 6,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดการมีส่วนร่วมและรับผิดชอบต่อสังคม',
              description: 'ฝึกทำแบบฝึกหัดการมีส่วนร่วมและรับผิดชอบต่อสังคม',
              order: 7,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ทักษะการทำงานในอนาคต (Future Work Skills)',
          description: 'เรียนรู้ทักษะที่จำเป็นสำหรับการทำงานในอนาคต เช่น การเรียนรู้ตลอดชีวิต การปรับตัว และการใช้เทคโนโลยี',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การเรียนรู้ตลอดชีวิต (Lifelong Learning)',
              description: 'เรียนรู้ความสำคัญของการเรียนรู้ตลอดชีวิตและการพัฒนาตนเอง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การปรับตัวและการเปลี่ยนแปลง',
              description: 'ฝึกการปรับตัวกับการเปลี่ยนแปลงและการรับมือกับความไม่แน่นอน',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การใช้เทคโนโลยี',
              description: 'เรียนรู้การใช้เทคโนโลยีในการทำงานและการเรียนรู้',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การทำงานแบบดิจิทัล',
              description: 'ศึกษาเกี่ยวกับการทำงานแบบดิจิทัล การทำงานระยะไกล และการสื่อสารออนไลน์',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การจัดการเวลาและงาน',
              description: 'เรียนรู้การจัดการเวลา การจัดลำดับความสำคัญ และการทำงานอย่างมีประสิทธิภาพ',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดทักษะการทำงานในอนาคต',
              description: 'ฝึกทำแบบฝึกหัดทักษะการทำงานในอนาคต',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ข้อสอบจำลอง TGAT 3',
          description: 'ฝึกทำข้อสอบจำลอง TGAT 3 แบบเต็มรูปแบบ เพื่อเตรียมความพร้อมก่อนสอบจริง',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบจำลองชุดที่ 1',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 3 ชุดที่ 1 พร้อมเฉลยและอธิบาย',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 2',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 3 ชุดที่ 2 พร้อมเฉลยและอธิบาย',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 3',
              description: 'ฝึกทำข้อสอบจำลอง TGAT 3 ชุดที่ 3 พร้อมเฉลยและอธิบาย',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อสอบและเทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคการทำข้อสอบ TGAT 3 ให้ได้คะแนนสูงและการจัดการเวลา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // Create or update TGAT 1
    let course1 = await Course.findOne({ 
      name: tgat1Data.name,
      categoryId: tgat1Category._id 
    });

    if (course1) {
      console.log('Updating existing TGAT 1 course...');
      course1.set(tgat1Data);
      await course1.save();
      console.log('TGAT 1 course updated successfully!');
    } else {
      console.log('Creating new TGAT 1 course...');
      course1 = await Course.create(tgat1Data);
      console.log('TGAT 1 course created successfully!');
    }

    // Create or update TGAT 2
    let course2 = await Course.findOne({ 
      name: tgat2Data.name,
      categoryId: tgat2Category._id 
    });

    if (course2) {
      console.log('Updating existing TGAT 2 course...');
      course2.set(tgat2Data);
      await course2.save();
      console.log('TGAT 2 course updated successfully!');
    } else {
      console.log('Creating new TGAT 2 course...');
      course2 = await Course.create(tgat2Data);
      console.log('TGAT 2 course created successfully!');
    }

    // Create or update TGAT 3
    let course3 = await Course.findOne({ 
      name: tgat3Data.name,
      categoryId: tgat3Category._id 
    });

    if (course3) {
      console.log('Updating existing TGAT 3 course...');
      course3.set(tgat3Data);
      await course3.save();
      console.log('TGAT 3 course updated successfully!');
    } else {
      console.log('Creating new TGAT 3 course...');
      course3 = await Course.create(tgat3Data);
      console.log('TGAT 3 course created successfully!');
    }

    console.log('\n=== Course Details ===');
    console.log('\nTGAT 1:');
    console.log('- Name:', course1.name);
    console.log('- Price:', course1.price);
    console.log('- Duration:', course1.duration);
    console.log('- Lessons:', course1.lessons.length);
    console.log('- Total SubLessons:', course1.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0));

    console.log('\nTGAT 2:');
    console.log('- Name:', course2.name);
    console.log('- Price:', course2.price);
    console.log('- Duration:', course2.duration);
    console.log('- Lessons:', course2.lessons.length);
    console.log('- Total SubLessons:', course2.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0));

    console.log('\nTGAT 3:');
    console.log('- Name:', course3.name);
    console.log('- Price:', course3.price);
    console.log('- Duration:', course3.duration);
    console.log('- Lessons:', course3.lessons.length);
    console.log('- Total SubLessons:', course3.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTGATCourses();


