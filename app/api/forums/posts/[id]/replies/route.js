import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import Forum from '@/models/Forum';
import { extractToken, verifyToken } from '@/lib/utils/jwt';
import mongoose from 'mongoose';

// POST /api/forums/posts/[id]/replies - Add a reply to a post
export async function POST(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params; // Post ID
    
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
    const { content } = body;
    
    // Validate input
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Reply content is required' },
        { status: 400 }
      );
    }
    
    // Find forum containing the post
    const forum = await Forum.findOne({ 'posts._id': id });
    
    // Check if forum and post exist
    if (!forum) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Create new reply
    const reply = {
      _id: new mongoose.Types.ObjectId(),
      userId: decoded.userId,
      content,
      createdAt: new Date(),
    };
    
    // Find the post and add the reply
    const postIndex = forum.posts.findIndex(post => post._id.toString() === id);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Add reply to post
    forum.posts[postIndex].replies.push(reply);
    forum.posts[postIndex].updatedAt = new Date();
    forum.updatedAt = new Date();
    
    await forum.save();
    
    // Populate user details for the new reply
    await forum.populate({
      path: `posts.${postIndex}.replies.${forum.posts[postIndex].replies.length - 1}.userId`,
      select: 'name email role',
    });
    
    return NextResponse.json({
      success: true,
      reply: forum.posts[postIndex].replies[forum.posts[postIndex].replies.length - 1],
    });
  } catch (error) {
    console.error('Reply creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
