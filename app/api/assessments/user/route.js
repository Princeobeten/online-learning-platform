import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course'; // Import Course model for populate

// GET /api/assessments/user - Get assessments for the current user
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Authentication check removed
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by status
    
    // Use a default user ID
    const defaultUserId = '65b1f5e8c52f4a3e8c0d9e7e';
    
    // Build query
    const query = { userId: defaultUserId };
    if (status) {
      query.status = status;
    }
    
    // Get assessments for the user
    const assessments = await Assessment.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      assessments,
    });
  } catch (error) {
    console.error('User assessments fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
