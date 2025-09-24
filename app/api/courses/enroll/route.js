import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Course from '@/models/Course';

// POST /api/courses/enroll - Enroll in a course (student only)
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Authentication check removed
    
    // Parse request body
    const body = await request.json();
    const { courseId } = body;
    
    // Validate input
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    // Find course by ID
    const course = await Course.findById(courseId);
    
    // Check if course exists
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Use a default user ID for enrollment
    const defaultUserId = '65b1f5e8c52f4a3e8c0d9e7e';
    
    // Check if user is already enrolled
    const isEnrolled = course.enrolledStudents.some(
      studentId => studentId.toString() === defaultUserId
    );
    
    if (isEnrolled) {
      return NextResponse.json(
        { success: false, error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }
    
    // Add user to enrolled students
    course.enrolledStudents.push(defaultUserId);
    course.updatedAt = Date.now();
    
    await course.save();
    
    return NextResponse.json({
      success: true,
      message: 'Enrolled successfully',
      userId: defaultUserId,
    });
  } catch (error) {
    console.error('Course enrollment error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
