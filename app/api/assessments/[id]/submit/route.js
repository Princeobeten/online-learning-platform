import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import User from '@/models/User'; // Import User model for populate

// POST /api/assessments/[id]/submit - Submit an assessment (student only)
export async function POST(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params; // Assessment ID
    
    // Authentication check removed
    
    // Parse request body
    const body = await request.json();
    const { content, fileUrl } = body;
    
    // Validate input
    if (!content && !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Content or file URL is required' },
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
    
    // Check if the assessment is a template created by a lecturer
    if (assessment.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'This assessment has already been submitted or graded' },
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
    
    // Enrollment check removed
    
    // Update assessment with submission
    assessment.submission = {
      content,
      fileUrl,
      submittedAt: new Date(),
    };
    assessment.status = 'submitted';
    assessment.updatedAt = new Date();
    
    await assessment.save();
    
    return NextResponse.json({
      success: true,
      message: 'Assessment submitted successfully',
      assessment,
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
