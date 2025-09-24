import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import User from '@/models/User'; // Import User model for populate

// GET /api/assessments - Get assessments for a course
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Authentication check removed
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    // Validate input
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Access check removed
    
    // Get all assessments for the course without filtering by user
    const assessments = await Assessment.find({ courseId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      assessments,
    });
  } catch (error) {
    console.error('Assessments fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/assessments - Create a new assessment (lecturer or admin only)
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Authentication check removed
    
    // Parse request body
    const body = await request.json();
    const { courseId, title, type, description, dueDate } = body;
    
    // Validate input
    if (!courseId || !title || !type || !description) {
      return NextResponse.json(
        { success: false, error: 'Course ID, title, type, and description are required' },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Permission check removed
    
    // Validate assessment type
    const validTypes = ['quiz', 'assignment'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment type' },
        { status: 400 }
      );
    }
    
    // Create new assessment
    const assessment = new Assessment({
      courseId,
      userId: '65b1f5e8c52f4a3e8c0d9e7f', // Default lecturer ID
      title,
      type,
      description,
      dueDate: dueDate || null,
      status: 'pending',
    });
    
    await assessment.save();
    
    // Populate user details
    await assessment.populate('userId', 'name email');
    
    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error('Assessment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
