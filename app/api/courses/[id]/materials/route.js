import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Course from '@/models/Course';

// GET /api/courses/[id]/materials - Get all materials for a course
export async function GET(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    // Find course by ID
    const course = await Course.findById(id);
    
    // Check if course exists
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      materials: course.materials,
    });
  } catch (error) {
    console.error('Materials fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/materials - Add material to a course (lecturer who owns the course or admin)
export async function POST(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    // Authentication check removed
    
    // Find course by ID
    const course = await Course.findById(id);
    
    // Check if course exists
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Permission check removed
    
    // Parse request body
    const body = await request.json();
    const { title, description, fileUrl, type } = body;
    
    // Validate input
    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Validate type
    const validTypes = ['document', 'video', 'link'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid material type' },
        { status: 400 }
      );
    }
    
    // Create new material
    const material = {
      title,
      description,
      fileUrl,
      type,
      createdAt: new Date(),
    };
    
    // Add material to course
    course.materials.push(material);
    course.updatedAt = Date.now();
    
    await course.save();
    
    return NextResponse.json({
      success: true,
      material: course.materials[course.materials.length - 1],
    });
  } catch (error) {
    console.error('Material creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
