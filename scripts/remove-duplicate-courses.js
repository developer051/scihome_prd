const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const DEFAULT_URI = 'mongodb://localhost:27017/scihome';
const uri = process.env.MONGODB_URI || DEFAULT_URI;
const explicitDb = process.env.MONGODB_DB;

const deriveDbName = (connectionString) => {
  if (explicitDb) {
    return explicitDb;
  }
  try {
    const parsed = new URL(connectionString);
    const pathname = parsed.pathname.replace(/^\//, '');
    return pathname || 'scihome';
  } catch {
    return 'scihome';
  }
};

const dbName = deriveDbName(uri);

// ฟังก์ชันสำหรับสร้าง key สำหรับตรวจสอบหลักสูตรซ้ำ
function getCourseKey(course) {
  return `${course.name}|${course.category}|${course.level}`;
}

// ฟังก์ชันตรวจสอบว่าหลักสูตรถูกใช้งานหรือไม่
async function isCourseUsed(db, courseId) {
  const courseIdObj = courseId instanceof ObjectId ? courseId : new ObjectId(courseId);
  const courseIdStr = courseId.toString();
  
  // ตรวจสอบจาก Enrollment
  const enrollmentCount = await db.collection('enrollments').countDocuments({
    courseId: courseIdObj
  });
  
  if (enrollmentCount > 0) {
    return { used: true, reason: `มี ${enrollmentCount} การลงทะเบียน` };
  }
  
  // ตรวจสอบจาก Registration (courseId)
  const registrationByCourseId = await db.collection('studentmanagement').countDocuments({
    courseId: courseIdStr
  });
  
  if (registrationByCourseId > 0) {
    return { used: true, reason: `มี ${registrationByCourseId} การลงทะเบียนใน Registration (courseId)` };
  }
  
  // ตรวจสอบจาก Registration (allowedCourses)
  const registrationByAllowedCourses = await db.collection('studentmanagement').countDocuments({
    allowedCourses: courseIdStr
  });
  
  if (registrationByAllowedCourses > 0) {
    return { used: true, reason: `มี ${registrationByAllowedCourses} การลงทะเบียนใน Registration (allowedCourses)` };
  }
  
  return { used: false, reason: 'ไม่มีการใช้งาน' };
}

async function removeDuplicateCourses() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 กำลังเชื่อมต่อ MongoDB...');
    console.log('MongoDB URI:', uri.replace(/\/\/.*@/, '//***@'));
    console.log('Database:', dbName);
    
    await client.connect();
    const db = client.db(dbName);
    
    console.log('✅ เชื่อมต่อสำเร็จ\n');
    
    // ดึงข้อมูลหลักสูตรทั้งหมด
    console.log('📚 กำลังดึงข้อมูลหลักสูตรทั้งหมด...');
    const courses = await db.collection('courses').find({}).toArray();
    console.log(`พบหลักสูตรทั้งหมด: ${courses.length} หลักสูตร\n`);
    
    if (courses.length === 0) {
      console.log('⚠️  ไม่พบหลักสูตรในฐานข้อมูล');
      return;
    }
    
    // จัดกลุ่มหลักสูตรตาม key (name + category + level)
    const courseGroups = {};
    
    for (const course of courses) {
      const key = getCourseKey(course);
      if (!courseGroups[key]) {
        courseGroups[key] = [];
      }
      courseGroups[key].push(course);
    }
    
    // หาหลักสูตรซ้ำ (กลุ่มที่มีมากกว่า 1 หลักสูตร)
    const duplicateGroups = Object.entries(courseGroups).filter(
      ([key, group]) => group.length > 1
    );
    
    console.log(`🔍 พบกลุ่มหลักสูตรซ้ำ: ${duplicateGroups.length} กลุ่ม\n`);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ ไม่พบหลักสูตรซ้ำ');
      return;
    }
    
    let totalDeleted = 0;
    let totalKept = 0;
    
    // ตรวจสอบและลบหลักสูตรซ้ำในแต่ละกลุ่ม
    for (const [key, group] of duplicateGroups) {
      console.log(`\n📋 กลุ่ม: ${key}`);
      console.log(`   พบ ${group.length} หลักสูตรซ้ำ`);
      
      // ตรวจสอบว่าหลักสูตรไหนถูกใช้งาน
      const usageInfo = [];
      
      for (const course of group) {
        const usage = await isCourseUsed(db, course._id);
        usageInfo.push({
          course,
          usage,
        });
        
        console.log(`   - ${course.name} (ID: ${course._id}): ${usage.reason}`);
      }
      
      // แยกหลักสูตรที่ถูกใช้งานและไม่ได้ใช้งาน
      const usedCourses = usageInfo.filter(info => info.usage.used);
      const unusedCourses = usageInfo.filter(info => !info.usage.used);
      
      // ตัดสินใจว่าควรเก็บหลักสูตรไหนไว้
      let coursesToKeep = [];
      let coursesToDelete = [];
      
      if (usedCourses.length > 0) {
        // ถ้ามีหลักสูตรที่ถูกใช้งาน ให้เก็บไว้ทั้งหมด
        coursesToKeep = usedCourses;
        coursesToDelete = unusedCourses;
        
        // ถ้ามีหลายตัวที่ถูกใช้งาน ให้เก็บตัวที่สร้างล่าสุด
        if (usedCourses.length > 1) {
          // เรียงตาม createdAt (ล่าสุดก่อน)
          usedCourses.sort((a, b) => {
            const dateA = new Date(a.course.createdAt || 0);
            const dateB = new Date(b.course.createdAt || 0);
            return dateB - dateA;
          });
          
          // เก็บตัวแรก (ล่าสุด) ไว้ ลบตัวอื่น
          coursesToKeep = [usedCourses[0]];
          coursesToDelete = [...usedCourses.slice(1), ...unusedCourses];
        }
      } else {
        // ถ้าไม่มีตัวไหนถูกใช้งานเลย ให้เก็บตัวที่สร้างล่าสุด
        usageInfo.sort((a, b) => {
          const dateA = new Date(a.course.createdAt || 0);
          const dateB = new Date(b.course.createdAt || 0);
          return dateB - dateA;
        });
        
        coursesToKeep = [usageInfo[0]];
        coursesToDelete = usageInfo.slice(1);
      }
      
      // ลบหลักสูตรที่ไม่ได้ใช้งาน
      for (const info of coursesToDelete) {
        const courseId = info.course._id instanceof ObjectId ? info.course._id : new ObjectId(info.course._id);
        console.log(`   🗑️  กำลังลบ: ${info.course.name} (ID: ${courseId})`);
        await db.collection('courses').deleteOne({ _id: courseId });
        totalDeleted++;
      }
      
      // แสดงหลักสูตรที่เก็บไว้
      for (const info of coursesToKeep) {
        console.log(`   ✅ เก็บไว้: ${info.course.name} (ID: ${info.course._id})`);
        totalKept++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 สรุปผลการทำงาน:');
    console.log(`   ✅ เก็บหลักสูตรไว้: ${totalKept} หลักสูตร`);
    console.log(`   🗑️  ลบหลักสูตร: ${totalDeleted} หลักสูตร`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ ปิดการเชื่อมต่อ MongoDB');
  }
}

// รันสคริปต์
removeDuplicateCourses();

