import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    
    let query: any = {};
    if (sectionId) {
      query.sectionId = sectionId;
    }
    
    const categories = await Category.find(query).sort({ order: 1 }).populate('sectionId');
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const category = await Category.create(body);
    const populatedCategory = await Category.findById(category._id).populate('sectionId');
    return NextResponse.json(populatedCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}







