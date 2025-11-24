import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';

export async function POST() {
  try {
    await connectDB();

    // เพิ่มข่าว 4 ข่าวเกี่ยวกับการศึกษา
    const newNews = [
      {
        title: 'เทรนด์การศึกษาในยุค AI: การปรับตัวของระบบการศึกษาไทย',
        content: 'ในยุคที่เทคโนโลยี AI เข้ามามีบทบาทสำคัญในชีวิตประจำวัน ระบบการศึกษาของไทยกำลังปรับตัวเพื่อให้ทันกับความเปลี่ยนแปลง โดยมีการนำ AI มาใช้ในการเรียนการสอน การประเมินผล และการพัฒนาหลักสูตร เพื่อเตรียมนักเรียนให้พร้อมสำหรับอนาคตที่เทคโนโลยีจะเข้ามามีบทบาทมากขึ้น',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-11-20'),
      },
      {
        title: 'โครงการพัฒนาทักษะ Coding สำหรับเยาวชน เปิดรับสมัครแล้ว',
        content: 'กระทรวงศึกษาธิการร่วมกับหน่วยงานภาคเอกชน จัดโครงการพัฒนาทักษะ Coding สำหรับเยาวชนอายุ 12-18 ปี โดยไม่เสียค่าใช้จ่าย โครงการนี้มุ่งเน้นการสร้างพื้นฐานการเขียนโปรแกรมที่แข็งแกร่ง และเตรียมความพร้อมให้เยาวชนเข้าสู่โลกดิจิทัล เปิดรับสมัครตั้งแต่วันนี้จนถึงสิ้นเดือนพฤศจิกายน',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-11-18'),
      },
      {
        title: 'ผลสำรวจ: นักเรียนไทยให้ความสำคัญกับการเรียนออนไลน์เพิ่มขึ้น 40%',
        content: 'ผลการสำรวจล่าสุดพบว่านักเรียนไทยให้ความสำคัญกับการเรียนออนไลน์เพิ่มขึ้น 40% เมื่อเทียบกับปีที่แล้ว โดยเห็นว่าการเรียนออนไลน์มีความยืดหยุ่นและสามารถเรียนได้ทุกที่ทุกเวลา นอกจากนี้ยังพบว่านักเรียนส่วนใหญ่ต้องการให้มีการผสมผสานระหว่างการเรียนออนไลน์และออนไซต์เพื่อประสิทธิภาพสูงสุด',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-11-15'),
      },
      {
        title: 'กิจกรรม Science Fair 2024: แสดงผลงานวิทยาศาสตร์ของนักเรียนทั่วประเทศ',
        content: 'งาน Science Fair 2024 จัดขึ้นที่ศูนย์ประชุมแห่งชาติสิริกิติ์ ระหว่างวันที่ 25-27 พฤศจิกายน 2567 โดยมีนักเรียนจากทั่วประเทศเข้าร่วมแสดงผลงานวิทยาศาสตร์และนวัตกรรมที่น่าสนใจ งานนี้เป็นโอกาสดีสำหรับนักเรียนในการแลกเปลี่ยนความรู้และประสบการณ์ รวมถึงการพบปะกับนักวิทยาศาสตร์และผู้เชี่ยวชาญในสาขาต่างๆ',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
        author: 'ทีมงาน SciHome',
        isPublished: true,
        publishedAt: new Date('2024-11-12'),
      },
    ];

    const createdNews = await News.insertMany(newNews);
    
    return NextResponse.json({
      message: `เพิ่มข่าวสำเร็จ: ${createdNews.length} ข่าว`,
      news: createdNews,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error seeding news:', error);
    return NextResponse.json(
      { error: 'Failed to seed news', details: error.message },
      { status: 500 }
    );
  }
}

