import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

const mockCourses = [
  {
    name: 'คณิตศาสตร์ ม.1 หลักสูตรเข้มข้น',
    description: 'หลักสูตรคณิตศาสตร์ระดับมัธยมศึกษาปีที่ 1 ที่เน้นการสร้างพื้นฐานที่แข็งแกร่ง ครอบคลุมเนื้อหาทั้งหมดตามหลักสูตรแกนกลาง พร้อมเทคนิคการแก้โจทย์ปัญหาและการคิดวิเคราะห์',
    category: 'คณิตศาสตร์',
    level: 'ม.1',
    price: 3500,
    schedule: 'จันทร์-พุธ 17:00-19:00',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    duration: '3 เดือน',
    maxStudents: 25,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'พื้นฐานจำนวนเต็ม',
        description: 'เรียนรู้เกี่ยวกับจำนวนเต็มบวก จำนวนเต็มลบ และการดำเนินการพื้นฐาน',
        order: 1,
        subLessons: [
          { title: 'จำนวนเต็มบวกและลบ', description: 'ทำความเข้าใจเกี่ยวกับจำนวนเต็มบวกและลบ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การบวกและการลบจำนวนเต็ม', description: 'ฝึกการบวกและการลบจำนวนเต็ม', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การคูณและการหารจำนวนเต็ม', description: 'เรียนรู้การคูณและการหารจำนวนเต็ม', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เศษส่วนและทศนิยม',
        description: 'ศึกษาเกี่ยวกับเศษส่วน การบวก ลบ คูณ หารเศษส่วน และทศนิยม',
        order: 2,
        subLessons: [
          { title: 'เศษส่วนและการเปรียบเทียบ', description: 'เรียนรู้เศษส่วนและการเปรียบเทียบเศษส่วน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การบวก ลบ คูณ หารเศษส่วน', description: 'ฝึกการดำเนินการกับเศษส่วน', order: 2, duration: '3 ชั่วโมง' },
          { title: 'ทศนิยมและการดำเนินการ', description: 'เรียนรู้ทศนิยมและการบวก ลบ คูณ หาร', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'พีชคณิตเบื้องต้น',
        description: 'เริ่มต้นเรียนรู้พีชคณิต การใช้ตัวแปร และสมการ',
        order: 3,
        subLessons: [
          { title: 'ตัวแปรและนิพจน์', description: 'ทำความเข้าใจตัวแปรและนิพจน์พีชคณิต', order: 1, duration: '2 ชั่วโมง' },
          { title: 'สมการเชิงเส้น', description: 'เรียนรู้การแก้สมการเชิงเส้น', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'ภาษาอังกฤษเพื่อการสื่อสาร ม.2',
    description: 'พัฒนาทักษะภาษาอังกฤษทั้ง 4 ด้าน (ฟัง พูด อ่าน เขียน) เน้นการสื่อสารในชีวิตประจำวัน การใช้ไวยากรณ์ที่ถูกต้อง และการเพิ่มพูนคำศัพท์',
    category: 'ภาษาอังกฤษ',
    level: 'ม.2',
    price: 4200,
    schedule: 'อังคาร-พฤหัสบดี 18:00-20:00',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    duration: '4 เดือน',
    maxStudents: 20,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'Present Tenses',
        description: 'เรียนรู้ Present Simple, Present Continuous และการใช้ที่ถูกต้อง',
        order: 1,
        subLessons: [
          { title: 'Present Simple', description: 'เรียนรู้โครงสร้างและการใช้ Present Simple', order: 1, duration: '2 ชั่วโมง' },
          { title: 'Present Continuous', description: 'ศึกษา Present Continuous และความแตกต่าง', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การเปรียบเทียบ Present Tenses', description: 'เปรียบเทียบและฝึกใช้ Present Tenses', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'Past Tenses',
        description: 'ศึกษา Past Simple, Past Continuous และ Past Perfect',
        order: 2,
        subLessons: [
          { title: 'Past Simple', description: 'เรียนรู้โครงสร้างและการใช้ Past Simple', order: 1, duration: '2 ชั่วโมง' },
          { title: 'Past Continuous', description: 'ศึกษา Past Continuous และการใช้งาน', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'คำศัพท์และการสื่อสาร',
        description: 'เพิ่มพูนคำศัพท์และฝึกการสื่อสารในสถานการณ์ต่างๆ',
        order: 3,
        subLessons: [
          { title: 'คำศัพท์ในชีวิตประจำวัน', description: 'เรียนรู้คำศัพท์ที่ใช้บ่อยในชีวิตประจำวัน', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การสนทนาในสถานการณ์ต่างๆ', description: 'ฝึกการสนทนาในสถานการณ์ต่างๆ', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'การอ่านและการเขียน',
        description: 'พัฒนาทักษะการอ่านและการเขียนภาษาอังกฤษ',
        order: 4,
        subLessons: [
          { title: 'การอ่านเพื่อความเข้าใจ', description: 'ฝึกการอ่านและทำความเข้าใจข้อความ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การเขียนย่อหน้า', description: 'เรียนรู้การเขียนย่อหน้าที่ถูกต้อง', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'ฟิสิกส์ ม.4 พื้นฐาน',
    description: 'เรียนรู้พื้นฐานฟิสิกส์ระดับมัธยมศึกษาตอนปลาย ครอบคลุมกลศาสตร์ แสง เสียง และไฟฟ้า พร้อมการทดลองและตัวอย่างโจทย์ที่หลากหลาย',
    category: 'ฟิสิกส์',
    level: 'ม.4',
    price: 4500,
    schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    duration: '5 เดือน',
    maxStudents: 30,
    isOnline: false,
    isOnsite: true,
    lessons: [
      {
        title: 'กลศาสตร์: การเคลื่อนที่',
        description: 'ศึกษาเกี่ยวกับการเคลื่อนที่ในแนวตรง การเคลื่อนที่แบบโปรเจกไทล์',
        order: 1,
        subLessons: [
          { title: 'การเคลื่อนที่ในแนวตรง', description: 'เรียนรู้การเคลื่อนที่ในแนวตรงและสมการ', order: 1, duration: '3 ชั่วโมง' },
          { title: 'การเคลื่อนที่แบบโปรเจกไทล์', description: 'ศึกษาโปรเจกไทล์และการคำนวณ', order: 2, duration: '3 ชั่วโมง' },
          { title: 'แรงและการเคลื่อนที่', description: 'เรียนรู้กฎของนิวตันและแรง', order: 3, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'พลังงานและงาน',
        description: 'ศึกษาเกี่ยวกับพลังงาน งาน และกฎการอนุรักษ์พลังงาน',
        order: 2,
        subLessons: [
          { title: 'งานและพลังงานจลน์', description: 'เรียนรู้งานและพลังงานจลน์', order: 1, duration: '2 ชั่วโมง' },
          { title: 'พลังงานศักย์', description: 'ศึกษาเกี่ยวกับพลังงานศักย์', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'คลื่นและเสียง',
        description: 'เรียนรู้เกี่ยวกับคลื่น คุณสมบัติของคลื่น และเสียง',
        order: 3,
        subLessons: [
          { title: 'คลื่นและการเคลื่อนที่ของคลื่น', description: 'เรียนรู้พื้นฐานของคลื่น', order: 1, duration: '2 ชั่วโมง' },
          { title: 'เสียงและคุณสมบัติ', description: 'ศึกษาเกี่ยวกับเสียงและคุณสมบัติ', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'แสงและการสะท้อน',
        description: 'ศึกษาเกี่ยวกับแสง การสะท้อน และการหักเห',
        order: 4,
        subLessons: [
          { title: 'ธรรมชาติของแสง', description: 'เรียนรู้ธรรมชาติและคุณสมบัติของแสง', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การสะท้อนและการหักเห', description: 'ศึกษาเกี่ยวกับการสะท้อนและการหักเหของแสง', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'เคมี ม.5 เตรียมสอบ',
    description: 'หลักสูตรเคมีระดับมัธยมศึกษาปีที่ 5 ที่เน้นการเตรียมตัวสอบเข้ามหาวิทยาลัย ครอบคลุมปฏิกิริยาเคมี สมดุลเคมี และเคมีอินทรีย์',
    category: 'เคมี',
    level: 'ม.5',
    price: 4800,
    schedule: 'จันทร์-พุธ-ศุกร์ 17:30-19:30',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    duration: '6 เดือน',
    maxStudents: 25,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'ปฏิกิริยาเคมี',
        description: 'ศึกษาเกี่ยวกับปฏิกิริยาเคมี ประเภทของปฏิกิริยา และอัตราการเกิดปฏิกิริยา',
        order: 1,
        subLessons: [
          { title: 'ประเภทของปฏิกิริยาเคมี', description: 'เรียนรู้ประเภทต่างๆ ของปฏิกิริยาเคมี', order: 1, duration: '2 ชั่วโมง' },
          { title: 'อัตราการเกิดปฏิกิริยา', description: 'ศึกษาเกี่ยวกับอัตราการเกิดปฏิกิริยาและปัจจัยที่มีผล', order: 2, duration: '3 ชั่วโมง' },
          { title: 'การคำนวณปฏิกิริยาเคมี', description: 'ฝึกการคำนวณเกี่ยวกับปฏิกิริยาเคมี', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'สมดุลเคมี',
        description: 'เรียนรู้เกี่ยวกับสมดุลเคมี และหลักของเลอชาเตอลิเยร์',
        order: 2,
        subLessons: [
          { title: 'สมดุลเคมีและค่าคงที่สมดุล', description: 'เรียนรู้สมดุลเคมีและค่าคงที่สมดุล', order: 1, duration: '3 ชั่วโมง' },
          { title: 'หลักของเลอชาเตอลิเยร์', description: 'ศึกษาเกี่ยวกับหลักของเลอชาเตอลิเยร์', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เคมีอินทรีย์',
        description: 'ศึกษาเกี่ยวกับสารประกอบอินทรีย์ และปฏิกิริยาของสารอินทรีย์',
        order: 3,
        subLessons: [
          { title: 'สารประกอบไฮโดรคาร์บอน', description: 'เรียนรู้สารประกอบไฮโดรคาร์บอน', order: 1, duration: '3 ชั่วโมง' },
          { title: 'ฟังก์ชันนัลกรุ๊ป', description: 'ศึกษาเกี่ยวกับฟังก์ชันนัลกรุ๊ปต่างๆ', order: 2, duration: '3 ชั่วโมง' },
          { title: 'ปฏิกิริยาของสารอินทรีย์', description: 'เรียนรู้ปฏิกิริยาของสารอินทรีย์', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'ชีววิทยา ม.6 เข้มข้น',
    description: 'หลักสูตรชีววิทยาระดับมัธยมศึกษาปีที่ 6 สำหรับนักเรียนที่ต้องการสอบเข้ามหาวิทยาลัย ครอบคลุมเซลล์ พันธุกรรม ระบบต่างๆ ในร่างกาย และนิเวศวิทยา',
    category: 'ชีววิทยา',
    level: 'ม.6',
    price: 5000,
    schedule: 'อังคาร-พฤหัสบดี 18:00-20:30',
    image: 'https://images.unsplash.com/photo-1532619675605-1ede6c9ed2ca?w=800',
    duration: '6 เดือน',
    maxStudents: 28,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'เซลล์และโครงสร้าง',
        description: 'ศึกษาโครงสร้างและหน้าที่ของเซลล์',
        order: 1,
        subLessons: [
          { title: 'โครงสร้างเซลล์', description: 'เรียนรู้โครงสร้างของเซลล์พืชและสัตว์', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ออร์แกเนลล์และหน้าที่', description: 'ศึกษาเกี่ยวกับออร์แกเนลล์ต่างๆ และหน้าที่', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'พันธุกรรม',
        description: 'เรียนรู้เกี่ยวกับพันธุกรรม การถ่ายทอดลักษณะ และ DNA',
        order: 2,
        subLessons: [
          { title: 'กฎของเมนเดล', description: 'ศึกษาเกี่ยวกับกฎการถ่ายทอดลักษณะของเมนเดล', order: 1, duration: '3 ชั่วโมง' },
          { title: 'DNA และ RNA', description: 'เรียนรู้โครงสร้างและหน้าที่ของ DNA และ RNA', order: 2, duration: '3 ชั่วโมง' },
          { title: 'การถ่ายทอดลักษณะ', description: 'ศึกษาเกี่ยวกับการถ่ายทอดลักษณะทางพันธุกรรม', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ระบบต่างๆ ในร่างกาย',
        description: 'ศึกษาเกี่ยวกับระบบต่างๆ ในร่างกายมนุษย์',
        order: 3,
        subLessons: [
          { title: 'ระบบหายใจ', description: 'เรียนรู้เกี่ยวกับระบบหายใจ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ระบบหมุนเวียนเลือด', description: 'ศึกษาเกี่ยวกับระบบหมุนเวียนเลือด', order: 2, duration: '2 ชั่วโมง' },
          { title: 'ระบบย่อยอาหาร', description: 'เรียนรู้เกี่ยวกับระบบย่อยอาหาร', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'นิเวศวิทยา',
        description: 'ศึกษาเกี่ยวกับระบบนิเวศ และความสัมพันธ์ระหว่างสิ่งมีชีวิต',
        order: 4,
        subLessons: [
          { title: 'ระบบนิเวศ', description: 'เรียนรู้เกี่ยวกับระบบนิเวศและองค์ประกอบ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ห่วงโซ่อาหาร', description: 'ศึกษาเกี่ยวกับห่วงโซ่อาหารและสายใยอาหาร', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'สังคมศึกษา ม.3 ครบวงจร',
    description: 'เรียนรู้สังคมศึกษาแบบครบวงจร ครอบคลุมประวัติศาสตร์ ภูมิศาสตร์ เศรษฐศาสตร์ และหน้าที่พลเมือง พร้อมการวิเคราะห์เหตุการณ์ปัจจุบัน',
    category: 'สังคมศึกษา',
    level: 'ม.3',
    price: 3200,
    schedule: 'เสาร์ 13:00-16:00',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    duration: '3 เดือน',
    maxStudents: 35,
    isOnline: true,
    isOnsite: false,
    lessons: [
      {
        title: 'ประวัติศาสตร์ไทย',
        description: 'ศึกษาเกี่ยวกับประวัติศาสตร์ไทยตั้งแต่สมัยสุโขทัยจนถึงปัจจุบัน',
        order: 1,
        subLessons: [
          { title: 'สมัยสุโขทัย', description: 'เรียนรู้ประวัติศาสตร์สมัยสุโขทัย', order: 1, duration: '2 ชั่วโมง' },
          { title: 'สมัยอยุธยา', description: 'ศึกษาเกี่ยวกับสมัยอยุธยา', order: 2, duration: '2 ชั่วโมง' },
          { title: 'สมัยรัตนโกสินทร์', description: 'เรียนรู้ประวัติศาสตร์สมัยรัตนโกสินทร์', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ภูมิศาสตร์',
        description: 'ศึกษาเกี่ยวกับภูมิศาสตร์ประเทศไทยและโลก',
        order: 2,
        subLessons: [
          { title: 'ภูมิศาสตร์ประเทศไทย', description: 'เรียนรู้ภูมิศาสตร์ประเทศไทย', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ภูมิศาสตร์โลก', description: 'ศึกษาเกี่ยวกับภูมิศาสตร์โลก', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'เศรษฐศาสตร์',
        description: 'เรียนรู้พื้นฐานเศรษฐศาสตร์และการเงิน',
        order: 3,
        subLessons: [
          { title: 'เศรษฐศาสตร์เบื้องต้น', description: 'เรียนรู้พื้นฐานเศรษฐศาสตร์', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ระบบเศรษฐกิจ', description: 'ศึกษาเกี่ยวกับระบบเศรษฐกิจ', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'ภาษาไทย ม.2 วรรณคดีและภาษา',
    description: 'พัฒนาทักษะภาษาไทยทั้งการอ่าน การเขียน การวิเคราะห์วรรณคดี และการใช้ภาษาไทยที่ถูกต้องตามหลักไวยากรณ์',
    category: 'ภาษาไทย',
    level: 'ม.2',
    price: 3800,
    schedule: 'พุธ-ศุกร์ 17:00-19:00',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    duration: '4 เดือน',
    maxStudents: 22,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'ไวยากรณ์ไทย',
        description: 'เรียนรู้หลักไวยากรณ์ไทยและการใช้ภาษาให้ถูกต้อง',
        order: 1,
        subLessons: [
          { title: 'ชนิดของคำ', description: 'เรียนรู้ชนิดของคำในภาษาไทย', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ประโยคและการสร้างประโยค', description: 'ศึกษาเกี่ยวกับประโยคและการสร้างประโยค', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'วรรณคดีไทย',
        description: 'ศึกษาและวิเคราะห์วรรณคดีไทยที่สำคัญ',
        order: 2,
        subLessons: [
          { title: 'วรรณคดีสมัยอยุธยา', description: 'เรียนรู้วรรณคดีสมัยอยุธยา', order: 1, duration: '2 ชั่วโมง' },
          { title: 'วรรณคดีสมัยรัตนโกสินทร์', description: 'ศึกษาเกี่ยวกับวรรณคดีสมัยรัตนโกสินทร์', order: 2, duration: '2 ชั่วโมง' },
          { title: 'การวิเคราะห์วรรณคดี', description: 'ฝึกการวิเคราะห์วรรณคดี', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'การอ่านและการเขียน',
        description: 'พัฒนาทักษะการอ่านและการเขียนภาษาไทย',
        order: 3,
        subLessons: [
          { title: 'การอ่านเพื่อความเข้าใจ', description: 'ฝึกการอ่านและทำความเข้าใจ', order: 1, duration: '2 ชั่วโมง' },
          { title: 'การเขียนเรียงความ', description: 'เรียนรู้การเขียนเรียงความ', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'คณิตศาสตร์ ม.6 เตรียมสอบเข้ามหาวิทยาลัย',
    description: 'หลักสูตรคณิตศาสตร์ระดับมัธยมศึกษาปีที่ 6 สำหรับเตรียมสอบเข้ามหาวิทยาลัย ครอบคลุมแคลคูลัส สถิติ ความน่าจะเป็น และโจทย์ปัญหาแบบเข้มข้น',
    category: 'คณิตศาสตร์',
    level: 'ม.6',
    price: 5500,
    schedule: 'เสาร์-อาทิตย์ 09:00-12:00',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    duration: '8 เดือน',
    maxStudents: 20,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'แคลคูลัส',
        description: 'ศึกษาเกี่ยวกับลิมิต อนุพันธ์ และอินทิกรัล',
        order: 1,
        subLessons: [
          { title: 'ลิมิตและความต่อเนื่อง', description: 'เรียนรู้ลิมิตและความต่อเนื่อง', order: 1, duration: '3 ชั่วโมง' },
          { title: 'อนุพันธ์', description: 'ศึกษาเกี่ยวกับอนุพันธ์และการประยุกต์', order: 2, duration: '4 ชั่วโมง' },
          { title: 'อินทิกรัล', description: 'เรียนรู้อินทิกรัลและการประยุกต์', order: 3, duration: '4 ชั่วโมง' },
        ],
      },
      {
        title: 'สถิติและความน่าจะเป็น',
        description: 'เรียนรู้สถิติ การวิเคราะห์ข้อมูล และความน่าจะเป็น',
        order: 2,
        subLessons: [
          { title: 'สถิติเชิงพรรณนา', description: 'เรียนรู้สถิติเชิงพรรณนาและการวิเคราะห์ข้อมูล', order: 1, duration: '3 ชั่วโมง' },
          { title: 'ความน่าจะเป็น', description: 'ศึกษาเกี่ยวกับความน่าจะเป็น', order: 2, duration: '3 ชั่วโมง' },
          { title: 'การแจกแจงความน่าจะเป็น', description: 'เรียนรู้การแจกแจงความน่าจะเป็น', order: 3, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'โจทย์ปัญหาแบบเข้มข้น',
        description: 'ฝึกทำโจทย์ปัญหาที่ซับซ้อนเพื่อเตรียมสอบ',
        order: 3,
        subLessons: [
          { title: 'โจทย์แคลคูลัส', description: 'ฝึกทำโจทย์แคลคูลัสที่ซับซ้อน', order: 1, duration: '3 ชั่วโมง' },
          { title: 'โจทย์สถิติและความน่าจะเป็น', description: 'ฝึกทำโจทย์สถิติและความน่าจะเป็น', order: 2, duration: '3 ชั่วโมง' },
          { title: 'ข้อสอบย้อนหลัง', description: 'ฝึกทำข้อสอบย้อนหลัง', order: 3, duration: '4 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'ภาษาอังกฤษเพื่อการสอบ TOEFL/IELTS',
    description: 'หลักสูตรภาษาอังกฤษเพื่อเตรียมสอบ TOEFL และ IELTS สำหรับนักเรียนที่ต้องการศึกษาต่อต่างประเทศ เน้นเทคนิคการทำข้อสอบและการพัฒนาทักษะทั้ง 4 ด้าน',
    category: 'ภาษาอังกฤษ',
    level: 'เตรียมสอบเข้า',
    price: 6000,
    schedule: 'จันทร์-อังคาร-พุธ 18:00-20:00',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    duration: '6 เดือน',
    maxStudents: 15,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'Reading Skills',
        description: 'พัฒนาทักษะการอ่านเพื่อทำข้อสอบ TOEFL/IELTS',
        order: 1,
        subLessons: [
          { title: 'เทคนิคการอ่านเร็ว', description: 'เรียนรู้เทคนิคการอ่านเร็วและจับใจความ', order: 1, duration: '3 ชั่วโมง' },
          { title: 'การทำข้อสอบ Reading', description: 'ฝึกทำข้อสอบ Reading และเทคนิคต่างๆ', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'Listening Skills',
        description: 'พัฒนาทักษะการฟังเพื่อทำข้อสอบ',
        order: 2,
        subLessons: [
          { title: 'เทคนิคการฟัง', description: 'เรียนรู้เทคนิคการฟังและจับใจความ', order: 1, duration: '3 ชั่วโมง' },
          { title: 'การทำข้อสอบ Listening', description: 'ฝึกทำข้อสอบ Listening', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'Speaking Skills',
        description: 'พัฒนาทักษะการพูดเพื่อทำข้อสอบ',
        order: 3,
        subLessons: [
          { title: 'เทคนิคการพูด', description: 'เรียนรู้เทคนิคการพูดและโครงสร้างคำตอบ', order: 1, duration: '3 ชั่วโมง' },
          { title: 'การทำข้อสอบ Speaking', description: 'ฝึกทำข้อสอบ Speaking', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'Writing Skills',
        description: 'พัฒนาทักษะการเขียนเพื่อทำข้อสอบ',
        order: 4,
        subLessons: [
          { title: 'การเขียน Essay', description: 'เรียนรู้การเขียน Essay ที่มีประสิทธิภาพ', order: 1, duration: '4 ชั่วโมง' },
          { title: 'การทำข้อสอบ Writing', description: 'ฝึกทำข้อสอบ Writing', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'ข้อสอบจำลอง',
        description: 'ฝึกทำข้อสอบจำลอง TOEFL/IELTS',
        order: 5,
        subLessons: [
          { title: 'ข้อสอบจำลอง TOEFL', description: 'ฝึกทำข้อสอบจำลอง TOEFL', order: 1, duration: '4 ชั่วโมง' },
          { title: 'ข้อสอบจำลอง IELTS', description: 'ฝึกทำข้อสอบจำลอง IELTS', order: 2, duration: '4 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    name: 'ฟิสิกส์ ม.5-6 เข้มข้นสำหรับสอบเข้ามหาวิทยาลัย',
    description: 'หลักสูตรฟิสิกส์ระดับมัธยมศึกษาตอนปลายที่เน้นการเตรียมสอบเข้ามหาวิทยาลัย ครอบคลุมทุกบทเรียน พร้อมเทคนิคการแก้โจทย์และข้อสอบย้อนหลัง',
    category: 'ฟิสิกส์',
    level: 'ม.6',
    price: 5800,
    schedule: 'อังคาร-พฤหัสบดี-เสาร์ 17:30-20:00',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    duration: '8 เดือน',
    maxStudents: 25,
    isOnline: true,
    isOnsite: true,
    lessons: [
      {
        title: 'กลศาสตร์ขั้นสูง',
        description: 'ศึกษาเกี่ยวกับกลศาสตร์ขั้นสูง การเคลื่อนที่แบบหมุน และการสั่น',
        order: 1,
        subLessons: [
          { title: 'การเคลื่อนที่แบบหมุน', description: 'เรียนรู้การเคลื่อนที่แบบหมุน', order: 1, duration: '3 ชั่วโมง' },
          { title: 'การสั่นและคลื่น', description: 'ศึกษาเกี่ยวกับการสั่นและคลื่น', order: 2, duration: '3 ชั่วโมง' },
          { title: 'โจทย์กลศาสตร์ขั้นสูง', description: 'ฝึกทำโจทย์กลศาสตร์ที่ซับซ้อน', order: 3, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'ไฟฟ้าและแม่เหล็ก',
        description: 'เรียนรู้เกี่ยวกับไฟฟ้า แม่เหล็ก และไฟฟ้ากระแสสลับ',
        order: 2,
        subLessons: [
          { title: 'ไฟฟ้าสถิต', description: 'เรียนรู้ไฟฟ้าสถิตและศักย์ไฟฟ้า', order: 1, duration: '3 ชั่วโมง' },
          { title: 'ไฟฟ้ากระแส', description: 'ศึกษาเกี่ยวกับไฟฟ้ากระแสและวงจร', order: 2, duration: '3 ชั่วโมง' },
          { title: 'แม่เหล็กและไฟฟ้ากระแสสลับ', description: 'เรียนรู้แม่เหล็กและไฟฟ้ากระแสสลับ', order: 3, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'คลื่นและแสง',
        description: 'ศึกษาเกี่ยวกับคลื่น แสง และทัศนศาสตร์',
        order: 3,
        subLessons: [
          { title: 'คลื่นกลและคลื่นแม่เหล็กไฟฟ้า', description: 'เรียนรู้คลื่นกลและคลื่นแม่เหล็กไฟฟ้า', order: 1, duration: '3 ชั่วโมง' },
          { title: 'ทัศนศาสตร์', description: 'ศึกษาเกี่ยวกับทัศนศาสตร์และการหักเห', order: 2, duration: '3 ชั่วโมง' },
        ],
      },
      {
        title: 'ฟิสิกส์อะตอมและนิวเคลียร์',
        description: 'เรียนรู้เกี่ยวกับฟิสิกส์อะตอมและนิวเคลียร์',
        order: 4,
        subLessons: [
          { title: 'ฟิสิกส์อะตอม', description: 'ศึกษาเกี่ยวกับฟิสิกส์อะตอม', order: 1, duration: '2 ชั่วโมง' },
          { title: 'ฟิสิกส์นิวเคลียร์', description: 'เรียนรู้ฟิสิกส์นิวเคลียร์', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
      {
        title: 'ข้อสอบย้อนหลังและเทคนิค',
        description: 'ฝึกทำข้อสอบย้อนหลังและเรียนรู้เทคนิคการทำข้อสอบ',
        order: 5,
        subLessons: [
          { title: 'ข้อสอบย้อนหลัง', description: 'ฝึกทำข้อสอบย้อนหลัง', order: 1, duration: '4 ชั่วโมง' },
          { title: 'เทคนิคการทำข้อสอบ', description: 'เรียนรู้เทคนิคการทำข้อสอบให้ได้คะแนนสูง', order: 2, duration: '2 ชั่วโมง' },
        ],
      },
    ],
  },
];

// Export mockCourses for use in other modules
export { mockCourses };

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const categoryId = searchParams.get('categoryId');
    const populate = searchParams.get('populate') === 'true';
    
    // Build query
    let query: any = {};
    if (sectionId) {
      query.sectionId = sectionId;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    let coursesQuery = Course.find(query).sort({ createdAt: -1 });
    
    // Populate sectionId and categoryId if requested
    if (populate) {
      coursesQuery = coursesQuery.populate('sectionId').populate({
        path: 'categoryId',
        populate: { path: 'sectionId' }
      });
    }
    
    let courses = await coursesQuery;
    
    // ถ้ายังไม่มีข้อมูลในฐานข้อมูล ให้เพิ่ม mock data
    if (courses.length === 0 && !sectionId && !categoryId) {
      await Course.insertMany(mockCourses);
      coursesQuery = Course.find(query).sort({ createdAt: -1 });
      if (populate) {
        coursesQuery = coursesQuery.populate('sectionId').populate({
          path: 'categoryId',
          populate: { path: 'sectionId' }
        });
      }
      courses = await coursesQuery;
    } else {
      // อัปเดต lessons ให้กับหลักสูตรที่ยังไม่มี lessons
      // สร้าง map ของ mock courses ตามชื่อ
      const mockCoursesMap = new Map();
      mockCourses.forEach(mockCourse => {
        mockCoursesMap.set(mockCourse.name, mockCourse);
      });
      
      // อัปเดต lessons ให้กับหลักสูตรที่ยังไม่มี
      const updatePromises = courses.map(async (course) => {
        if (!course.lessons || course.lessons.length === 0) {
          const mockCourse = mockCoursesMap.get(course.name);
          if (mockCourse && mockCourse.lessons && mockCourse.lessons.length > 0) {
            await Course.findByIdAndUpdate(course._id, {
              $set: { lessons: mockCourse.lessons }
            });
          }
        }
      });
      
      await Promise.all(updatePromises);
      
      // ดึงข้อมูลใหม่หลังจากอัปเดต
      coursesQuery = Course.find(query).sort({ createdAt: -1 });
      if (populate) {
        coursesQuery = coursesQuery.populate('sectionId').populate({
          path: 'categoryId',
          populate: { path: 'sectionId' }
        });
      }
      courses = await coursesQuery;
    }
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
