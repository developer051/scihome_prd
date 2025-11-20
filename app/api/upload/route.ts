import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Image from '@/models/Image';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // ตรวจสอบขนาดไฟล์ (สูงสุด 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // สร้างชื่อไฟล์ที่ไม่ซ้ำ
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name || 'image';
    const extension = originalName.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;

    // เชื่อมต่อฐานข้อมูล
    await connectDB();

    // บันทึกไฟล์ใน MongoDB
    const imageDoc = await Image.create({
      filename,
      originalName: file.name || 'image',
      mimeType: file.type,
      size: file.size,
      data: buffer,
    });

    // ส่งกลับ URL ของไฟล์ (ใช้ image ID)
    const fileUrl = `/api/images/${imageDoc._id}`;
    return NextResponse.json({ 
      url: fileUrl, 
      filename,
      imageId: imageDoc._id.toString()
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload file' 
    }, { status: 500 });
  }
}

