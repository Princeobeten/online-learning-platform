import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User'; // Import User model for populate

// GET /api/courses/[id] - Get course by ID
export async function GET(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    // Find course by ID
    const course = await Course.findById(id)
      .populate('lecturerId', 'name email');
    
    // Check if course exists
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Update course (lecturer who owns the course or admin)
export async function PATCH(request, { params }) {
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
    
    // Authentication check removed
    
    // Parse request body
    const body = await request.json();
    const { title, description, thumbnail } = body;
    
    // Update course fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnail) course.thumbnail = thumbnail;
    
    course.updatedAt = Date.now();
    
    await course.save();
    
    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('Course update error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course (lecturer who owns the course or admin)
export async function DELETE(request, { params }) {
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
    
    // Authentication check removed
    
    // Delete course
    await Course.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Course deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
