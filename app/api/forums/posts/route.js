import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Forum from '@/models/Forum';
import Course from '@/models/Course';
import { extractToken, verifyToken } from '@/lib/utils/jwt';

// POST /api/forums/posts - Create a new post
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify authentication
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { courseId, title, content } = body;
    
    // Validate input
    if (!courseId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Course ID, title, and content are required' },
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
    
    // Check if user is enrolled in the course or is the lecturer/admin
    const isLecturer = course.lecturerId.toString() === decoded.userId;
    const isAdmin = decoded.role === 'admin';
    const isEnrolled = course.enrolledStudents.some(
      studentId => studentId.toString() === decoded.userId
    );
    
    if (!isLecturer && !isAdmin && !isEnrolled) {
      return NextResponse.json(
        { success: false, error: 'You must be enrolled in this course to post in the forum' },
        { status: 403 }
      );
    }
    
    // Find forum by course ID or create if not exists
    let forum = await Forum.findOne({ courseId });
    
    if (!forum) {
      forum = new Forum({ courseId, posts: [] });
    }
    
    // Create new post
    const post = {
      userId: decoded.userId,
      title,
      content,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add post to forum
    forum.posts.unshift(post); // Add to beginning of array
    forum.updatedAt = Date.now();
    
    await forum.save();
    
    // Populate user details for the new post
    await forum.populate({
      path: 'posts.0.userId',
      select: 'name email role',
    });
    
    return NextResponse.json({
      success: true,
      post: forum.posts[0],
    });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
