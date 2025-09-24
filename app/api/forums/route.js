import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Forum from '@/models/Forum';
import Course from '@/models/Course';
import { extractToken, verifyToken } from '@/lib/utils/jwt';

// GET /api/forums - Get forum for a course
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
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
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Find forum by course ID or create if not exists
    let forum = await Forum.findOne({ courseId })
      .populate({
        path: 'posts.userId',
        select: 'name email role',
      })
      .populate({
        path: 'posts.replies.userId',
        select: 'name email role',
      });
    
    // If forum doesn't exist, create a new one
    if (!forum) {
      forum = new Forum({ courseId, posts: [] });
      await forum.save();
    }
    
    return NextResponse.json({
      success: true,
      forum,
    });
  } catch (error) {
    console.error('Forum fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
