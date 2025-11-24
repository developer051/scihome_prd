import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const registration = await Registration.findById(params.id);
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // ไม่ส่ง password กลับไป
    const { password: _, ...registrationResponse } = registration.toObject();
    
    return NextResponse.json(registrationResponse);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // ตรวจสอบว่ามี registration อยู่หรือไม่
    const existingRegistration = await Registration.findById(params.id);
    if (!existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // ถ้ามีการส่ง password มาด้วย ให้ hash password
    let updateData = { ...body };
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    
    // ถ้ามีการเปลี่ยน username ให้ตรวจสอบว่าไม่ซ้ำ
    if (body.username && body.username.toLowerCase() !== existingRegistration.username) {
      const existingUser = await Registration.findOne({ 
        username: body.username.toLowerCase(),
        _id: { $ne: params.id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น' },
          { status: 400 }
        );
      }
      updateData.username = body.username.toLowerCase();
    }
    
    const registration = await Registration.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // ไม่ส่ง password กลับไป
    const { password: _, ...registrationResponse } = registration.toObject();
    
    return NextResponse.json(registrationResponse);
  } catch (error: any) {
    console.error('Update registration error:', error);
    
    // จัดการ error จาก MongoDB (เช่น duplicate key)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update registration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const registration = await Registration.findByIdAndDelete(params.id);
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}

