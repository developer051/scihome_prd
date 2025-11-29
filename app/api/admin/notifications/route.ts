import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Enrollment from '@/models/Enrollment';
import ContactMessage from '@/models/ContactMessage';

export async function GET() {
  try {
    await connectDB();
    
    // นับจำนวนการสมัครเรียนที่ยัง pending
    const pendingRegistrations = await Registration.countDocuments({ 
      status: 'pending' 
    });
    
    // นับจำนวนการลงทะเบียนคอร์สที่ยัง pending
    const pendingEnrollments = await Enrollment.countDocuments({ 
      status: 'pending' 
    });
    
    // นับจำนวนข้อความที่ยังไม่อ่าน
    const unreadMessages = await ContactMessage.countDocuments({ 
      isRead: false 
    });
    
    return NextResponse.json({
      registrations: pendingRegistrations,
      enrollments: pendingEnrollments,
      messages: unreadMessages,
      total: pendingRegistrations + pendingEnrollments + unreadMessages,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

