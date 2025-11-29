const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection helper
function ensureEncodedCredentials(uri) {
  const credentialPattern = /(mongodb(?:\+srv)?:\/\/)([^@]+)@/;
  const match = uri.match(credentialPattern);

  if (!match) {
    return uri;
  }

  const [, prefix, credentials] = match;
  if (!credentials.includes(':')) {
    return uri;
  }

  const [username, password] = credentials.split(':');

  const safeUsername = encodeURIComponent(username);
  const safePassword = encodeURIComponent(password);

  return uri.replace(
    credentialPattern,
    `${prefix}${safeUsername}:${safePassword}@`
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

async function createTPAT1Course() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find TPAT section
    const tpatSection = await Section.findOne({ name: 'TPAT' });
    if (!tpatSection) {
      throw new Error('TPAT section not found');
    }
    console.log('Found TPAT section:', tpatSection._id);

    // Find TPAT 1 category
    const tpat1Category = await Category.findOne({ name: 'TPAT 1', sectionId: tpatSection._id });
    if (!tpat1Category) {
      throw new Error('TPAT 1 category not found');
    }
    console.log('Found TPAT 1 category:', tpat1Category._id);

    // Check if course already exists
    let course = await Course.findOne({ 
      name: 'TPAT 1 - ความถนัดทางแพทยศาสตร์',
      categoryId: tpat1Category._id 
    });

    const courseData = {
      name: 'TPAT 1 - ความถนัดทางแพทยศาสตร์',
      description: 'หลักสูตรเตรียมสอบ TPAT 1 (ความถนัดทางแพทยศาสตร์) สำหรับนักเรียนที่ต้องการศึกษาต่อในสาขาวิชาชีพทางการแพทย์ เช่น แพทยศาสตร์ ทันตแพทยศาสตร์ สัตวแพทยศาสตร์ และเภสัชศาสตร์ ครอบคลุมเนื้อหาทั้ง 3 พาร์ต: พาร์ตเชาวน์ปัญญา พาร์ตจริยธรรมทางการแพทย์ และพาร์ตความคิดเชื่อมโยง',
      category: null,
      level: 'เตรียมสอบเข้า',
      sectionId: tpatSection._id,
      categoryId: tpat1Category._id,
      price: 6500,
      schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
      duration: '6 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'พาร์ตเชาวน์ปัญญา (100 คะแนน)',
          description: 'พัฒนาทักษะการคิดวิเคราะห์และแก้ปัญหาอย่างเป็นระบบ ครอบคลุมการคิดเชิงตรรกะ การวิเคราะห์ข้อมูล และการแก้ปัญหาที่ซับซ้อน',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พื้นฐานการคิดวิเคราะห์',
              description: 'เรียนรู้หลักการคิดวิเคราะห์ การแยกแยะข้อมูล และการระบุประเด็นสำคัญ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การคิดเชิงตรรกะ',
              description: 'ศึกษาเกี่ยวกับตรรกะพื้นฐาน การใช้เหตุผล และการวิเคราะห์ความสัมพันธ์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อมูลและสถิติ',
              description: 'เรียนรู้การอ่านและวิเคราะห์ข้อมูลทางสถิติ กราฟ และตาราง',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแก้ปัญหาอย่างเป็นระบบ',
              description: 'ฝึกทักษะการแก้ปัญหาที่ซับซ้อนด้วยวิธีการที่เป็นระบบและมีประสิทธิภาพ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดเชาวน์ปัญญา',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตเชาวน์ปัญญา',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'พาร์ตจริยธรรมทางการแพทย์ (100 คะแนน)',
          description: 'ศึกษาเกี่ยวกับจริยธรรมและจรรยาบรรณในวิชาชีพแพทย์ ครอบคลุมหลักการทางจริยธรรมทางการแพทย์ สิทธิผู้ป่วย และกรณีศึกษาต่างๆ',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'หลักจริยธรรมทางการแพทย์',
              description: 'เรียนรู้หลักการพื้นฐานของจริยธรรมทางการแพทย์ เช่น หลักอัตโนมัติ หลักคุณธรรม หลักประโยชน์ และหลักความยุติธรรม',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'จรรยาบรรณวิชาชีพแพทย์',
              description: 'ศึกษาเกี่ยวกับจรรยาบรรณของแพทยสภาและหลักปฏิบัติที่ถูกต้องในวิชาชีพแพทย์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สิทธิผู้ป่วยและความยินยอม',
              description: 'เรียนรู้เกี่ยวกับสิทธิผู้ป่วย การขอความยินยอม และการรักษาความลับ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'จริยธรรมในการวิจัยทางการแพทย์',
              description: 'ศึกษาเกี่ยวกับหลักจริยธรรมในการทำวิจัยทางการแพทย์และการทดลองทางคลินิก',
              order: 4,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรณีศึกษาจริยธรรมทางการแพทย์',
              description: 'วิเคราะห์กรณีศึกษาจริยธรรมทางการแพทย์ที่เกิดขึ้นจริงและฝึกการตัดสินใจ',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดจริยธรรมทางการแพทย์',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตจริยธรรมทางการแพทย์',
              order: 6,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'พาร์ตความคิดเชื่อมโยง (100 คะแนน)',
          description: 'พัฒนาทักษะการคิดเชื่อมโยงและการวิเคราะห์ข้อมูล ครอบคลุมการเชื่อมโยงข้อมูล การหาความสัมพันธ์ และการสรุปผล',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พื้นฐานการคิดเชื่อมโยง',
              description: 'เรียนรู้หลักการคิดเชื่อมโยงและการหาความสัมพันธ์ระหว่างข้อมูล',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ความสัมพันธ์',
              description: 'ศึกษาเกี่ยวกับการวิเคราะห์ความสัมพันธ์ระหว่างตัวแปร ข้อมูล และแนวคิดต่างๆ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเชื่อมโยงข้อมูลจากหลายแหล่ง',
              description: 'ฝึกทักษะการเชื่อมโยงและสังเคราะห์ข้อมูลจากหลายแหล่งเข้าด้วยกัน',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การสรุปผลและการตีความ',
              description: 'เรียนรู้การสรุปผลจากการวิเคราะห์และการตีความข้อมูลอย่างถูกต้อง',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การคิดเชื่อมโยงในบริบททางการแพทย์',
              description: 'ฝึกการคิดเชื่อมโยงในบริบททางการแพทย์ เช่น การเชื่อมโยงอาการกับโรค การเชื่อมโยงการรักษากับผลลัพธ์',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แบบฝึกหัดความคิดเชื่อมโยง',
              description: 'ฝึกทำแบบฝึกหัดและข้อสอบจำลองพาร์ตความคิดเชื่อมโยง',
              order: 6,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ข้อสอบจำลอง TPAT 1',
          description: 'ฝึกทำข้อสอบจำลอง TPAT 1 แบบเต็มรูปแบบ เพื่อเตรียมความพร้อมก่อนสอบจริง',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบจำลองชุดที่ 1',
              description: 'ฝึกทำข้อสอบจำลอง TPAT 1 ชุดที่ 1 พร้อมเฉลยและอธิบาย',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 2',
              description: 'ฝึกทำข้อสอบจำลอง TPAT 1 ชุดที่ 2 พร้อมเฉลยและอธิบาย',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลองชุดที่ 3',
              description: 'ฝึกทำข้อสอบจำลอง TPAT 1 ชุดที่ 3 พร้อมเฉลยและอธิบาย',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อสอบและเทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคการทำข้อสอบ TPAT 1 ให้ได้คะแนนสูงและการจัดการเวลา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    if (course) {
      // Update existing course
      console.log('Updating existing TPAT 1 course...');
      course.set(courseData);
      await course.save();
      console.log('Course updated successfully!');
    } else {
      // Create new course
      console.log('Creating new TPAT 1 course...');
      course = await Course.create(courseData);
      console.log('Course created successfully!');
    }

    console.log('\nCourse Details:');
    console.log('- Name:', course.name);
    console.log('- Description:', course.description);
    console.log('- Price:', course.price);
    console.log('- Duration:', course.duration);
    console.log('- Lessons:', course.lessons.length);
    console.log('- Total SubLessons:', course.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTPAT1Course();

