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

const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
const Section = mongoose.models.Section || mongoose.model('Section', new mongoose.Schema({}, { strict: false }));
const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

async function fixM5Courses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find section "คอร์ส Upgrade [ม.5]"
    const section = await Section.findOne({ name: 'คอร์ส Upgrade [ม.5]' });
    if (!section) {
      console.log('Section "คอร์ส Upgrade [ม.5]" not found');
      await mongoose.disconnect();
      return;
    }
    console.log(`Found section: ${section.name} (${section._id})\n`);

    // Find or create category "คอร์ส Upgrade [ม.5]"
    let category = await Category.findOne({ name: 'คอร์ส Upgrade [ม.5]' });
    if (!category) {
      category = new Category({
        name: 'คอร์ส Upgrade [ม.5]',
        sectionId: section._id,
      });
      await category.save();
      console.log(`✓ Created category: ${category.name}\n`);
    } else {
      console.log(`Found category: ${category.name} (${category._id})\n`);
    }

    // Update all ม.5 courses to have the correct categoryId
    const m5Courses = await Course.find({ 
      sectionId: section._id
    });
    
    console.log(`Found ${m5Courses.length} courses in section\n`);
    
    for (const course of m5Courses) {
      if (!course.categoryId || course.categoryId.toString() !== category._id.toString()) {
        course.categoryId = category._id;
        await course.save();
        console.log(`✓ Updated ${course.name} with categoryId`);
      }
    }

    // Check if "ฟิสิกส์ ม.5 เทอม 2" exists
    const existingCourse = await Course.findOne({ 
      sectionId: section._id,
      $or: [
        { name: 'ฟิสิกส์ ม.5 เทอม 2' },
        { name: 'ฟิสิกส์ [ม.5 เทอม 2]' },
        { name: { $regex: 'ฟิสิกส์.*ม\\.5.*เทอม.*2', $options: 'i' } }
      ]
    });

    if (!existingCourse) {
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
      console.log(`✓ Created course: ${newCourse.name}\n`);
    } else {
      console.log(`Course already exists: ${existingCourse.name}\n`);
    }

    // Run the content update script again
    console.log('Running content update script...\n');
    const { exec } = require('child_process');
    exec('node scripts/create-upgrade-m5-content.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return;
      }
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
      mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    });

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixM5Courses();

