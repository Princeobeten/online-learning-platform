import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User'; // Import User model for populate

// GET /api/courses - Get all courses
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const lecturerId = searchParams.get('lecturerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (lecturerId) {
      query.lecturerId = lecturerId;
    }
    
    // Get courses with pagination
    const courses = await Course.find(query)
      .populate('lecturerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        total: totalCourses,
        page,
        limit,
        pages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (lecturer or admin only)
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { title, description, thumbnail } = body;
    
    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Create new course
    const course = new Course({
      title,
      description,
      lecturerId: '65b1f5e8c52f4a3e8c0d9e7f', // Default lecturer ID
      thumbnail: thumbnail || '/images/default-course.jpg',
    });
    
    await course.save();
    
    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
