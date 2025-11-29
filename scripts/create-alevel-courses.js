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

async function createALevelCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find A-Level section
    const alevelSection = await Section.findOne({ name: 'A-Level' });
    if (!alevelSection) {
      throw new Error('A-Level section not found');
    }
    console.log('Found A-Level section:', alevelSection._id);

    // Find A-Level categories
    const categories = {
      math: await Category.findOne({ name: 'A-Level คณิตศาสตร์', sectionId: alevelSection._id }),
      physics: await Category.findOne({ name: 'A-Level ฟิสิกส์', sectionId: alevelSection._id }),
      chemistry: await Category.findOne({ name: 'A-Level เคมี', sectionId: alevelSection._id }),
      biology: await Category.findOne({ name: 'A-Level ชีวะวิทยา', sectionId: alevelSection._id }),
      thai: await Category.findOne({ name: 'A-Level ภาษาไทย', sectionId: alevelSection._id }),
      social: await Category.findOne({ name: 'A-Level สังคมศึกษา', sectionId: alevelSection._id }),
      english: await Category.findOne({ name: 'A-Level ภาษาอังกฤษ', sectionId: alevelSection._id }),
    };

    // Check if all categories exist
    const missingCategories = Object.entries(categories)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingCategories.length > 0) {
      throw new Error(`Missing categories: ${missingCategories.join(', ')}`);
    }

    console.log('Found all A-Level categories');

    // ========== A-Level คณิตศาสตร์ ==========
    const mathData = {
      name: 'A-Level คณิตศาสตร์',
      description: 'หลักสูตรเตรียมสอบ A-Level คณิตศาสตร์ ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level Mathematics เน้นการทำความเข้าใจแนวคิดทางคณิตศาสตร์ การแก้โจทย์ปัญหา และการประยุกต์ใช้ในสถานการณ์จริง พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'คณิตศาสตร์',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.math._id,
      price: 6500,
      schedule: 'จันทร์-พุธ-ศุกร์ 17:00-19:30',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      duration: '6 เดือน',
      maxStudents: 25,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'พีชคณิตและฟังก์ชัน (Algebra and Functions)',
          description: 'ศึกษาเกี่ยวกับพีชคณิต ฟังก์ชัน และสมการ รวมถึงการแก้สมการพหุนาม ฟังก์ชันเอกซ์โพเนนเชียล และลอการิทึม',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'พีชคณิตพื้นฐาน',
              description: 'ทบทวนพีชคณิตพื้นฐาน การดำเนินการกับพหุนาม และการแยกตัวประกอบ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ฟังก์ชันและกราฟ',
              description: 'เรียนรู้เกี่ยวกับฟังก์ชัน การหาโดเมนและเรนจ์ การวาดกราฟ และการแปลงกราฟ',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม',
              description: 'ศึกษาเกี่ยวกับฟังก์ชันเอกซ์โพเนนเชียล ลอการิทึม และการแก้สมการเอกซ์โพเนนเชียลและลอการิทึม',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สมการและอสมการ',
              description: 'เรียนรู้การแก้สมการพหุนาม สมการตรรกยะ และอสมการ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ตรีโกณมิติ (Trigonometry)',
          description: 'ศึกษาเกี่ยวกับฟังก์ชันตรีโกณมิติ สมการตรีโกณมิติ และการประยุกต์ใช้',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ฟังก์ชันตรีโกณมิติพื้นฐาน',
              description: 'เรียนรู้เกี่ยวกับ sin, cos, tan และฟังก์ชันตรีโกณมิติผกผัน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เอกลักษณ์และสูตรตรีโกณมิติ',
              description: 'ศึกษาเอกลักษณ์ตรีโกณมิติ สูตรผลบวกและผลต่าง และสูตรมุมสองเท่า',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สมการตรีโกณมิติ',
              description: 'เรียนรู้การแก้สมการตรีโกณมิติและการประยุกต์ใช้',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กฎของไซน์และโคไซน์',
              description: 'ศึกษาเกี่ยวกับกฎของไซน์และโคไซน์และการประยุกต์ใช้ในการแก้ปัญหา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แคลคูลัส (Calculus)',
          description: 'ศึกษาเกี่ยวกับลิมิต อนุพันธ์ และอินทิกรัล รวมถึงการประยุกต์ใช้',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ลิมิตและความต่อเนื่อง',
              description: 'เรียนรู้เกี่ยวกับลิมิตของฟังก์ชัน ความต่อเนื่อง และกฎของลิมิต',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'อนุพันธ์',
              description: 'ศึกษาเกี่ยวกับอนุพันธ์ กฎการหาอนุพันธ์ และอนุพันธ์ของฟังก์ชันประกอบ',
              order: 2,
              duration: '5 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การประยุกต์ใช้อนุพันธ์',
              description: 'เรียนรู้การใช้อนุพันธ์ในการหาค่าสูงสุดต่ำสุด และการวาดกราฟ',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'อินทิกรัล',
              description: 'ศึกษาเกี่ยวกับอินทิกรัลไม่จำกัดเขต อินทิกรัลจำกัดเขต และเทคนิคการอินทิเกรต',
              order: 4,
              duration: '5 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การประยุกต์ใช้อินทิกรัล',
              description: 'เรียนรู้การใช้อินทิกรัลในการหาพื้นที่และปริมาตร',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เวกเตอร์และเรขาคณิตวิเคราะห์ (Vectors and Coordinate Geometry)',
          description: 'ศึกษาเกี่ยวกับเวกเตอร์ การดำเนินการกับเวกเตอร์ และเรขาคณิตวิเคราะห์',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เวกเตอร์ในสองและสามมิติ',
              description: 'เรียนรู้เกี่ยวกับเวกเตอร์ การบวก ลบ และคูณเวกเตอร์',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ผลคูณสเกลาร์และผลคูณเวกเตอร์',
              description: 'ศึกษาเกี่ยวกับผลคูณสเกลาร์ (dot product) และผลคูณเวกเตอร์ (cross product)',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เรขาคณิตวิเคราะห์',
              description: 'เรียนรู้เกี่ยวกับเส้นตรง วงกลม พาราโบลา วงรี และไฮเพอร์โบลา',
              order: 3,
              duration: '5 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'สถิติและความน่าจะเป็น (Statistics and Probability)',
          description: 'ศึกษาเกี่ยวกับสถิติเชิงพรรณนา สถิติเชิงอนุมาน และความน่าจะเป็น',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'สถิติเชิงพรรณนา',
              description: 'เรียนรู้เกี่ยวกับการวัดค่ากลาง การวัดการกระจาย และการแสดงข้อมูล',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ความน่าจะเป็น',
              description: 'ศึกษาเกี่ยวกับกฎความน่าจะเป็น การจัดเรียง และการจัดหมู่',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแจกแจงความน่าจะเป็น',
              description: 'เรียนรู้เกี่ยวกับการแจกแจงแบบทวินาม การแจกแจงแบบปกติ และการแจกแจงแบบปัวซอง',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สถิติเชิงอนุมาน',
              description: 'ศึกษาเกี่ยวกับการทดสอบสมมติฐาน และช่วงความเชื่อมั่น',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'จำนวนเชิงซ้อน (Complex Numbers)',
          description: 'ศึกษาเกี่ยวกับจำนวนเชิงซ้อน การดำเนินการกับจำนวนเชิงซ้อน และรูปแบบเชิงขั้ว',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'จำนวนเชิงซ้อนพื้นฐาน',
              description: 'เรียนรู้เกี่ยวกับจำนวนเชิงซ้อน การบวก ลบ คูณ และหาร',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'รูปแบบเชิงขั้วและทฤษฎีบทเดอมัวร์',
              description: 'ศึกษาเกี่ยวกับรูปแบบเชิงขั้วของจำนวนเชิงซ้อน และทฤษฎีบทเดอมัวร์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'รากของจำนวนเชิงซ้อน',
              description: 'เรียนรู้การหารากของจำนวนเชิงซ้อนและการประยุกต์ใช้',
              order: 3,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level คณิตศาสตร์จากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 7,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level คณิตศาสตร์จากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level คณิตศาสตร์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อผิดพลาด',
              description: 'วิเคราะห์ข้อผิดพลาดที่พบบ่อยและวิธีป้องกัน',
              order: 3,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // ========== A-Level ฟิสิกส์ ==========
    const physicsData = {
      name: 'A-Level ฟิสิกส์',
      description: 'หลักสูตรเตรียมสอบ A-Level ฟิสิกส์ ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level Physics เน้นการทำความเข้าใจหลักการทางฟิสิกส์ การแก้โจทย์ปัญหา และการทดลอง พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'ฟิสิกส์',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.physics._id,
      price: 6500,
      schedule: 'อังคาร-พฤหัสบดี-เสาร์ 17:00-19:30',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      duration: '6 เดือน',
      maxStudents: 25,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'กลศาสตร์ (Mechanics)',
          description: 'ศึกษาเกี่ยวกับการเคลื่อนที่ แรง พลังงาน และโมเมนตัม',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การเคลื่อนที่ในหนึ่งมิติและสองมิติ',
              description: 'เรียนรู้เกี่ยวกับการเคลื่อนที่แบบเส้นตรง การเคลื่อนที่แบบโปรเจกไทล์ และการเคลื่อนที่แบบวงกลม',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กฎการเคลื่อนที่ของนิวตัน',
              description: 'ศึกษาเกี่ยวกับกฎการเคลื่อนที่ของนิวตัน แรง และแรงเสียดทาน',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'งาน พลังงาน และกำลัง',
              description: 'เรียนรู้เกี่ยวกับงาน พลังงานจลน์ พลังงานศักย์ และกฎการอนุรักษ์พลังงาน',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'โมเมนตัมและการชน',
              description: 'ศึกษาเกี่ยวกับโมเมนตัม การชนแบบยืดหยุ่นและไม่ยืดหยุ่น',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเคลื่อนที่แบบหมุน',
              description: 'เรียนรู้เกี่ยวกับการเคลื่อนที่แบบหมุน โมเมนต์ความเฉื่อย และโมเมนตัมเชิงมุม',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'คลื่นและแสง (Waves and Optics)',
          description: 'ศึกษาเกี่ยวกับคลื่นกล คลื่นแม่เหล็กไฟฟ้า และแสง',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'คลื่นกล',
              description: 'เรียนรู้เกี่ยวกับคลื่นตามขวางและตามยาว สมบัติของคลื่น และการแทรกสอด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คลื่นเสียง',
              description: 'ศึกษาเกี่ยวกับคลื่นเสียง ความถี่ธรรมชาติ และปรากฏการณ์ดอปเพลอร์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แสงและการสะท้อน',
              description: 'เรียนรู้เกี่ยวกับการสะท้อนของแสง กระจก และการสร้างภาพ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การหักเหและการเลี้ยวเบน',
              description: 'ศึกษาเกี่ยวกับการหักเหของแสง เลนส์ และการเลี้ยวเบน',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแทรกสอดของแสง',
              description: 'เรียนรู้เกี่ยวกับการแทรกสอดของแสง ริ้วรอย และสเปกโตรสโกปี',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ไฟฟ้าและแม่เหล็ก (Electricity and Magnetism)',
          description: 'ศึกษาเกี่ยวกับไฟฟ้าสถิต ไฟฟ้ากระแส และแม่เหล็ก',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ไฟฟ้าสถิต',
              description: 'เรียนรู้เกี่ยวกับประจุไฟฟ้า สนามไฟฟ้า และศักย์ไฟฟ้า',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ไฟฟ้ากระแส',
              description: 'ศึกษาเกี่ยวกับกระแสไฟฟ้า ความต้านทาน และกฎของโอห์ม',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'วงจรไฟฟ้า',
              description: 'เรียนรู้เกี่ยวกับวงจรอนุกรมและขนาน กำลังไฟฟ้า และพลังงานไฟฟ้า',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แม่เหล็กและสนามแม่เหล็ก',
              description: 'ศึกษาเกี่ยวกับแม่เหล็ก สนามแม่เหล็ก และแรงแม่เหล็ก',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ไฟฟ้ากระแสสลับ',
              description: 'เรียนรู้เกี่ยวกับไฟฟ้ากระแสสลับ หม้อแปลง และมอเตอร์',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ฟิสิกส์ยุคใหม่ (Modern Physics)',
          description: 'ศึกษาเกี่ยวกับฟิสิกส์ควอนตัม ฟิสิกส์นิวเคลียร์ และฟิสิกส์อะตอม',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ฟิสิกส์ควอนตัม',
              description: 'เรียนรู้เกี่ยวกับทฤษฎีควอนตัม ปรากฏการณ์โฟโตอิเล็กทริก และคลื่นของสสาร',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ฟิสิกส์อะตอม',
              description: 'ศึกษาเกี่ยวกับแบบจำลองอะตอม สเปกตรัม และเลเซอร์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ฟิสิกส์นิวเคลียร์',
              description: 'เรียนรู้เกี่ยวกับนิวเคลียส กัมมันตภาพรังสี และปฏิกิริยานิวเคลียร์',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'อุณหพลศาสตร์ (Thermodynamics)',
          description: 'ศึกษาเกี่ยวกับอุณหภูมิ ความร้อน และกฎของอุณหพลศาสตร์',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'อุณหภูมิและความร้อน',
              description: 'เรียนรู้เกี่ยวกับอุณหภูมิ การขยายตัว และความจุความร้อน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กฎของอุณหพลศาสตร์',
              description: 'ศึกษาเกี่ยวกับกฎข้อที่หนึ่งและข้อที่สองของอุณหพลศาสตร์',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เครื่องยนต์ความร้อน',
              description: 'เรียนรู้เกี่ยวกับเครื่องยนต์ความร้อนและประสิทธิภาพ',
              order: 3,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level ฟิสิกส์จากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level ฟิสิกส์จากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level ฟิสิกส์',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // ========== A-Level เคมี ==========
    const chemistryData = {
      name: 'A-Level เคมี',
      description: 'หลักสูตรเตรียมสอบ A-Level เคมี ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level Chemistry เน้นการทำความเข้าใจหลักการทางเคมี การคำนวณ และการทดลอง พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'เคมี',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.chemistry._id,
      price: 6500,
      schedule: 'จันทร์-พุธ-ศุกร์ 17:00-19:30',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
      duration: '6 เดือน',
      maxStudents: 25,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'อะตอม โมเลกุล และพันธะเคมี (Atoms, Molecules and Chemical Bonding)',
          description: 'ศึกษาเกี่ยวกับโครงสร้างอะตอม พันธะเคมี และคุณสมบัติของสาร',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โครงสร้างอะตอม',
              description: 'เรียนรู้เกี่ยวกับแบบจำลองอะตอม ออร์บิทัล และการจัดเรียงอิเล็กตรอน',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ตารางธาตุ',
              description: 'ศึกษาเกี่ยวกับตารางธาตุและแนวโน้มคุณสมบัติของธาตุ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธะไอออนิก',
              description: 'เรียนรู้เกี่ยวกับพันธะไอออนิก โครงสร้างผลึก และคุณสมบัติ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธะโควาเลนต์',
              description: 'ศึกษาเกี่ยวกับพันธะโควาเลนต์ โครงสร้างโมเลกุล และเรโซแนนซ์',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธะโลหะและแรงระหว่างโมเลกุล',
              description: 'เรียนรู้เกี่ยวกับพันธะโลหะ แรงแวนเดอร์วาลส์ และพันธะไฮโดรเจน',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'สโตอิชิโอเมทรี (Stoichiometry)',
          description: 'ศึกษาเกี่ยวกับการคำนวณทางเคมี สมการเคมี และสารละลาย',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โมลและมวลโมเลกุล',
              description: 'เรียนรู้เกี่ยวกับโมล มวลอะตอม และมวลโมเลกุล',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สมการเคมีและการคำนวณ',
              description: 'ศึกษาเกี่ยวกับการเขียนสมการเคมีและการคำนวณปริมาณสาร',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สารละลายและความเข้มข้น',
              description: 'เรียนรู้เกี่ยวกับการเตรียมสารละลายและความเข้มข้น',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การไทเทรต',
              description: 'ศึกษาเกี่ยวกับการไทเทรตและการคำนวณ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เคมีอินทรีย์ (Organic Chemistry)',
          description: 'ศึกษาเกี่ยวกับสารประกอบอินทรีย์ ปฏิกิริยา และการสังเคราะห์',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ไฮโดรคาร์บอน',
              description: 'เรียนรู้เกี่ยวกับอัลเคน อัลคีน และอัลไคน์',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'แอลกอฮอล์ อีเทอร์ และอัลดีไฮด์',
              description: 'ศึกษาเกี่ยวกับแอลกอฮอล์ อีเทอร์ อัลดีไฮด์ และคีโทน',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรดคาร์บอกซิลิกและอนุพันธ์',
              description: 'เรียนรู้เกี่ยวกับกรดคาร์บอกซิลิก เอสเทอร์ และเอไมด์',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ปฏิกิริยาเคมีอินทรีย์',
              description: 'ศึกษาเกี่ยวกับปฏิกิริยาการแทนที่ การเติม และการกำจัด',
              order: 4,
              duration: '5 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พอลิเมอร์',
              description: 'เรียนรู้เกี่ยวกับพอลิเมอร์และการสังเคราะห์',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เคมีอนินทรีย์ (Inorganic Chemistry)',
          description: 'ศึกษาเกี่ยวกับธาตุและสารประกอบอนินทรีย์',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ธาตุกลุ่ม 1 และ 2',
              description: 'เรียนรู้เกี่ยวกับโลหะอัลคาไลและอัลคาไลน์เอิร์ท',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ธาตุกลุ่ม 17 (ฮาโลเจน)',
              description: 'ศึกษาเกี่ยวกับฮาโลเจนและสารประกอบ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ธาตุกลุ่ม 18 (แก๊สมีตระกูล)',
              description: 'เรียนรู้เกี่ยวกับแก๊สมีตระกูลและคุณสมบัติ',
              order: 3,
              duration: '2 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ธาตุทรานซิชัน',
              description: 'ศึกษาเกี่ยวกับธาตุทรานซิชันและสารประกอบเชิงซ้อน',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'เคมีกายภาพ (Physical Chemistry)',
          description: 'ศึกษาเกี่ยวกับอุณหพลศาสตร์ เคมีจลน์ และสมดุลเคมี',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'อุณหพลศาสตร์เคมี',
              description: 'เรียนรู้เกี่ยวกับเอนทาลปี เอนโทรปี และพลังงานอิสระ',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เคมีจลน์',
              description: 'ศึกษาเกี่ยวกับอัตราการเกิดปฏิกิริยาและปัจจัยที่มีผล',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สมดุลเคมี',
              description: 'เรียนรู้เกี่ยวกับสมดุลเคมี และหลักของเลอชาเตอลิเยร์',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กรด-เบส',
              description: 'ศึกษาเกี่ยวกับทฤษฎีกรด-เบส pH และบัฟเฟอร์',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ไฟฟ้าเคมี',
              description: 'เรียนรู้เกี่ยวกับเซลล์ไฟฟ้าเคมีและอิเล็กโทรไลซิส',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level เคมีจากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level เคมีจากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level เคมี',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // ========== A-Level ชีววิทยา ==========
    const biologyData = {
      name: 'A-Level ชีววิทยา',
      description: 'หลักสูตรเตรียมสอบ A-Level ชีววิทยา ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level Biology เน้นการทำความเข้าใจหลักการทางชีววิทยา การสังเกต และการทดลอง พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'ชีววิทยา',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.biology._id,
      price: 6500,
      schedule: 'อังคาร-พฤหัสบดี-เสาร์ 17:00-19:30',
      image: 'https://images.unsplash.com/photo-1532619675605-1ede6c4ed2b5?w=800',
      duration: '6 เดือน',
      maxStudents: 25,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'เซลล์และชีววิทยาระดับโมเลกุล (Cell and Molecular Biology)',
          description: 'ศึกษาเกี่ยวกับโครงสร้างและหน้าที่ของเซลล์ และชีววิทยาระดับโมเลกุล',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'โครงสร้างเซลล์',
              description: 'เรียนรู้เกี่ยวกับโครงสร้างของเซลล์พืชและเซลล์สัตว์',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เยื่อหุ้มเซลล์และการขนส่ง',
              description: 'ศึกษาเกี่ยวกับเยื่อหุ้มเซลล์และการขนส่งสารผ่านเยื่อหุ้ม',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ดีเอ็นเอและอาร์เอ็นเอ',
              description: 'เรียนรู้เกี่ยวกับโครงสร้างและหน้าที่ของดีเอ็นเอและอาร์เอ็นเอ',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การสังเคราะห์โปรตีน',
              description: 'ศึกษาเกี่ยวกับการถอดรหัสและการแปลรหัส',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การแบ่งเซลล์',
              description: 'เรียนรู้เกี่ยวกับไมโทซิสและไมโอซิส',
              order: 5,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'พันธุศาสตร์ (Genetics)',
          description: 'ศึกษาเกี่ยวกับพันธุกรรมและการถ่ายทอดลักษณะ',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'กฎของเมนเดล',
              description: 'เรียนรู้เกี่ยวกับกฎการแยกตัวและกฎการรวมกลุ่มอิสระ',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธุกรรมที่ซับซ้อน',
              description: 'ศึกษาเกี่ยวกับการถ่ายทอดลักษณะที่ควบคุมด้วยยีนหลายคู่',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'พันธุกรรมโครโมโซม',
              description: 'เรียนรู้เกี่ยวกับการเชื่อมโยงของยีนและการข้าม',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การกลายพันธุ์',
              description: 'ศึกษาเกี่ยวกับการกลายพันธุ์และผลกระทบ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'สรีรวิทยา (Physiology)',
          description: 'ศึกษาเกี่ยวกับการทำงานของระบบต่างๆ ในร่างกาย',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ระบบหายใจ',
              description: 'เรียนรู้เกี่ยวกับโครงสร้างและหน้าที่ของระบบหายใจ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบหมุนเวียนเลือด',
              description: 'ศึกษาเกี่ยวกับหัวใจ หลอดเลือด และการไหลเวียนเลือด',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบย่อยอาหาร',
              description: 'เรียนรู้เกี่ยวกับโครงสร้างและหน้าที่ของระบบย่อยอาหาร',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบขับถ่าย',
              description: 'ศึกษาเกี่ยวกับไตและการสร้างปัสสาวะ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบประสาท',
              description: 'เรียนรู้เกี่ยวกับระบบประสาทและการทำงาน',
              order: 5,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ระบบต่อมไร้ท่อ',
              description: 'ศึกษาเกี่ยวกับฮอร์โมนและการควบคุม',
              order: 6,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'นิเวศวิทยา (Ecology)',
          description: 'ศึกษาเกี่ยวกับความสัมพันธ์ระหว่างสิ่งมีชีวิตกับสิ่งแวดล้อม',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ประชากร',
              description: 'เรียนรู้เกี่ยวกับประชากรและการเจริญเติบโต',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ชุมชนและระบบนิเวศ',
              description: 'ศึกษาเกี่ยวกับความสัมพันธ์ในชุมชนและระบบนิเวศ',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'วัฏจักรสารและการถ่ายทอดพลังงาน',
              description: 'เรียนรู้เกี่ยวกับวัฏจักรสารและห่วงโซ่อาหาร',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอนุรักษ์',
              description: 'ศึกษาเกี่ยวกับการอนุรักษ์ทรัพยากรธรรมชาติ',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'วิวัฒนาการ (Evolution)',
          description: 'ศึกษาเกี่ยวกับทฤษฎีวิวัฒนาการและหลักฐาน',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ทฤษฎีวิวัฒนาการ',
              description: 'เรียนรู้เกี่ยวกับทฤษฎีวิวัฒนาการของดาร์วิน',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'หลักฐานวิวัฒนาการ',
              description: 'ศึกษาเกี่ยวกับหลักฐานทางวิวัฒนาการ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กลไกวิวัฒนาการ',
              description: 'เรียนรู้เกี่ยวกับการคัดเลือกโดยธรรมชาติและการกลายพันธุ์',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level ชีววิทยาจากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level ชีววิทยาจากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level ชีววิทยา',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // ========== A-Level ภาษาไทย ==========
    const thaiData = {
      name: 'A-Level ภาษาไทย',
      description: 'หลักสูตรเตรียมสอบ A-Level ภาษาไทย ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level Thai Language เน้นการทำความเข้าใจภาษาไทย การอ่าน การเขียน และการวิเคราะห์วรรณกรรม พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'ภาษาไทย',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.thai._id,
      price: 5500,
      schedule: 'จันทร์-พุธ 18:00-20:00',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      duration: '5 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'หลักภาษาไทย',
          description: 'ศึกษาเกี่ยวกับหลักภาษาไทย ไวยากรณ์ และการใช้ภาษา',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เสียงและอักษรไทย',
              description: 'เรียนรู้เกี่ยวกับระบบเสียงภาษาไทย และอักษรไทย',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คำและชนิดของคำ',
              description: 'ศึกษาเกี่ยวกับชนิดของคำและการใช้คำ',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ประโยคและการสร้างประโยค',
              description: 'เรียนรู้เกี่ยวกับโครงสร้างประโยคและชนิดของประโยค',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การใช้ภาษาให้ถูกต้อง',
              description: 'ศึกษาเกี่ยวกับการใช้ภาษาไทยให้ถูกต้องตามหลักภาษา',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การอ่านและการวิเคราะห์',
          description: 'ศึกษาเกี่ยวกับการอ่านเพื่อความเข้าใจและการวิเคราะห์ข้อความ',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การอ่านเพื่อความเข้าใจ',
              description: 'เรียนรู้เทคนิคการอ่านและจับใจความ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อความ',
              description: 'ศึกษาเกี่ยวกับการวิเคราะห์ข้อความและการตีความ',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอ่านวรรณกรรม',
              description: 'เรียนรู้เกี่ยวกับการอ่านและวิเคราะห์วรรณกรรม',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การเขียน',
          description: 'ศึกษาเกี่ยวกับการเขียนและการเรียบเรียงข้อความ',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การเขียนย่อหน้า',
              description: 'เรียนรู้เกี่ยวกับการเขียนย่อหน้าที่ถูกต้อง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเรียงความ',
              description: 'ศึกษาเกี่ยวกับการเขียนเรียงความและการจัดโครงสร้าง',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเชิงวิเคราะห์',
              description: 'เรียนรู้เกี่ยวกับการเขียนเชิงวิเคราะห์และวิจารณ์',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'วรรณกรรมไทย',
          description: 'ศึกษาเกี่ยวกับวรรณกรรมไทยทั้งสมัยเก่าและสมัยใหม่',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'วรรณกรรมสมัยสุโขทัยและอยุธยา',
              description: 'เรียนรู้เกี่ยวกับวรรณกรรมสมัยสุโขทัยและอยุธยา',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'วรรณกรรมสมัยรัตนโกสินทร์',
              description: 'ศึกษาเกี่ยวกับวรรณกรรมสมัยรัตนโกสินทร์',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'วรรณกรรมร่วมสมัย',
              description: 'เรียนรู้เกี่ยวกับวรรณกรรมร่วมสมัย',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level ภาษาไทยจากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level ภาษาไทยจากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level ภาษาไทย',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // ========== A-Level สังคมศึกษา ==========
    const socialData = {
      name: 'A-Level สังคมศึกษา',
      description: 'หลักสูตรเตรียมสอบ A-Level สังคมศึกษา ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level Social Studies เน้นการทำความเข้าใจสังคม เศรษฐกิจ การเมือง และประวัติศาสตร์ พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'สังคมศึกษา',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.social._id,
      price: 5500,
      schedule: 'อังคาร-พฤหัสบดี 18:00-20:00',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      duration: '5 เดือน',
      maxStudents: 30,
      isOnline: true,
      isOnsite: true,
      isActive: true,
      lessons: [
        {
          title: 'เศรษฐศาสตร์ (Economics)',
          description: 'ศึกษาเกี่ยวกับเศรษฐศาสตร์เบื้องต้น เศรษฐกิจมหภาค และเศรษฐศาสตร์จุลภาค',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เศรษฐศาสตร์เบื้องต้น',
              description: 'เรียนรู้เกี่ยวกับเศรษฐศาสตร์และระบบเศรษฐกิจ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'อุปสงค์และอุปทาน',
              description: 'ศึกษาเกี่ยวกับกฎของอุปสงค์และอุปทาน และราคาดุลยภาพ',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เศรษฐศาสตร์มหภาค',
              description: 'เรียนรู้เกี่ยวกับ GDP อัตราเงินเฟ้อ และการเงิน',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เศรษฐศาสตร์ระหว่างประเทศ',
              description: 'ศึกษาเกี่ยวกับการค้าระหว่างประเทศและอัตราแลกเปลี่ยน',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ประวัติศาสตร์ (History)',
          description: 'ศึกษาเกี่ยวกับประวัติศาสตร์ไทยและประวัติศาสตร์โลก',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ประวัติศาสตร์ไทยสมัยสุโขทัยและอยุธยา',
              description: 'เรียนรู้เกี่ยวกับประวัติศาสตร์ไทยสมัยสุโขทัยและอยุธยา',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ประวัติศาสตร์ไทยสมัยรัตนโกสินทร์',
              description: 'ศึกษาเกี่ยวกับประวัติศาสตร์ไทยสมัยรัตนโกสินทร์',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ประวัติศาสตร์โลก',
              description: 'เรียนรู้เกี่ยวกับประวัติศาสตร์โลกที่สำคัญ',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'ภูมิศาสตร์ (Geography)',
          description: 'ศึกษาเกี่ยวกับภูมิศาสตร์กายภาพและภูมิศาสตร์มนุษย์',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ภูมิศาสตร์กายภาพ',
              description: 'เรียนรู้เกี่ยวกับภูมิประเทศ ภูมิอากาศ และทรัพยากรธรรมชาติ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ภูมิศาสตร์มนุษย์',
              description: 'ศึกษาเกี่ยวกับประชากร การตั้งถิ่นฐาน และการพัฒนา',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'ภูมิศาสตร์ประเทศไทย',
              description: 'เรียนรู้เกี่ยวกับภูมิศาสตร์ของประเทศไทย',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'รัฐศาสตร์ (Political Science)',
          description: 'ศึกษาเกี่ยวกับการเมืองการปกครองและกฎหมาย',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การเมืองการปกครอง',
              description: 'เรียนรู้เกี่ยวกับรูปแบบการปกครองและระบบการเมือง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'กฎหมายพื้นฐาน',
              description: 'ศึกษาเกี่ยวกับกฎหมายพื้นฐานและสิทธิพลเมือง',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเมืองไทย',
              description: 'เรียนรู้เกี่ยวกับการเมืองการปกครองของไทย',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level สังคมศึกษาจากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level สังคมศึกษาจากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level สังคมศึกษา',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // ========== A-Level ภาษาอังกฤษ ==========
    const englishData = {
      name: 'A-Level ภาษาอังกฤษ',
      description: 'หลักสูตรเตรียมสอบ A-Level ภาษาอังกฤษ ครอบคลุมเนื้อหาครบถ้วนตามหลักสูตร A-Level English Language เน้นการพัฒนาทักษะการฟัง พูด อ่าน และเขียนภาษาอังกฤษ พร้อมเทคนิคการทำข้อสอบและตัวอย่างข้อสอบที่หลากหลาย',
      category: 'ภาษาอังกฤษ',
      level: 'เตรียมสอบเข้า',
      sectionId: alevelSection._id,
      categoryId: categories.english._id,
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
          title: 'ไวยากรณ์ภาษาอังกฤษ (English Grammar)',
          description: 'ศึกษาเกี่ยวกับไวยากรณ์ภาษาอังกฤษที่สำคัญสำหรับการสอบ A-Level',
          order: 1,
          youtubeLink: '',
          subLessons: [
            {
              title: 'Tenses และโครงสร้างประโยค',
              description: 'เรียนรู้เกี่ยวกับ Tenses ทั้ง 12 และโครงสร้างประโยค',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'Modal Verbs และ Conditionals',
              description: 'ศึกษาเกี่ยวกับ Modal Verbs และประโยคเงื่อนไข',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'Passive Voice และ Reported Speech',
              description: 'เรียนรู้เกี่ยวกับ Passive Voice และ Reported Speech',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'Relative Clauses และ Complex Sentences',
              description: 'ศึกษาเกี่ยวกับ Relative Clauses และประโยคซับซ้อน',
              order: 4,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การอ่าน (Reading Comprehension)',
          description: 'ศึกษาเกี่ยวกับการอ่านเพื่อความเข้าใจและการวิเคราะห์ข้อความ',
          order: 2,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เทคนิคการอ่านเร็ว',
              description: 'เรียนรู้เทคนิคการอ่านเร็วและการจับใจความ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอ่านเพื่อหาข้อมูล',
              description: 'ศึกษาเกี่ยวกับการอ่านเพื่อหาข้อมูลเฉพาะ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การวิเคราะห์ข้อความ',
              description: 'เรียนรู้เกี่ยวกับการวิเคราะห์ข้อความและการตีความ',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การอ่านวรรณกรรม',
              description: 'ศึกษาเกี่ยวกับการอ่านและวิเคราะห์วรรณกรรม',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การเขียน (Writing)',
          description: 'ศึกษาเกี่ยวกับการเขียนภาษาอังกฤษในรูปแบบต่างๆ',
          order: 3,
          youtubeLink: '',
          subLessons: [
            {
              title: 'การเขียนย่อหน้า',
              description: 'เรียนรู้เกี่ยวกับการเขียนย่อหน้าที่ถูกต้อง',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเรียงความ',
              description: 'ศึกษาเกี่ยวกับการเขียนเรียงความและการจัดโครงสร้าง',
              order: 2,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเชิงวิเคราะห์',
              description: 'เรียนรู้เกี่ยวกับการเขียนเชิงวิเคราะห์และวิจารณ์',
              order: 3,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การเขียนเชิงสร้างสรรค์',
              description: 'ศึกษาเกี่ยวกับการเขียนเชิงสร้างสรรค์',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'การฟังและการพูด (Listening and Speaking)',
          description: 'ศึกษาเกี่ยวกับทักษะการฟังและการพูดภาษาอังกฤษ',
          order: 4,
          youtubeLink: '',
          subLessons: [
            {
              title: 'เทคนิคการฟัง',
              description: 'เรียนรู้เทคนิคการฟังและการจับใจความ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การฟังเพื่อหาข้อมูล',
              description: 'ศึกษาเกี่ยวกับการฟังเพื่อหาข้อมูลเฉพาะ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การพูดและการนำเสนอ',
              description: 'เรียนรู้เกี่ยวกับการพูดและการนำเสนอ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'การสนทนาและการอภิปราย',
              description: 'ศึกษาเกี่ยวกับการสนทนาและการอภิปราย',
              order: 4,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'คำศัพท์และสำนวน (Vocabulary and Idioms)',
          description: 'ศึกษาเกี่ยวกับคำศัพท์และสำนวนที่ใช้บ่อยในการสอบ A-Level',
          order: 5,
          youtubeLink: '',
          subLessons: [
            {
              title: 'คำศัพท์ระดับสูง',
              description: 'เรียนรู้คำศัพท์ระดับสูงที่ใช้ในการสอบ',
              order: 1,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'สำนวนและวลี',
              description: 'ศึกษาเกี่ยวกับสำนวนและวลีที่ใช้บ่อย',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'คำศัพท์ทางวิชาการ',
              description: 'เรียนรู้คำศัพท์ทางวิชาการที่ใช้ในการสอบ',
              order: 3,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
        {
          title: 'แบบฝึกหัดและข้อสอบเก่า',
          description: 'ฝึกทำข้อสอบ A-Level ภาษาอังกฤษจากปีที่ผ่านมา พร้อมเฉลยและเทคนิคการทำข้อสอบ',
          order: 6,
          youtubeLink: '',
          subLessons: [
            {
              title: 'ข้อสอบปีล่าสุด',
              description: 'ฝึกทำข้อสอบ A-Level ภาษาอังกฤษจากปีล่าสุด',
              order: 1,
              duration: '4 ชั่วโมง',
              youtubeLink: '',
            },
            {
              title: 'เทคนิคการทำข้อสอบ',
              description: 'เรียนรู้เทคนิคและกลยุทธ์ในการทำข้อสอบ A-Level ภาษาอังกฤษ',
              order: 2,
              duration: '3 ชั่วโมง',
              youtubeLink: '',
            },
          ],
        },
      ],
    };

    // Create or update all courses
    const coursesData = [
      { data: mathData, name: 'A-Level คณิตศาสตร์' },
      { data: physicsData, name: 'A-Level ฟิสิกส์' },
      { data: chemistryData, name: 'A-Level เคมี' },
      { data: biologyData, name: 'A-Level ชีววิทยา' },
      { data: thaiData, name: 'A-Level ภาษาไทย' },
      { data: socialData, name: 'A-Level สังคมศึกษา' },
      { data: englishData, name: 'A-Level ภาษาอังกฤษ' },
    ];

    for (const { data, name } of coursesData) {
      let course = await Course.findOne({
        name: data.name,
        categoryId: data.categoryId,
      });

      if (course) {
        console.log(`\nUpdating existing ${name} course...`);
        course.set(data);
        await course.save();
        console.log(`${name} course updated successfully!`);
        console.log(`- Lessons: ${course.lessons.length}`);
        console.log(`- Total SubLessons: ${course.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0)}`);
      } else {
        console.log(`\nCreating new ${name} course...`);
        course = await Course.create(data);
        console.log(`${name} course created successfully!`);
        console.log(`- Lessons: ${course.lessons.length}`);
        console.log(`- Total SubLessons: ${course.lessons.reduce((sum, lesson) => sum + lesson.subLessons.length, 0)}`);
      }
    }

    console.log('\n=== All A-Level courses created/updated successfully! ===');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createALevelCourses();

