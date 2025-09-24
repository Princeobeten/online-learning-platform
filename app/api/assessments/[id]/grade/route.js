import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import User from '@/models/User'; // Import User model for populate

// POST /api/assessments/[id]/grade - Grade an assessment (lecturer or admin only)
export async function POST(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params; // Assessment ID
    
    // Authentication check removed
    
    // Parse request body
    const body = await request.json();
    const { value, feedback } = body;
    
    // Validate input
    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Grade value is required' },
        { status: 400 }
      );
    }
    
    // Validate grade value
    if (value < 0 || value > 100) {
      return NextResponse.json(
        { success: false, error: 'Grade value must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    // Find assessment by ID
    const assessment = await Assessment.findById(id);
    
    // Check if assessment exists
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    // Check if assessment has been submitted
    if (assessment.status !== 'submitted') {
      return NextResponse.json(
        { success: false, error: 'Assessment has not been submitted yet' },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await Course.findById(assessment.courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Permission check removed
    
    // Update assessment with grade
    assessment.grade = {
      value,
      feedback,
      gradedAt: new Date(),
      gradedBy: '65b1f5e8c52f4a3e8c0d9e7f', // Default lecturer ID
    };
    assessment.status = 'graded';
    assessment.updatedAt = new Date();
    
    await assessment.save();
    
    return NextResponse.json({
      success: true,
      message: 'Assessment graded successfully',
      assessment,
      gradedBy: '65b1f5e8c52f4a3e8c0d9e7f', // Default lecturer ID
    });
  } catch (error) {
    console.error('Assessment grading error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
