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
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

// Content definitions for ม.5 courses
const courseContentMap = {
  // ฟิสิกส์ ม.5 เทอม 1
  'ฟิสิกส์.*ม\\.5.*เทอม.*1': {
    lessons: [
      {
        title: 'การเคลื่อนที่แบบหมุน',
        description: 'ศึกษาเกี่ยวกับการเคลื่อนที่แบบหมุน โมเมนต์ความเฉื่อย และโมเมนตัมเชิงมุม',
        order: 1,
        subLessons: [
          { title: 'การเคลื่อนที่แบบหมุน', description: 'เรียนรู้การเคลื่อนที่แบบหมุนและปริมาณที่เกี่ยวข้อง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'โมเมนต์ความเฉื่อย', description: 'ศึกษโมเมนต์ความเฉื่อยและการคำนวณ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'โมเมนตัมเชิงมุม', description: 'เรียนรู้โมเมนตัมเชิงมุมและการอนุรักษ์', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พลังงานจลน์ของการหมุน', description: 'ศึกษาพลังงานจลน์ของการหมุนและการประยุกต์ใช้', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'สมดุลของแรง',
        description: 'ศึกษาเกี่ยวกับสมดุลของแรงและโมเมนต์',
        order: 2,
        subLessons: [
          { title: 'สมดุลของแรง', description: 'เรียนรู้สมดุลของแรงและเงื่อนไข', order: 1, duration: '2 ชั่วโมง' },
          { title: 'โมเมนต์ของแรง', description: 'ศึกษโมเมนต์ของแรงและการคำนวณ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'สมดุลของวัตถุแข็งเกร็ง', description: 'เรียนรู้สมดุลของวัตถุแข็งเกร็ง', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การประยุกต์ใช้สมดุล', description: 'ฝึกแก้โจทย์เกี่ยวกับสมดุล', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย',
        description: 'ศึกษาเกี่ยวกับการเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย',
        order: 3,
        subLessons: [
          { title: 'การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย', description: 'เรียนรู้การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ลูกตุ้มนาฬิกา', description: 'ศึกษาลูกตุ้มนาฬิกาและการเคลื่อนที่', order: 2, duration: '2 ชั่วโมง' },
          { title: 'มวลติดสปริง', description: 'เรียนรู้มวลติดสปริงและการเคลื่อนที่', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พลังงานในการเคลื่อนที่แบบฮาร์มอนิก', description: 'ศึกษาพลังงานในการเคลื่อนที่แบบฮาร์มอนิก', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'คลื่นกล',
        description: 'ศึกษาเกี่ยวกับคลื่นกลและสมบัติของคลื่น',
        order: 4,
        subLessons: [
          { title: 'คลื่นกลและชนิดของคลื่น', description: 'เรียนรู้คลื่นกลและชนิดของคลื่น', order: 1, duration: '2 ชั่วโมง' },
          { title: 'สมการคลื่น', description: 'ศึกษาสมการคลื่นและพารามิเตอร์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'คลื่นนิ่ง', description: 'เรียนรู้คลื่นนิ่งและการเกิด', order: 3, duration: '2 ชั่วโมง' },
          { title: 'บีตส์และคลื่นเสียง', description: 'ศึกษาบีตส์และคลื่นเสียง', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  // ฟิสิกส์ ม.5 เทอม 2
  'ฟิสิกส์.*ม\\.5.*เทอม.*2': {
    lessons: [
      {
        title: 'คลื่นแม่เหล็กไฟฟ้า',
        description: 'ศึกษาเกี่ยวกับคลื่นแม่เหล็กไฟฟ้าและสมบัติ',
        order: 1,
        subLessons: [
          { title: 'คลื่นแม่เหล็กไฟฟ้า', description: 'เรียนรู้คลื่นแม่เหล็กไฟฟ้าและสมบัติ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'สเปกตรัมคลื่นแม่เหล็กไฟฟ้า', description: 'ศึกษาสเปกตรัมคลื่นแม่เหล็กไฟฟ้า', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การแทรกสอดของแสง', description: 'เรียนรู้การแทรกสอดของแสง', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การเลี้ยวเบนของแสง', description: 'ศึกษาการเลี้ยวเบนของแสง', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ไฟฟ้ากระแสสลับ',
        description: 'ศึกษาเกี่ยวกับไฟฟ้ากระแสสลับและวงจร',
        order: 2,
        subLessons: [
          { title: 'ไฟฟ้ากระแสสลับ', description: 'เรียนรู้ไฟฟ้ากระแสสลับและสมบัติ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'วงจร RLC', description: 'ศึกษาวงจร RLC และการทำงาน', order: 2, duration: '2 ชั่วโมง' },
          { title: 'กำลังไฟฟ้ากระแสสลับ', description: 'เรียนรู้กำลังไฟฟ้ากระแสสลับ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'หม้อแปลงไฟฟ้า', description: 'ศึกษาหม้อแปลงไฟฟ้าและการทำงาน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ฟิสิกส์อะตอม',
        description: 'ศึกษาเกี่ยวกับโครงสร้างอะตอมและสเปกตรัม',
        order: 3,
        subLessons: [
          { title: 'แบบจำลองอะตอม', description: 'เรียนรู้แบบจำลองอะตอมและวิวัฒนาการ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'สเปกตรัมอะตอม', description: 'ศึกษาสเปกตรัมอะตอมและเส้นสเปกตรัม', order: 2, duration: '2 ชั่วโมง' },
          { title: 'แบบจำลองอะตอมของบอร์', description: 'เรียนรู้แบบจำลองอะตอมของบอร์', order: 3, duration: '2 ชั่วโมง' },
          { title: 'กลศาสตร์ควอนตัมเบื้องต้น', description: 'ศึกษากลศาสตร์ควอนตัมเบื้องต้น', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ฟิสิกส์นิวเคลียร์',
        description: 'ศึกษาเกี่ยวกับนิวเคลียสและกัมมันตภาพรังสี',
        order: 4,
        subLessons: [
          { title: 'โครงสร้างนิวเคลียส', description: 'เรียนรู้โครงสร้างนิวเคลียสและสมบัติ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'กัมมันตภาพรังสี', description: 'ศึกษากัมมันตภาพรังสีและชนิด', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยานิวเคลียร์', description: 'เรียนรู้ปฏิกิริยานิวเคลียร์', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พลังงานนิวเคลียร์', description: 'ศึกษาพลังงานนิวเคลียร์และการใช้งาน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  // เคมี ม.5 เทอม 1
  'เคมี.*ม\\.5.*เทอม.*1': {
    lessons: [
      {
        title: 'พันธะเคมีขั้นสูง',
        description: 'ศึกษาเกี่ยวกับพันธะเคมีขั้นสูงและโครงสร้างโมเลกุล',
        order: 1,
        subLessons: [
          { title: 'พันธะโคเวเลนต์แบบขั้วและไม่ขั้ว', description: 'เรียนรู้พันธะโคเวเลนต์แบบขั้วและไม่ขั้ว', order: 1, duration: '2 ชั่วโมง' },
          { title: 'เรโซแนนซ์', description: 'ศึกษาเรโซแนนซ์และโครงสร้างเรโซแนนซ์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ทฤษฎี VSEPR', description: 'เรียนรู้ทฤษฎี VSEPR และรูปร่างโมเลกุล', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พันธะไฮโดรเจน', description: 'ศึกษาพันธะไฮโดรเจนและผลกระทบ', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'สารประกอบโคออร์ดิเนชัน',
        description: 'ศึกษาเกี่ยวกับสารประกอบโคออร์ดิเนชัน',
        order: 2,
        subLessons: [
          { title: 'สารประกอบโคออร์ดิเนชัน', description: 'เรียนรู้สารประกอบโคออร์ดิเนชันและโครงสร้าง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'เลขโคออร์ดิเนชัน', description: 'ศึกษาเลขโคออร์ดิเนชันและการคำนวณ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ไอโซเมอร์ของสารประกอบโคออร์ดิเนชัน', description: 'เรียนรู้ไอโซเมอร์ของสารประกอบโคออร์ดิเนชัน', order: 3, duration: '2 ชั่วโมง' },
          { title: 'สีของสารประกอบโคออร์ดิเนชัน', description: 'ศึกษาสีของสารประกอบโคออร์ดิเนชัน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เคมีไฟฟ้า',
        description: 'ศึกษาเกี่ยวกับเคมีไฟฟ้าและเซลล์ไฟฟ้าเคมี',
        order: 3,
        subLessons: [
          { title: 'ปฏิกิริยารีดอกซ์', description: 'เรียนรู้ปฏิกิริยารีดอกซ์และการดุลสมการ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'เซลล์กัลวานิก', description: 'ศึกษาเซลล์กัลวานิกและการทำงาน', order: 2, duration: '2 ชั่วโมง' },
          { title: 'แรงเคลื่อนไฟฟ้า', description: 'เรียนรู้แรงเคลื่อนไฟฟ้าและการคำนวณ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'เซลล์อิเล็กโทรไลต์', description: 'ศึกษาเซลล์อิเล็กโทรไลต์และการใช้งาน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'อัตราการเกิดปฏิกิริยาเคมีขั้นสูง',
        description: 'ศึกษาเกี่ยวกับอัตราการเกิดปฏิกิริยาเคมีขั้นสูง',
        order: 4,
        subLessons: [
          { title: 'ทฤษฎีการชน', description: 'เรียนรู้ทฤษฎีการชนและกลไกปฏิกิริยา', order: 1, duration: '2 ชั่วโมง' },
          { title: 'พลังงานกระตุ้น', description: 'ศึกษาพลังงานกระตุ้นและกราฟ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ตัวเร่งปฏิกิริยา', description: 'เรียนรู้ตัวเร่งปฏิกิริยาและกลไก', order: 3, duration: '2 ชั่วโมง' },
          { title: 'กฎอัตราและลำดับปฏิกิริยา', description: 'ศึกษากฎอัตราและลำดับปฏิกิริยา', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  // เคมี ม.5 เทอม 2
  'เคมี.*ม\\.5.*เทอม.*2': {
    lessons: [
      {
        title: 'เคมีอินทรีย์ขั้นสูง',
        description: 'ศึกษาเกี่ยวกับสารประกอบอินทรีย์ขั้นสูง',
        order: 1,
        subLessons: [
          { title: 'ไฮโดรคาร์บอนอะโรมาติก', description: 'เรียนรู้ไฮโดรคาร์บอนอะโรมาติกและเบนซีน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'หมู่ฟังก์ชันขั้นสูง', description: 'ศึกษาหมู่ฟังก์ชันขั้นสูงและสมบัติ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ไอโซเมอร์', description: 'เรียนรู้ไอโซเมอร์และชนิดต่างๆ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยาอินทรีย์ขั้นสูง', description: 'ศึกษาปฏิกิริยาอินทรีย์ขั้นสูง', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ปฏิกิริยาอินทรีย์',
        description: 'ศึกษาเกี่ยวกับปฏิกิริยาอินทรีย์ชนิดต่างๆ',
        order: 2,
        subLessons: [
          { title: 'ปฏิกิริยาการแทนที่', description: 'เรียนรู้ปฏิกิริยาการแทนที่', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยาการเติม', description: 'ศึกษาปฏิกิริยาการเติม', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยาการกำจัด', description: 'เรียนรู้ปฏิกิริยาการกำจัด', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยาออกซิเดชัน-รีดักชันอินทรีย์', description: 'ศึกษาปฏิกิริยาออกซิเดชัน-รีดักชันอินทรีย์', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'พอลิเมอร์และวัสดุ',
        description: 'ศึกษาเกี่ยวกับพอลิเมอร์และวัสดุ',
        order: 3,
        subLessons: [
          { title: 'พอลิเมอร์สังเคราะห์', description: 'เรียนรู้พอลิเมอร์สังเคราะห์และชนิด', order: 1, duration: '2 ชั่วโมง' },
          { title: 'พอลิเมอร์ธรรมชาติ', description: 'ศึกษาพอลิเมอร์ธรรมชาติ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การสังเคราะห์พอลิเมอร์', description: 'เรียนรู้การสังเคราะห์พอลิเมอร์', order: 3, duration: '2 ชั่วโมง' },
          { title: 'วัสดุพอลิเมอร์และการใช้งาน', description: 'ศึกษาวัสดุพอลิเมอร์และการใช้งาน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เคมีสิ่งแวดล้อม',
        description: 'ศึกษาเกี่ยวกับเคมีสิ่งแวดล้อม',
        order: 4,
        subLessons: [
          { title: 'มลพิษทางอากาศ', description: 'เรียนรู้มลพิษทางอากาศและผลกระทบ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'มลพิษทางน้ำ', description: 'ศึกษามลพิษทางน้ำและการบำบัด', order: 2, duration: '2 ชั่วโมง' },
          { title: 'มลพิษทางดิน', description: 'เรียนรู้มลพิษทางดินและผลกระทบ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การอนุรักษ์สิ่งแวดล้อม', description: 'ศึกษาการอนุรักษ์สิ่งแวดล้อม', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  // ชีวะวิทยา ม.5 เทอม 1
  'ชีวะวิทยา.*ม\\.5.*เทอม.*1': {
    lessons: [
      {
        title: 'ระบบประสาทและต่อมไร้ท่อ',
        description: 'ศึกษาเกี่ยวกับระบบประสาทและต่อมไร้ท่อ',
        order: 1,
        subLessons: [
          { title: 'โครงสร้างระบบประสาท', description: 'เรียนรู้โครงสร้างระบบประสาทและเซลล์ประสาท', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การส่งสัญญาณประสาท', description: 'ศึกษาการส่งสัญญาณประสาทและไซแนปส์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'สมองและไขสันหลัง', description: 'เรียนรู้สมองและไขสันหลัง', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ระบบต่อมไร้ท่อและฮอร์โมน', description: 'ศึกษาระบบต่อมไร้ท่อและฮอร์โมน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบภูมิคุ้มกัน',
        description: 'ศึกษาเกี่ยวกับระบบภูมิคุ้มกัน',
        order: 2,
        subLessons: [
          { title: 'ระบบภูมิคุ้มกันโดยกำเนิด', description: 'เรียนรู้ระบบภูมิคุ้มกันโดยกำเนิด', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ระบบภูมิคุ้มกันแบบจำเพาะ', description: 'ศึกษาระบบภูมิคุ้มกันแบบจำเพาะ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'แอนติบอดีและแอนติเจน', description: 'เรียนรู้แอนติบอดีและแอนติเจน', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การตอบสนองของระบบภูมิคุ้มกัน', description: 'ศึกษาการตอบสนองของระบบภูมิคุ้มกัน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'พันธุศาสตร์',
        description: 'ศึกษาเกี่ยวกับพันธุศาสตร์และพันธุกรรม',
        order: 3,
        subLessons: [
          { title: 'กฎของเมนเดล', description: 'เรียนรู้กฎของเมนเดลและการถ่ายทอดลักษณะ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'โครโมโซมและยีน', description: 'ศึกษาโครโมโซมและยีน', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การถ่ายทอดลักษณะทางพันธุกรรม', description: 'เรียนรู้การถ่ายทอดลักษณะทางพันธุกรรม', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พันธุกรรมของมนุษย์', description: 'ศึกษาพันธุกรรมของมนุษย์และโรคทางพันธุกรรม', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เทคโนโลยีดีเอ็นเอ',
        description: 'ศึกษาเกี่ยวกับเทคโนโลยีดีเอ็นเอ',
        order: 4,
        subLessons: [
          { title: 'โครงสร้างดีเอ็นเอ', description: 'เรียนรู้โครงสร้างดีเอ็นเอและอาร์เอ็นเอ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การจำลองดีเอ็นเอ', description: 'ศึกษาการจำลองดีเอ็นเอ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การถอดรหัสและการแปลรหัส', description: 'เรียนรู้การถอดรหัสและการแปลรหัส', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พันธุวิศวกรรม', description: 'ศึกษาพันธุวิศวกรรมและการประยุกต์ใช้', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  // ชีวะวิทยา ม.5 เทอม 2
  'ชีวะวิทยา.*ม\\.5.*เทอม.*2': {
    lessons: [
      {
        title: 'วิวัฒนาการ',
        description: 'ศึกษาเกี่ยวกับวิวัฒนาการของสิ่งมีชีวิต',
        order: 1,
        subLessons: [
          { title: 'ทฤษฎีวิวัฒนาการ', description: 'เรียนรู้ทฤษฎีวิวัฒนาการและหลักฐาน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'กลไกการวิวัฒนาการ', description: 'ศึกษากลไกการวิวัฒนาการ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การคัดเลือกโดยธรรมชาติ', description: 'เรียนรู้การคัดเลือกโดยธรรมชาติ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การเกิดสปีชีส์ใหม่', description: 'ศึกษาการเกิดสปีชีส์ใหม่', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'นิเวศวิทยา',
        description: 'ศึกษาเกี่ยวกับนิเวศวิทยา',
        order: 2,
        subLessons: [
          { title: 'ระบบนิเวศ', description: 'เรียนรู้ระบบนิเวศและองค์ประกอบ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ห่วงโซ่อาหารและสายใยอาหาร', description: 'ศึกษาห่วงโซ่อาหารและสายใยอาหาร', order: 2, duration: '2 ชั่วโมง' },
          { title: 'วัฏจักรของสาร', description: 'เรียนรู้วัฏจักรของสารในระบบนิเวศ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ประชากรและชุมชน', description: 'ศึกษาประชากรและชุมชน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ความหลากหลายทางชีวภาพ',
        description: 'ศึกษาเกี่ยวกับความหลากหลายทางชีวภาพ',
        order: 3,
        subLessons: [
          { title: 'การจัดหมวดหมู่สิ่งมีชีวิต', description: 'เรียนรู้การจัดหมวดหมู่สิ่งมีชีวิต', order: 1, duration: '2 ชั่วโมง' },
          { title: 'อาณาจักรของสิ่งมีชีวิต', description: 'ศึกษาอาณาจักรของสิ่งมีชีวิต', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ความหลากหลายของพืช', description: 'เรียนรู้ความหลากหลายของพืช', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ความหลากหลายของสัตว์', description: 'ศึกษาความหลากหลายของสัตว์', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'การอนุรักษ์สิ่งแวดล้อม',
        description: 'ศึกษาเกี่ยวกับการอนุรักษ์สิ่งแวดล้อม',
        order: 4,
        subLessons: [
          { title: 'การสูญพันธุ์', description: 'เรียนรู้การสูญพันธุ์และสาเหตุ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การอนุรักษ์ทรัพยากรธรรมชาติ', description: 'ศึกษาการอนุรักษ์ทรัพยากรธรรมชาติ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การจัดการสิ่งแวดล้อม', description: 'เรียนรู้การจัดการสิ่งแวดล้อม', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การพัฒนาที่ยั่งยืน', description: 'ศึกษาการพัฒนาที่ยั่งยืน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
};

// Updated descriptions for each course
const courseDescriptions = {
  'ฟิสิกส์.*ม\\.5.*เทอม.*1': 'หลักสูตรฟิสิกส์ชั้นมัธยมศึกษาปีที่ 5 เทอม 1 ครอบคลุมเนื้อหาการเคลื่อนที่แบบหมุน สมดุลของแรง การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย และคลื่นกล เพื่อเสริมสร้างพื้นฐานทางฟิสิกส์และเตรียมความพร้อมสำหรับการเรียนในระดับสูงขึ้น',
  'ฟิสิกส์.*ม\\.5.*เทอม.*2': 'หลักสูตรฟิสิกส์ชั้นมัธยมศึกษาปีที่ 5 เทอม 2 ครอบคลุมเนื้อหาคลื่นแม่เหล็กไฟฟ้า ไฟฟ้ากระแสสลับ ฟิสิกส์อะตอม และฟิสิกส์นิวเคลียร์ เพื่อเตรียมความพร้อมสำหรับการสอบเข้ามหาวิทยาลัย',
  'เคมี.*ม\\.5.*เทอม.*1': 'หลักสูตรเคมีชั้นมัธยมศึกษาปีที่ 5 เทอม 1 ครอบคลุมเนื้อหาพันธะเคมีขั้นสูง สารประกอบโคออร์ดิเนชัน เคมีไฟฟ้า และอัตราการเกิดปฏิกิริยาเคมีขั้นสูง เพื่อพัฒนาทักษะการคิดวิเคราะห์และแก้ปัญหา',
  'เคมี.*ม\\.5.*เทอม.*2': 'หลักสูตรเคมีชั้นมัธยมศึกษาปีที่ 5 เทอม 2 ครอบคลุมเนื้อหาเคมีอินทรีย์ขั้นสูง ปฏิกิริยาอินทรีย์ พอลิเมอร์และวัสดุ และเคมีสิ่งแวดล้อม เพื่อเสริมสร้างความเข้าใจในเคมีประยุกต์',
  'ชีวะวิทยา.*ม\\.5.*เทอม.*1': 'หลักสูตรชีววิทยาชั้นมัธยมศึกษาปีที่ 5 เทอม 1 ครอบคลุมเนื้อหาระบบประสาทและต่อมไร้ท่อ ระบบภูมิคุ้มกัน พันธุศาสตร์ และเทคโนโลยีดีเอ็นเอ เพื่อเสริมสร้างความเข้าใจในกลไกการทำงานของร่างกาย',
  'ชีวะวิทยา.*ม\\.5.*เทอม.*2': 'หลักสูตรชีววิทยาชั้นมัธยมศึกษาปีที่ 5 เทอม 2 ครอบคลุมเนื้อหาวิวัฒนาการ นิเวศวิทยา ความหลากหลายทางชีวภาพ และการอนุรักษ์สิ่งแวดล้อม เพื่อเสริมสร้างความเข้าใจในความสัมพันธ์ของสิ่งมีชีวิตและสิ่งแวดล้อม',
};

async function createUpgradeM5Content() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the category "คอร์ส Upgrade [ม.5]"
    const category = await Category.findOne({ name: 'คอร์ส Upgrade [ม.5]' });
    
    // First, let's see what courses exist
    const allCourses = await Course.find({}).limit(10);
    console.log(`Total courses in database: ${await Course.countDocuments()}`);
    if (allCourses.length > 0) {
      console.log('Sample courses:');
      allCourses.forEach(c => {
        console.log(`  - ${c.name} (level: ${c.level}, category: ${c.category})`);
      });
    }

    // Find section "คอร์ส Upgrade [ม.5]"
    const Section = mongoose.models.Section || mongoose.model('Section', new mongoose.Schema({}, { strict: false }));
    const section = await Section.findOne({ name: 'คอร์ส Upgrade [ม.5]' });
    
    let courses;
    if (category && section) {
      console.log(`\nFound category: ${category.name} (${category._id})`);
      console.log(`Found section: ${section.name} (${section._id})`);
      // Find all courses in this section (more reliable than categoryId)
      courses = await Course.find({ sectionId: section._id });
      console.log(`Found ${courses.length} courses in section`);
      
      // Update categoryId for courses that don't have it
      for (const course of courses) {
        if (!course.categoryId || course.categoryId.toString() !== category._id.toString()) {
          course.categoryId = category._id;
          await course.save();
        }
      }
    } else {
      console.log('\nCategory or section not found, searching by course names...');
      // Find courses by pattern matching for ม.5
      courses = await Course.find({ 
        $or: [
          { name: { $regex: 'ฟิสิกส์.*ม\\.5.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'ฟิสิกส์.*ม\\.5.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'ฟิสิกส์.*ม\\.5.*เทอม 1', $options: 'i' } },
          { name: { $regex: 'ฟิสิกส์.*ม\\.5.*เทอม 2', $options: 'i' } },
          { name: { $regex: 'เคมี.*ม\\.5.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'เคมี.*ม\\.5.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'เคมี.*ม\\.5.*เทอม 1', $options: 'i' } },
          { name: { $regex: 'เคมี.*ม\\.5.*เทอม 2', $options: 'i' } },
          { name: { $regex: 'ชีวะ.*ม\\.5.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'ชีวะ.*ม\\.5.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'ชีวะ.*ม\\.5.*เทอม 1', $options: 'i' } },
          { name: { $regex: 'ชีวะ.*ม\\.5.*เทอม 2', $options: 'i' } },
          { name: { $regex: 'ชีววิทยา.*ม\\.5.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'ชีววิทยา.*ม\\.5.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'ชีววิทยา.*ม\\.5.*เทอม 1', $options: 'i' } },
          { name: { $regex: 'ชีววิทยา.*ม\\.5.*เทอม 2', $options: 'i' } },
        ]
      });
      
      console.log(`Found ${courses.length} courses by name pattern`);
      if (courses.length > 0) {
        courses.forEach(c => console.log(`  - ${c.name}`));
      }
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const course of courses) {
      const courseName = course.name;
      console.log(`\nProcessing course: ${courseName}`);

      // Update content even if course already has lessons (to ensure completeness)
      if (course.lessons && course.lessons.length > 0) {
        console.log(`  Course already has ${course.lessons.length} lessons, will update with new content`);
      }

      // Find matching content using pattern matching
      let content = null;
      let description = null;
      
      // Normalize course name for matching (remove brackets if present)
      const normalizedName = courseName.replace(/\[|\]/g, '');
      
      for (const [pattern, contentData] of Object.entries(courseContentMap)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(courseName) || regex.test(normalizedName)) {
          content = contentData;
          break;
        }
      }
      
      // Find matching description
      for (const [pattern, desc] of Object.entries(courseDescriptions)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(courseName) || regex.test(normalizedName)) {
          description = desc;
          break;
        }
      }
      
      if (!content) {
        console.log(`  No content found for: ${courseName}`);
        skippedCount++;
        continue;
      }

      // Update course with lessons and description
      course.lessons = content.lessons;
      if (description) {
        course.description = description;
        console.log(`  Updated description`);
      }
      await course.save();
      console.log(`  ✓ Updated with ${content.lessons.length} lessons`);
      updatedCount++;
    }

    // Check for other subjects that might be missing
    const allM5Courses = await Course.find({ 
      $or: [
        { name: { $regex: '.*ม\\.5.*', $options: 'i' } },
        { level: 'ม.5' }
      ]
    });
    
    console.log(`\n=== All ม.5 Courses ===`);
    const subjects = {};
    allM5Courses.forEach(c => {
      const subject = c.name.split(' ')[0];
      if (!subjects[subject]) {
        subjects[subject] = [];
      }
      subjects[subject].push(c.name);
    });
    
    Object.keys(subjects).sort().forEach(subject => {
      console.log(`  ${subject}: ${subjects[subject].length} courses`);
      subjects[subject].forEach(name => console.log(`    - ${name}`));
    });

    console.log(`\n=== Summary ===`);
    console.log(`Total courses processed: ${courses.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (no content found): ${skippedCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createUpgradeM5Content();

