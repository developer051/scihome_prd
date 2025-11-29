const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

function ensureEncodedCredentials(uri) {
  const urlPattern = /^mongodb:\/\/([^:]+):([^@]+)@(.+)$/;
  const match = uri.match(urlPattern);
  
  if (!match) return uri;
  
  const [, username, password, host] = match;
  const prefix = uri.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
  const safeUsername = encodeURIComponent(username);
  const safePassword = encodeURIComponent(password);

  return (
    `${prefix}://${safeUsername}:${safePassword}@${host}`
  );
}

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';
const MONGODB_URI = ensureEncodedCredentials(rawUri);

// Course Schema
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

async function createOrUpdateEngineeringPrepCourse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // หา Section "คอร์สวิศวะ"
    const engineeringSection = await Section.findOne({ name: 'คอร์สวิศวะ' });
    if (!engineeringSection) {
      throw new Error('ไม่พบ Section "คอร์สวิศวะ"');
    }
    console.log('Found Section:', engineeringSection.name);

    // หา Category "Online" ใน Section วิศวะ
    const onlineCategory = await Category.findOne({ 
      name: 'Online',
      sectionId: engineeringSection._id 
    });
    if (!onlineCategory) {
      throw new Error('ไม่พบ Category "Online" สำหรับคอร์สวิศวะ');
    }
    console.log('Found Category:', onlineCategory.name);

    // ค้นหาหลักสูตร "เตรียมความพร้อม - วิศวกรรมศาสตร์"
    let course = await Course.findOne({ 
      name: { $regex: /เตรียมความพร้อม.*วิศวกรรมศาสตร์/i }
    });

    const courseData = {
      name: 'เตรียมความพร้อม - วิศวกรรมศาสตร์',
      description: 'หลักสูตรเตรียมความพร้อมสำหรับการสอบเข้าคณะวิศวกรรมศาสตร์ ครอบคลุมเนื้อหาคณิตศาสตร์ ฟิสิกส์ และเคมีที่จำเป็นสำหรับการสอบ PAT2 และ PAT3 เน้นการทำโจทย์ปัญหา เทคนิคการคิดวิเคราะห์ และการประยุกต์ใช้ความรู้ในสถานการณ์จริง พร้อมข้อสอบย้อนหลังและแนวข้อสอบที่อัปเดตตามรูปแบบการสอบล่าสุด',
      category: null,
      level: 'เตรียมสอบเข้า',
      sectionId: engineeringSection._id,
      categoryId: onlineCategory._id,
      price: 6500,
      schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      duration: '6 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'คณิตศาสตร์พื้นฐานสำหรับวิศวกรรมศาสตร์',
          description: 'ทบทวนและเสริมสร้างพื้นฐานคณิตศาสตร์ที่จำเป็นสำหรับการสอบเข้าคณะวิศวกรรมศาสตร์ ครอบคลุมพีชคณิต ตรีโกณมิติ ฟังก์ชัน และลอการิทึม',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พีชคณิตและสมการ',
              description: 'ทบทวนพีชคณิตพื้นฐาน การแก้สมการและอสมการ รวมถึงระบบสมการ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ตรีโกณมิติ',
              description: 'เรียนรู้ฟังก์ชันตรีโกณมิติ การแปลงมุม และการประยุกต์ใช้ในโจทย์ปัญหา',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ฟังก์ชันและกราฟ',
              description: 'ศึกษาเกี่ยวกับฟังก์ชันต่างๆ การวาดกราฟ และการวิเคราะห์ฟังก์ชัน',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ลอการิทึมและเลขยกกำลัง',
              description: 'เรียนรู้กฎของลอการิทึมและเลขยกกำลัง การแก้สมการลอการิทึม',
              order: 4,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แคลคูลัสสำหรับวิศวกรรมศาสตร์',
          description: 'ศึกษาแคลคูลัสเบื้องต้นที่จำเป็นสำหรับการเรียนวิศวกรรมศาสตร์ ครอบคลุมลิมิต อนุพันธ์ และอินทิกรัล',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ลิมิตและความต่อเนื่อง',
              description: 'เรียนรู้แนวคิดของลิมิต การหาลิมิต และความต่อเนื่องของฟังก์ชัน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'อนุพันธ์และการประยุกต์',
              description: 'ศึกษาเกี่ยวกับอนุพันธ์ กฎการหาอนุพันธ์ และการประยุกต์ใช้ในการหาค่าสูงสุดต่ำสุด',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'อินทิกรัลและการประยุกต์',
              description: 'เรียนรู้เทคนิคการหาอินทิกรัล การหาพื้นที่ใต้เส้นโค้ง และการประยุกต์ใช้',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ฟิสิกส์พื้นฐานสำหรับวิศวกรรมศาสตร์',
          description: 'ทบทวนและเสริมสร้างความรู้ฟิสิกส์พื้นฐานที่จำเป็นสำหรับการสอบ PAT2 และการเรียนวิศวกรรมศาสตร์',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'กลศาสตร์: การเคลื่อนที่และแรง',
              description: 'ศึกษาเกี่ยวกับการเคลื่อนที่ในแนวตรง การเคลื่อนที่แบบโปรเจกไทล์ และกฎของนิวตัน',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'งาน พลังงาน และโมเมนตัม',
              description: 'เรียนรู้แนวคิดของงาน พลังงานจลน์ พลังงานศักย์ และโมเมนตัม',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ไฟฟ้าและแม่เหล็ก',
              description: 'ศึกษาเกี่ยวกับไฟฟ้าสถิต ไฟฟ้ากระแส แม่เหล็ก และไฟฟ้ากระแสสลับ',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คลื่นและแสง',
              description: 'เรียนรู้เกี่ยวกับคลื่นกล คลื่นแม่เหล็กไฟฟ้า และทัศนศาสตร์',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เคมีพื้นฐานสำหรับวิศวกรรมศาสตร์',
          description: 'ทบทวนความรู้เคมีพื้นฐานที่จำเป็นสำหรับการสอบ PAT2 โดยเฉพาะส่วนที่เกี่ยวข้องกับวิศวกรรมศาสตร์',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โครงสร้างอะตอมและตารางธาตุ',
              description: 'เรียนรู้โครงสร้างอะตอม การจัดเรียงอิเล็กตรอน และตารางธาตุ',
              order: 1,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธะเคมี',
              description: 'ศึกษาเกี่ยวกับพันธะไอออนิก พันธะโควาเลนต์ และพันธะโลหะ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ปฏิกิริยาเคมีและสมดุล',
              description: 'เรียนรู้ประเภทของปฏิกิริยาเคมี อัตราการเกิดปฏิกิริยา และสมดุลเคมี',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรด-เบสและไฟฟ้าเคมี',
              description: 'ศึกษาเกี่ยวกับกรด-เบส pH และไฟฟ้าเคมี',
              order: 4,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การแก้โจทย์ปัญหาแบบบูรณาการ',
          description: 'ฝึกการแก้โจทย์ปัญหาที่ต้องใช้ความรู้หลายวิชาร่วมกัน ซึ่งเป็นลักษณะของข้อสอบ PAT2 และ PAT3',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โจทย์ปัญหาคณิตศาสตร์-ฟิสิกส์',
              description: 'ฝึกทำโจทย์ที่ต้องใช้ความรู้ทั้งคณิตศาสตร์และฟิสิกส์ร่วมกัน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'โจทย์ปัญหาฟิสิกส์-เคมี',
              description: 'ฝึกทำโจทย์ที่ต้องใช้ความรู้ทั้งฟิสิกส์และเคมีร่วมกัน',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'โจทย์ปัญหาแบบประยุกต์',
              description: 'ฝึกทำโจทย์ปัญหาที่จำลองสถานการณ์จริงในงานวิศวกรรม',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ข้อสอบย้อนหลังและแนวข้อสอบ',
          description: 'ฝึกทำข้อสอบ PAT2 และ PAT3 ย้อนหลัง พร้อมวิเคราะห์แนวข้อสอบและเทคนิคการทำข้อสอบ',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบ PAT2 ย้อนหลัง',
              description: 'ฝึกทำข้อสอบ PAT2 ย้อนหลัง 3-5 ปี พร้อมเฉลยและอธิบายวิธีคิด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบ PAT3 ย้อนหลัง',
              description: 'ฝึกทำข้อสอบ PAT3 ย้อนหลัง 3-5 ปี พร้อมเฉลยและอธิบายวิธีคิด',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แนวข้อสอบล่าสุดและเทคนิคการทำข้อสอบ',
              description: 'วิเคราะห์แนวข้อสอบล่าสุดและเรียนรู้เทคนิคการทำข้อสอบให้ได้คะแนนสูง',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบจำลอง (Mock Exam)',
              description: 'ทำข้อสอบจำลองแบบเต็มรูปแบบเพื่อประเมินความพร้อมก่อนสอบจริง',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เทคนิคการคิดวิเคราะห์และแก้ปัญหา',
          description: 'เรียนรู้เทคนิคการคิดวิเคราะห์ การแก้ปัญหาอย่างเป็นระบบ และการประยุกต์ใช้ความรู้ในสถานการณ์ใหม่',
          order: 7,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เทคนิคการอ่านโจทย์และวิเคราะห์ปัญหา',
              description: 'เรียนรู้วิธีอ่านโจทย์อย่างละเอียด วิเคราะห์ข้อมูล และระบุสิ่งที่โจทย์ต้องการ',
              order: 1,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวางแผนการแก้ปัญหา',
              description: 'ศึกษาเทคนิคการวางแผนการแก้ปัญหา การเลือกวิธีที่เหมาะสม และการตรวจสอบคำตอบ',
              order: 2,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การจัดการเวลาในการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคการจัดการเวลาในการทำข้อสอบเพื่อให้ทำข้อสอบได้ครบและถูกต้อง',
              order: 3,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    if (course) {
      // อัปเดตหลักสูตรที่มีอยู่
      course.name = courseData.name;
      course.description = courseData.description;
      course.sectionId = courseData.sectionId;
      course.categoryId = courseData.categoryId;
      course.price = courseData.price;
      course.schedule = courseData.schedule;
      course.image = courseData.image;
      course.duration = courseData.duration;
      course.maxStudents = courseData.maxStudents;
      course.isOnline = courseData.isOnline;
      course.isOnsite = courseData.isOnsite;
      course.isActive = courseData.isActive;
      course.lessons = courseData.lessons;
      
      await course.save();
      console.log('✅ อัปเดตหลักสูตร "เตรียมความพร้อม - วิศวกรรมศาสตร์" สำเร็จ');
    } else {
      // สร้างหลักสูตรใหม่
      course = await Course.create(courseData);
      console.log('✅ สร้างหลักสูตร "เตรียมความพร้อม - วิศวกรรมศาสตร์" สำเร็จ');
    }

    console.log('Course ID:', course._id);
    console.log('Course Name:', course.name);
    console.log('Total Lessons:', course.lessons.length);
    console.log('Total SubLessons:', course.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createOrUpdateEngineeringPrepCourse();

