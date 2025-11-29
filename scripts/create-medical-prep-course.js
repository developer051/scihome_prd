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

async function createOrUpdateMedicalPrepCourse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // หา Section "คอร์สแพทย์ - วิทย์สุขภาพ"
    const medicalSection = await Section.findOne({ name: 'คอร์สแพทย์ - วิทย์สุขภาพ' });
    if (!medicalSection) {
      throw new Error('ไม่พบ Section "คอร์สแพทย์ - วิทย์สุขภาพ"');
    }
    console.log('Found Section:', medicalSection.name);

    // หา Category "Online" ใน Section แพทย์
    const onlineCategory = await Category.findOne({ 
      name: 'Online',
      sectionId: medicalSection._id 
    });
    if (!onlineCategory) {
      throw new Error('ไม่พบ Category "Online" สำหรับคอร์สแพทย์ - วิทย์สุขภาพ');
    }
    console.log('Found Category:', onlineCategory.name);

    // ค้นหาหลักสูตร "เตรียมความพร้อม - แพทย์, วิทย์สุขภาพ"
    let course = await Course.findOne({ 
      name: { $regex: /เตรียมความพร้อม.*แพทย์.*วิทย์สุขภาพ/i }
    });

    const courseData = {
      name: 'เตรียมความพร้อม - แพทย์, วิทย์สุขภาพ',
      description: 'หลักสูตรเตรียมความพร้อมสำหรับการสอบเข้าคณะแพทยศาสตร์และวิทยาศาสตร์สุขภาพ ครอบคลุมเนื้อหาชีววิทยา เคมี ฟิสิกส์ และคณิตศาสตร์ที่จำเป็นสำหรับการสอบ PAT2 และ TPAT1 เน้นการทำโจทย์ปัญหา เทคนิคการคิดวิเคราะห์ และการประยุกต์ใช้ความรู้ในสถานการณ์ทางการแพทย์ พร้อมข้อสอบย้อนหลังและแนวข้อสอบที่อัปเดตตามรูปแบบการสอบล่าสุด',
      category: null,
      level: 'เตรียมสอบเข้า',
      sectionId: medicalSection._id,
      categoryId: onlineCategory._id,
      price: 7500,
      schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
      duration: '6 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'ชีววิทยาพื้นฐานสำหรับแพทย์และวิทย์สุขภาพ',
          description: 'ทบทวนและเสริมสร้างพื้นฐานชีววิทยาที่จำเป็นสำหรับการสอบเข้าคณะแพทยศาสตร์และวิทยาศาสตร์สุขภาพ ครอบคลุมเซลล์ พันธุกรรม ระบบต่างๆ ในร่างกาย และชีววิทยาระดับโมเลกุล',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เซลล์และโครงสร้าง',
              description: 'ศึกษาโครงสร้างและหน้าที่ของเซลล์ ออร์แกเนลล์ต่างๆ และกระบวนการในเซลล์',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธุกรรมและดีเอ็นเอ',
              description: 'เรียนรู้กฎของเมนเดล โครงสร้างและหน้าที่ของ DNA และ RNA การถ่ายทอดลักษณะทางพันธุกรรม',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบต่างๆ ในร่างกายมนุษย์',
              description: 'ศึกษาเกี่ยวกับระบบหายใจ ระบบไหลเวียนโลหิต ระบบย่อยอาหาร ระบบขับถ่าย และระบบประสาท',
              order: 3,
              duration: '5 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ชีววิทยาระดับโมเลกุล',
              description: 'เรียนรู้เกี่ยวกับการสังเคราะห์โปรตีน การควบคุมการแสดงออกของยีน และเทคโนโลยีชีวภาพ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบภูมิคุ้มกัน',
              description: 'ศึกษาเกี่ยวกับระบบภูมิคุ้มกันของร่างกาย การทำงานของแอนติบอดี และการตอบสนองต่อเชื้อโรค',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เคมีสำหรับแพทย์และวิทย์สุขภาพ',
          description: 'ทบทวนและเสริมสร้างความรู้เคมีที่จำเป็นสำหรับการสอบ PAT2 และการเรียนแพทย์ โดยเฉพาะส่วนที่เกี่ยวข้องกับชีวเคมีและเภสัชวิทยา',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โครงสร้างอะตอมและพันธะเคมี',
              description: 'เรียนรู้โครงสร้างอะตอม การจัดเรียงอิเล็กตรอน พันธะไอออนิก พันธะโควาเลนต์ และพันธะไฮโดรเจน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ปฏิกิริยาเคมีและสมดุล',
              description: 'ศึกษาเกี่ยวกับประเภทของปฏิกิริยาเคมี อัตราการเกิดปฏิกิริยา สมดุลเคมี และหลักการของเลอชาเตอลิเยร์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรด-เบสและ pH',
              description: 'เรียนรู้เกี่ยวกับกรด-เบส การคำนวณ pH และบัฟเฟอร์ ซึ่งมีความสำคัญในระบบชีวภาพ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ชีวเคมีพื้นฐาน',
              description: 'ศึกษาเกี่ยวกับคาร์โบไฮเดรต ไขมัน โปรตีน และกรดนิวคลีอิก ซึ่งเป็นพื้นฐานสำคัญสำหรับการเรียนแพทย์',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เคมีอินทรีย์พื้นฐาน',
              description: 'เรียนรู้เกี่ยวกับสารประกอบอินทรีย์พื้นฐาน ฟังก์ชันนัลกรุ๊ป และปฏิกิริยาที่สำคัญ',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ฟิสิกส์สำหรับแพทย์และวิทย์สุขภาพ',
          description: 'ทบทวนความรู้ฟิสิกส์พื้นฐานที่จำเป็นสำหรับการสอบ PAT2 โดยเฉพาะส่วนที่เกี่ยวข้องกับการแพทย์ เช่น กลศาสตร์ของไหล เสียง แสง และไฟฟ้า',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'กลศาสตร์: การเคลื่อนที่และแรง',
              description: 'ศึกษาเกี่ยวกับการเคลื่อนที่ในแนวตรง การเคลื่อนที่แบบโปรเจกไทล์ และกฎของนิวตัน',
              order: 1,
              duration: '3 ชั่วโมง',
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
              title: 'กลศาสตร์ของไหล',
              description: 'ศึกษาเกี่ยวกับความดัน การไหลของของไหล และหลักการของเบอร์นูลลี ซึ่งมีความสำคัญในระบบไหลเวียนโลหิต',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คลื่น เสียง และแสง',
              description: 'เรียนรู้เกี่ยวกับคลื่นกล คลื่นเสียง และทัศนศาสตร์ ซึ่งมีความสำคัญในการแพทย์',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ไฟฟ้าและแม่เหล็ก',
              description: 'ศึกษาเกี่ยวกับไฟฟ้าสถิต ไฟฟ้ากระแส และแม่เหล็ก',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'คณิตศาสตร์พื้นฐานสำหรับแพทย์',
          description: 'ทบทวนคณิตศาสตร์พื้นฐานที่จำเป็นสำหรับการสอบ PAT2 และการเรียนแพทย์ ครอบคลุมพีชคณิต สถิติ และความน่าจะเป็น',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พีชคณิตและสมการ',
              description: 'ทบทวนพีชคณิตพื้นฐาน การแก้สมการและอสมการ รวมถึงระบบสมการ',
              order: 1,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ฟังก์ชันและกราฟ',
              description: 'ศึกษาเกี่ยวกับฟังก์ชันต่างๆ การวาดกราฟ และการวิเคราะห์ฟังก์ชัน',
              order: 2,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สถิติและความน่าจะเป็น',
              description: 'เรียนรู้สถิติพื้นฐาน ความน่าจะเป็น และการแจกแจงความน่าจะเป็น ซึ่งมีความสำคัญในการวิจัยทางการแพทย์',
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
          title: 'TPAT1 - ความถนัดทางแพทยศาสตร์',
          description: 'เตรียมความพร้อมสำหรับการสอบ TPAT1 (ความถนัดทางแพทยศาสตร์) ครอบคลุมทั้ง 3 พาร์ต: พาร์ตเชาวน์ปัญญา พาร์ตจริยธรรมทางการแพทย์ และพาร์ตความคิดเชื่อมโยง',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พาร์ตเชาวน์ปัญญา (100 คะแนน)',
              description: 'ฝึกทำข้อสอบเชาวน์ปัญญา ตรรกะ และการคิดวิเคราะห์ ซึ่งเป็นส่วนสำคัญของ TPAT1',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พาร์ตจริยธรรมทางการแพทย์ (100 คะแนน)',
              description: 'ศึกษาเกี่ยวกับจริยธรรมและจรรยาบรรณในวิชาชีพแพทย์ หลักการทางจริยธรรมทางการแพทย์ และสิทธิผู้ป่วย',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พาร์ตความคิดเชื่อมโยง (100 คะแนน)',
              description: 'ฝึกการคิดเชื่อมโยง การวิเคราะห์ความสัมพันธ์ และการแก้ปัญหาอย่างเป็นระบบ',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ข้อสอบ TPAT1 ย้อนหลัง',
              description: 'ฝึกทำข้อสอบ TPAT1 ย้อนหลัง 3-5 ปี พร้อมเฉลยและอธิบายวิธีคิด',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การแก้โจทย์ปัญหาแบบบูรณาการ',
          description: 'ฝึกการแก้โจทย์ปัญหาที่ต้องใช้ความรู้หลายวิชาร่วมกัน ซึ่งเป็นลักษณะของข้อสอบ PAT2 และ TPAT1',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โจทย์ปัญหาชีววิทยา-เคมี',
              description: 'ฝึกทำโจทย์ที่ต้องใช้ความรู้ทั้งชีววิทยาและเคมีร่วมกัน เช่น ชีวเคมีและเมแทบอลิซึม',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'โจทย์ปัญหาฟิสิกส์-ชีววิทยา',
              description: 'ฝึกทำโจทย์ที่ต้องใช้ความรู้ทั้งฟิสิกส์และชีววิทยาร่วมกัน เช่น กลศาสตร์ของไหลในระบบไหลเวียนโลหิต',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'โจทย์ปัญหาแบบประยุกต์ทางการแพทย์',
              description: 'ฝึกทำโจทย์ปัญหาที่จำลองสถานการณ์จริงในทางการแพทย์และการดูแลสุขภาพ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ข้อสอบย้อนหลังและแนวข้อสอบ',
          description: 'ฝึกทำข้อสอบ PAT2 และ TPAT1 ย้อนหลัง พร้อมวิเคราะห์แนวข้อสอบและเทคนิคการทำข้อสอบ',
          order: 7,
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
              title: 'ข้อสอบ TPAT1 ย้อนหลัง',
              description: 'ฝึกทำข้อสอบ TPAT1 ย้อนหลัง 3-5 ปี พร้อมเฉลยและอธิบายวิธีคิด',
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
          description: 'เรียนรู้เทคนิคการคิดวิเคราะห์ การแก้ปัญหาอย่างเป็นระบบ และการประยุกต์ใช้ความรู้ในสถานการณ์ใหม่ ซึ่งมีความสำคัญในการเรียนแพทย์',
          order: 8,
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
            {
              title: 'การคิดวิเคราะห์แบบแพทย์',
              description: 'เรียนรู้วิธีการคิดวิเคราะห์แบบแพทย์ การวินิจฉัยปัญหา และการตัดสินใจบนพื้นฐานของหลักฐาน',
              order: 4,
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
      console.log('✅ อัปเดตหลักสูตร "เตรียมความพร้อม - แพทย์, วิทย์สุขภาพ" สำเร็จ');
    } else {
      // สร้างหลักสูตรใหม่
      course = await Course.create(courseData);
      console.log('✅ สร้างหลักสูตร "เตรียมความพร้อม - แพทย์, วิทย์สุขภาพ" สำเร็จ');
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

createOrUpdateMedicalPrepCourse();

