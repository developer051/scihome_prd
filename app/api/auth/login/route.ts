import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password } = body;
    
    // ตรวจสอบว่ามี username และ password หรือไม่
    if (!username || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }
    
    // ค้นหาผู้ใช้ด้วย username (case-insensitive)
    const user = await Registration.findOne({ 
      username: username.toLowerCase() 
    }).select('+password'); // ต้อง select password เพราะมี select: false ใน schema
    
    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!user) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }
    
    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }
    
    // สร้าง response โดยไม่รวม password
    const { password: _, ...userResponse } = user.toObject();
    
    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userResponse,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}

