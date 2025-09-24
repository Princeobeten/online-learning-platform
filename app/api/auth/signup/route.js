import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/utils/jwt';

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { name, email, password, role = 'student' } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Validate role
    const validRoles = ['student', 'lecturer', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook in the User model
      role,
    });
    
    await user.save();
    
    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    // Return success response with user data (password excluded by User model)
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
