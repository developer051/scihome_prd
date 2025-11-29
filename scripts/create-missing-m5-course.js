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
const Section = mongoose.models.Section || mongoose.model('Section', new mongoose.Schema({}, { strict: false }));

async function createMissingCourse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the category "คอร์ส Upgrade [ม.5]"
    const category = await Category.findOne({ name: 'คอร์ส Upgrade [ม.5]' });
    if (!category) {
      console.log('Category "คอร์ส Upgrade [ม.5]" not found');
      await mongoose.disconnect();
      return;
    }

    // Find section 3 (คอร์ส Upgrade)
    const section = await Section.findOne({ name: 'คอร์ส Upgrade' });
    if (!section) {
      console.log('Section "คอร์ส Upgrade" not found');
      await mongoose.disconnect();
      return;
    }

    // Check if "ฟิสิกส์ ม.5 เทอม 2" exists
    const existingCourse = await Course.findOne({ 
      $or: [
        { name: 'ฟิสิกส์ ม.5 เทอม 2' },
        { name: 'ฟิสิกส์ [ม.5 เทอม 2]' },
        { name: { $regex: 'ฟิสิกส์.*ม\\.5.*เทอม.*2', $options: 'i' } }
      ]
    });

    if (existingCourse) {
      console.log(`Course already exists: ${existingCourse.name}`);
      await mongoose.disconnect();
      return;
    }

    // Create the missing course
    const newCourse = new Course({
      name: 'ฟิสิกส์ [ม.5 เทอม 2]',
      description: 'หลักสูตรฟิสิกส์ชั้นมัธยมศึกษาปีที่ 5 เทอม 2 ครอบคลุมเนื้อหาคลื่นแม่เหล็กไฟฟ้า ไฟฟ้ากระแสสลับ ฟิสิกส์อะตอม และฟิสิกส์นิวเคลียร์ เพื่อเตรียมความพร้อมสำหรับการสอบเข้ามหาวิทยาลัย',
      category: 'ฟิสิกส์',
      level: 'ม.5',
      sectionId: section._id,
      categoryId: category._id,
      price: 2500,
      schedule: 'จันทร์-พุธ 17:00-19:00',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      duration: '3 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: false,
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
    });

    await newCourse.save();
    console.log(`✓ Created course: ${newCourse.name}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createMissingCourse();

