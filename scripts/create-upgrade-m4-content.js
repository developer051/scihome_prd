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

// Content definitions for each subject
// Map course name patterns to content
const courseContentMap = {
  // Pattern matching for course names
  'ฟิสิกส์.*ม\\.4.*เทอม.*1': {
    lessons: [
      {
        title: 'การเคลื่อนที่',
        description: 'ศึกษาเกี่ยวกับการเคลื่อนที่ในแนวตรง ความเร็ว ความเร่ง และกราฟการเคลื่อนที่',
        order: 1,
        subLessons: [
          { title: 'การเคลื่อนที่ในแนวตรง', description: 'เรียนรู้การเคลื่อนที่ในแนวตรงและปริมาณที่เกี่ยวข้อง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ความเร็วและความเร่ง', description: 'ทำความเข้าใจความเร็วและความเร่ง', order: 2, duration: '2 ชั่วโมง' },
          { title: 'กราฟการเคลื่อนที่', description: 'ศึกษาและวิเคราะห์กราฟการเคลื่อนที่', order: 3, duration: '2 ชั่วโมง' },
          { title: 'สมการการเคลื่อนที่', description: 'เรียนรู้สมการการเคลื่อนที่และวิธีแก้โจทย์', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'แรงและกฎการเคลื่อนที่',
        description: 'ศึกษาแรงชนิดต่างๆ และกฎการเคลื่อนที่ของนิวตัน',
        order: 2,
        subLessons: [
          { title: 'แรงและผลของแรง', description: 'เรียนรู้แรงและผลของแรงที่มีต่อวัตถุ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'กฎการเคลื่อนที่ของนิวตัน', description: 'ศึกษากฎการเคลื่อนที่ทั้ง 3 ข้อของนิวตัน', order: 2, duration: '3 ชั่วโมง' },
          { title: 'แรงเสียดทาน', description: 'เรียนรู้แรงเสียดทานและผลกระทบ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'แรงดึงดูดระหว่างมวล', description: 'ศึกษาแรงดึงดูดระหว่างมวลและกฎแรงโน้มถ่วง', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'งานและพลังงาน',
        description: 'ศึกษาเกี่ยวกับงาน พลังงาน และการอนุรักษ์พลังงาน',
        order: 3,
        subLessons: [
          { title: 'งานและกำลัง', description: 'เรียนรู้งานและกำลัง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'พลังงานจลน์และพลังงานศักย์', description: 'ศึกษาพลังงานจลน์และพลังงานศักย์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การอนุรักษ์พลังงาน', description: 'เรียนรู้กฎการอนุรักษ์พลังงาน', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การประยุกต์ใช้พลังงาน', description: 'ฝึกแก้โจทย์เกี่ยวกับงานและพลังงาน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'โมเมนตัมและการชน',
        description: 'ศึกษาโมเมนตัมและการชนของวัตถุ',
        order: 4,
        subLessons: [
          { title: 'โมเมนตัม', description: 'เรียนรู้โมเมนตัมและความหมาย', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การอนุรักษ์โมเมนตัม', description: 'ศึกษากฎการอนุรักษ์โมเมนตัม', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การชนแบบยืดหยุ่นและไม่ยืดหยุ่น', description: 'เรียนรู้การชนแบบต่างๆ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การประยุกต์ใช้โมเมนตัม', description: 'ฝึกแก้โจทย์เกี่ยวกับโมเมนตัม', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  'ฟิสิกส์.*ม\\.4.*เทอม.*2': {
    lessons: [
      {
        title: 'คลื่น',
        description: 'ศึกษาเกี่ยวกับคลื่นและสมบัติของคลื่น',
        order: 1,
        subLessons: [
          { title: 'คลื่นและชนิดของคลื่น', description: 'เรียนรู้คลื่นและชนิดของคลื่น', order: 1, duration: '2 ชั่วโมง' },
          { title: 'สมบัติของคลื่น', description: 'ศึกษาสมบัติของคลื่น เช่น ความถี่ ความยาวคลื่น', order: 2, duration: '2 ชั่วโมง' },
          { title: 'คลื่นเสียง', description: 'เรียนรู้คลื่นเสียงและสมบัติ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'คลื่นแสง', description: 'ศึกษาคลื่นแสงและสมบัติ', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'แสงและการมองเห็น',
        description: 'ศึกษาเกี่ยวกับแสง การสะท้อน การหักเห และการมองเห็น',
        order: 2,
        subLessons: [
          { title: 'การสะท้อนของแสง', description: 'เรียนรู้การสะท้อนของแสง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การหักเหของแสง', description: 'ศึกษาการหักเหของแสงและกฎของสเนลล์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'เลนส์', description: 'เรียนรู้เลนส์และสมบัติ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การมองเห็น', description: 'ศึกษาการทำงานของตาและการมองเห็น', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ไฟฟ้าสถิต',
        description: 'ศึกษาเกี่ยวกับประจุไฟฟ้า แรงไฟฟ้า และสนามไฟฟ้า',
        order: 3,
        subLessons: [
          { title: 'ประจุไฟฟ้า', description: 'เรียนรู้ประจุไฟฟ้าและชนิดของประจุ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'แรงไฟฟ้า', description: 'ศึกษากฎของคูลอมบ์และแรงไฟฟ้า', order: 2, duration: '2 ชั่วโมง' },
          { title: 'สนามไฟฟ้า', description: 'เรียนรู้สนามไฟฟ้าและเส้นแรงไฟฟ้า', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ศักย์ไฟฟ้า', description: 'ศึกษาศักย์ไฟฟ้าและความต่างศักย์', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ไฟฟ้ากระแส',
        description: 'ศึกษาเกี่ยวกับไฟฟ้ากระแสและวงจรไฟฟ้า',
        order: 4,
        subLessons: [
          { title: 'กระแสไฟฟ้า', description: 'เรียนรู้กระแสไฟฟ้าและความต้านทาน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'กฎของโอห์ม', description: 'ศึกษากฎของโอห์มและความต้านทาน', order: 2, duration: '2 ชั่วโมง' },
          { title: 'วงจรไฟฟ้า', description: 'เรียนรู้วงจรไฟฟ้าอนุกรมและขนาน', order: 3, duration: '2 ชั่วโมง' },
          { title: 'กำลังไฟฟ้า', description: 'ศึกษากำลังไฟฟ้าและการใช้พลังงาน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  'เคมี.*ม\\.4.*เทอม.*1': {
    lessons: [
      {
        title: 'อะตอมและตารางธาตุ',
        description: 'ศึกษาโครงสร้างอะตอมและตารางธาตุ',
        order: 1,
        subLessons: [
          { title: 'โครงสร้างอะตอม', description: 'เรียนรู้โครงสร้างอะตอมและอนุภาคมูลฐาน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การจัดเรียงอิเล็กตรอน', description: 'ศึกษาการจัดเรียงอิเล็กตรอนในอะตอม', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ตารางธาตุ', description: 'เรียนรู้ตารางธาตุและการจัดเรียง', order: 3, duration: '2 ชั่วโมง' },
          { title: 'สมบัติตามคาบและหมู่', description: 'ศึกษาสมบัติของธาตุตามคาบและหมู่', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'พันธะเคมี',
        description: 'ศึกษาเกี่ยวกับพันธะเคมีชนิดต่างๆ',
        order: 2,
        subLessons: [
          { title: 'พันธะไอออนิก', description: 'เรียนรู้พันธะไอออนิกและการเกิด', order: 1, duration: '2 ชั่วโมง' },
          { title: 'พันธะโควาเลนต์', description: 'ศึกษาพันธะโควาเลนต์และโครงสร้าง', order: 2, duration: '2 ชั่วโมง' },
          { title: 'พันธะโลหะ', description: 'เรียนรู้พันธะโลหะและสมบัติ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'แรงระหว่างโมเลกุล', description: 'ศึกษาแรงระหว่างโมเลกุลและผลกระทบ', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'สารละลาย',
        description: 'ศึกษาเกี่ยวกับสารละลายและความเข้มข้น',
        order: 3,
        subLessons: [
          { title: 'สารละลายและชนิดของสารละลาย', description: 'เรียนรู้สารละลายและชนิด', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ความเข้มข้นของสารละลาย', description: 'ศึกษาความเข้มข้นและหน่วยต่างๆ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การเตรียมสารละลาย', description: 'เรียนรู้วิธีเตรียมสารละลาย', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การเจือจางสารละลาย', description: 'ศึกษาการเจือจางและการคำนวณ', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'กรด-เบส',
        description: 'ศึกษาเกี่ยวกับกรดและเบส',
        order: 4,
        subLessons: [
          { title: 'ทฤษฎีกรด-เบส', description: 'เรียนรู้ทฤษฎีกรด-เบส', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ค่า pH และ pOH', description: 'ศึกษาค่า pH และ pOH', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยากรด-เบส', description: 'เรียนรู้ปฏิกิริยาระหว่างกรดและเบส', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การไทเทรต', description: 'ศึกษาการไทเทรตและการคำนวณ', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  'เคมี.*ม\\.4.*เทอม.*2': {
    lessons: [
      {
        title: 'อัตราการเกิดปฏิกิริยาเคมี',
        description: 'ศึกษาเกี่ยวกับอัตราการเกิดปฏิกิริยาเคมี',
        order: 1,
        subLessons: [
          { title: 'อัตราการเกิดปฏิกิริยา', description: 'เรียนรู้อัตราการเกิดปฏิกิริยาเคมี', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ปัจจัยที่มีผลต่ออัตราการเกิดปฏิกิริยา', description: 'ศึกษาปัจจัยต่างๆ ที่มีผลต่ออัตรา', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ตัวเร่งปฏิกิริยา', description: 'เรียนรู้ตัวเร่งปฏิกิริยาและกลไก', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การคำนวณอัตราการเกิดปฏิกิริยา', description: 'ฝึกคำนวณอัตราการเกิดปฏิกิริยา', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'สมดุลเคมี',
        description: 'ศึกษาเกี่ยวกับสมดุลเคมี',
        order: 2,
        subLessons: [
          { title: 'สมดุลเคมี', description: 'เรียนรู้สมดุลเคมีและหลักการ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ค่าคงที่สมดุล', description: 'ศึกษาค่าคงที่สมดุลและการคำนวณ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'หลักของเลอชาเตอลิเยร์', description: 'เรียนรู้หลักของเลอชาเตอลิเยร์', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การประยุกต์ใช้สมดุลเคมี', description: 'ศึกษาการประยุกต์ใช้ในชีวิตประจำวัน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เคมีอินทรีย์',
        description: 'ศึกษาเกี่ยวกับสารประกอบอินทรีย์',
        order: 3,
        subLessons: [
          { title: 'สารประกอบอินทรีย์เบื้องต้น', description: 'เรียนรู้สารประกอบอินทรีย์และโครงสร้าง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ไฮโดรคาร์บอน', description: 'ศึกษาไฮโดรคาร์บอนและชนิดต่างๆ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'หมู่ฟังก์ชัน', description: 'เรียนรู้หมู่ฟังก์ชันต่างๆ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ปฏิกิริยาอินทรีย์', description: 'ศึกษาปฏิกิริยาของสารอินทรีย์', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'พอลิเมอร์',
        description: 'ศึกษาเกี่ยวกับพอลิเมอร์',
        order: 4,
        subLessons: [
          { title: 'พอลิเมอร์และชนิด', description: 'เรียนรู้พอลิเมอร์และชนิด', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การสังเคราะห์พอลิเมอร์', description: 'ศึกษาการสังเคราะห์พอลิเมอร์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'สมบัติของพอลิเมอร์', description: 'เรียนรู้สมบัติและการใช้งาน', order: 3, duration: '2 ชั่วโมง' },
          { title: 'พอลิเมอร์ในชีวิตประจำวัน', description: 'ศึกษาการใช้พอลิเมอร์ในชีวิตประจำวัน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  'ชีวะวิทยา.*ม\\.4.*เทอม.*1': {
    lessons: [
      {
        title: 'เซลล์และการทำงานของเซลล์',
        description: 'ศึกษาโครงสร้างและหน้าที่ของเซลล์',
        order: 1,
        subLessons: [
          { title: 'โครงสร้างเซลล์', description: 'เรียนรู้โครงสร้างเซลล์พืชและสัตว์', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ออร์แกเนลล์ในเซลล์', description: 'ศึกษาออร์แกเนลล์ต่างๆ และหน้าที่', order: 2, duration: '2 ชั่วโมง' },
          { title: 'เยื่อหุ้มเซลล์', description: 'เรียนรู้เยื่อหุ้มเซลล์และการขนส่ง', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การแบ่งเซลล์', description: 'ศึกษาการแบ่งเซลล์แบบไมโทซิสและไมโอซิส', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบย่อยอาหาร',
        description: 'ศึกษาเกี่ยวกับระบบย่อยอาหาร',
        order: 2,
        subLessons: [
          { title: 'โครงสร้างระบบย่อยอาหาร', description: 'เรียนรู้อวัยวะในระบบย่อยอาหาร', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การย่อยอาหาร', description: 'ศึกษากระบวนการย่อยอาหาร', order: 2, duration: '2 ชั่วโมง' },
          { title: 'เอนไซม์ย่อยอาหาร', description: 'เรียนรู้เอนไซม์และบทบาทในการย่อย', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การดูดซึมสารอาหาร', description: 'ศึกษาการดูดซึมสารอาหาร', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบหมุนเวียนเลือด',
        description: 'ศึกษาเกี่ยวกับระบบหมุนเวียนเลือด',
        order: 3,
        subLessons: [
          { title: 'โครงสร้างหัวใจและหลอดเลือด', description: 'เรียนรู้โครงสร้างหัวใจและหลอดเลือด', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การทำงานของหัวใจ', description: 'ศึกษาการทำงานของหัวใจ', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ระบบเลือด', description: 'เรียนรู้ส่วนประกอบของเลือด', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การหมุนเวียนเลือด', description: 'ศึกษาการหมุนเวียนเลือดในร่างกาย', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบหายใจ',
        description: 'ศึกษาเกี่ยวกับระบบหายใจ',
        order: 4,
        subLessons: [
          { title: 'โครงสร้างระบบหายใจ', description: 'เรียนรู้อวัยวะในระบบหายใจ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'กลไกการหายใจ', description: 'ศึกษากลไกการหายใจเข้า-ออก', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การแลกเปลี่ยนก๊าซ', description: 'เรียนรู้การแลกเปลี่ยนก๊าซ', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การควบคุมการหายใจ', description: 'ศึกษาการควบคุมการหายใจ', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  'ชีวะวิทยา.*ม\\.4.*เทอม.*2': {
    lessons: [
      {
        title: 'ระบบขับถ่าย',
        description: 'ศึกษาเกี่ยวกับระบบขับถ่าย',
        order: 1,
        subLessons: [
          { title: 'โครงสร้างไต', description: 'เรียนรู้โครงสร้างไตและหน่วยไต', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การกรองของไต', description: 'ศึกษากระบวนการกรองของไต', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การดูดกลับและการหลั่ง', description: 'เรียนรู้การดูดกลับและการหลั่ง', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การควบคุมสมดุลน้ำและเกลือแร่', description: 'ศึกษาการควบคุมสมดุลน้ำและเกลือแร่', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบประสาท',
        description: 'ศึกษาเกี่ยวกับระบบประสาท',
        order: 2,
        subLessons: [
          { title: 'โครงสร้างระบบประสาท', description: 'เรียนรู้โครงสร้างระบบประสาท', order: 1, duration: '2 ชั่วโมง' },
          { title: 'เซลล์ประสาท', description: 'ศึกษาเซลล์ประสาทและการทำงาน', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การส่งสัญญาณประสาท', description: 'เรียนรู้การส่งสัญญาณประสาท', order: 3, duration: '2 ชั่วโมง' },
          { title: 'สมองและไขสันหลัง', description: 'ศึกษาสมองและไขสันหลัง', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบต่อมไร้ท่อ',
        description: 'ศึกษาเกี่ยวกับระบบต่อมไร้ท่อ',
        order: 3,
        subLessons: [
          { title: 'ต่อมไร้ท่อและฮอร์โมน', description: 'เรียนรู้ต่อมไร้ท่อและฮอร์โมน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ฮอร์โมนสำคัญ', description: 'ศึกษาฮอร์โมนสำคัญและหน้าที่', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การควบคุมด้วยฮอร์โมน', description: 'เรียนรู้การควบคุมด้วยฮอร์โมน', order: 3, duration: '2 ชั่วโมง' },
          { title: 'ความผิดปกติของฮอร์โมน', description: 'ศึกษาความผิดปกติของฮอร์โมน', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบสืบพันธุ์',
        description: 'ศึกษาเกี่ยวกับระบบสืบพันธุ์',
        order: 4,
        subLessons: [
          { title: 'ระบบสืบพันธุ์เพศชาย', description: 'เรียนรู้ระบบสืบพันธุ์เพศชาย', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ระบบสืบพันธุ์เพศหญิง', description: 'ศึกษาระบบสืบพันธุ์เพศหญิง', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การปฏิสนธิและการตั้งครรภ์', description: 'เรียนรู้การปฏิสนธิและการตั้งครรภ์', order: 3, duration: '2 ชั่วโมง' },
          { title: 'การเจริญเติบโตของทารก', description: 'ศึกษาการเจริญเติบโตของทารก', order: 4, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
};

async function createUpgradeM4Content() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the category "คอร์ส Upgrade [ม.4]"
    const category = await Category.findOne({ name: 'คอร์ส Upgrade [ม.4]' });
    
    // First, let's see what courses exist
    const allCourses = await Course.find({}).limit(10);
    console.log(`Total courses in database: ${await Course.countDocuments()}`);
    if (allCourses.length > 0) {
      console.log('Sample courses:');
      allCourses.forEach(c => {
        console.log(`  - ${c.name} (level: ${c.level}, category: ${c.category})`);
      });
    }

    let courses;
    if (category) {
      console.log(`\nFound category: ${category.name} (${category._id})`);
      // Find all courses in this category
      courses = await Course.find({ categoryId: category._id });
      console.log(`Found ${courses.length} courses in category`);
    } else {
      console.log('\nCategory "คอร์ส Upgrade [ม.4]" not found, searching by course names...');
      // Find courses by pattern matching for ม.4
      courses = await Course.find({ 
        $or: [
          { name: { $regex: 'ฟิสิกส์.*ม\\.4.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'ฟิสิกส์.*ม\\.4.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'เคมี.*ม\\.4.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'เคมี.*ม\\.4.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'ชีวะ.*ม\\.4.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'ชีวะ.*ม\\.4.*เทอม.*2', $options: 'i' } },
          { name: { $regex: 'ชีววิทยา.*ม\\.4.*เทอม.*1', $options: 'i' } },
          { name: { $regex: 'ชีววิทยา.*ม\\.4.*เทอม.*2', $options: 'i' } },
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
      for (const [pattern, contentData] of Object.entries(courseContentMap)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(courseName)) {
          content = contentData;
          break;
        }
      }
      
      if (!content) {
        console.log(`  No content found for: ${courseName}`);
        continue;
      }

      // Update course with lessons
      course.lessons = content.lessons;
      await course.save();
      console.log(`  ✓ Updated with ${content.lessons.length} lessons`);
      updatedCount++;
    }

    // Check for other subjects that might be missing
    const allM4Courses = await Course.find({ 
      $or: [
        { name: { $regex: '.*ม\\.4.*', $options: 'i' } },
        { level: 'ม.4' }
      ]
    });
    
    console.log(`\n=== All ม.4 Courses ===`);
    const subjects = {};
    allM4Courses.forEach(c => {
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
    console.log(`Skipped (already has content): ${skippedCount}`);
    console.log(`No content found: ${courses.length - updatedCount - skippedCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createUpgradeM4Content();

