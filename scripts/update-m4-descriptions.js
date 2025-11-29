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
  lessons: Array,
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

// Updated descriptions for each subject - ครอบคลุม กระชับ ได้ใจความ
const courseDescriptions = {
  'ฟิสิกส์.*ม\\.4.*เทอม.*1': {
    description: 'หลักสูตรฟิสิกส์ม.4 เทอม 1 ครอบคลุมพื้นฐานการเคลื่อนที่ แรงและกฎการเคลื่อนที่ งานและพลังงาน และโมเมนตัม เน้นความเข้าใจเชิงลึก การแก้โจทย์ปัญหา และการประยุกต์ใช้ในชีวิตประจำวัน พร้อมเทคนิคการจำและวิธีคิดที่ถูกต้อง'
  },
  'ฟิสิกส์.*ม\\.4.*เทอม.*2': {
    description: 'หลักสูตรฟิสิกส์ม.4 เทอม 2 ศึกษาเรื่องคลื่น แสงและการมองเห็น ไฟฟ้าสถิต และไฟฟ้ากระแส เน้นการทำความเข้าใจสมบัติของคลื่น การทำงานของแสง วงจรไฟฟ้า และการคำนวณที่เกี่ยวข้อง พร้อมตัวอย่างโจทย์ที่หลากหลาย'
  },
  'เคมี.*ม\\.4.*เทอม.*1': {
    description: 'หลักสูตรเคมีม.4 เทอม 1 ครอบคลุมโครงสร้างอะตอมและตารางธาตุ พันธะเคมี สารละลาย และกรด-เบส เน้นความเข้าใจพื้นฐานทางเคมี การจัดเรียงอิเล็กตรอน สมบัติของสารประกอบ และการคำนวณความเข้มข้น พร้อมเทคนิคการจำและวิธีแก้โจทย์'
  },
  'เคมี.*ม\\.4.*เทอม.*2': {
    description: 'หลักสูตรเคมีม.4 เทอม 2 ศึกษาเรื่องอัตราการเกิดปฏิกิริยาเคมี สมดุลเคมี เคมีอินทรีย์ และพอลิเมอร์ เน้นความเข้าใจกลไกปฏิกิริยา การคำนวณค่าคงที่สมดุล สารประกอบอินทรีย์ และการประยุกต์ใช้ในอุตสาหกรรม พร้อมตัวอย่างโจทย์ที่ท้าทาย'
  },
  'ชีวะวิทยา.*ม\\.4.*เทอม.*1': {
    description: 'หลักสูตรชีววิทยาม.4 เทอม 1 ครอบคลุมโครงสร้างและหน้าที่ของเซลล์ ระบบย่อยอาหาร ระบบหมุนเวียนเลือด และระบบหายใจ เน้นความเข้าใจกลไกการทำงานของอวัยวะต่างๆ ความสัมพันธ์ระหว่างระบบ และการทำงานของร่างกายมนุษย์ พร้อมภาพประกอบและตัวอย่างที่เข้าใจง่าย'
  },
  'ชีวะวิทยา.*ม\\.4.*เทอม.*2': {
    description: 'หลักสูตรชีววิทยาม.4 เทอม 2 ศึกษาเรื่องระบบขับถ่าย ระบบประสาท ระบบต่อมไร้ท่อ และระบบสืบพันธุ์ เน้นความเข้าใจการควบคุมและประสานงานของระบบต่างๆ การทำงานของฮอร์โมน และกระบวนการสืบพันธุ์ พร้อมการเชื่อมโยงกับสุขภาพและการดูแลร่างกาย'
  },
};

async function updateM4Descriptions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find courses by pattern matching for ม.4
    const courses = await Course.find({ 
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

    console.log(`Found ${courses.length} courses to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const course of courses) {
      const courseName = course.name;
      console.log(`Processing: ${courseName}`);
      console.log(`  Current description: ${course.description.substring(0, 80)}...`);

      // Find matching description using pattern matching
      let newDescription = null;
      for (const [pattern, data] of Object.entries(courseDescriptions)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(courseName)) {
          newDescription = data.description;
          break;
        }
      }

      if (!newDescription) {
        console.log(`  ⚠ No description found for: ${courseName}`);
        skippedCount++;
        continue;
      }

      // Update course description
      course.description = newDescription;
      await course.save();
      console.log(`  ✓ Updated description`);
      console.log(`  New description: ${newDescription.substring(0, 80)}...\n`);
      updatedCount++;
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total courses: ${courses.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateM4Descriptions();



