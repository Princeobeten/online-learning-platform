import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users`);

    // Test users to create
    const testUsers = [
      {
        name: 'John Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Jane Lecturer',
        email: 'lecturer@test.com',
        password: 'password123',
        role: 'lecturer'
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      }
    ];

    const results = [];

    // Create users if they don't exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        results.push({
          status: 'created',
          name: userData.name,
          email: userData.email,
          role: userData.role
        });
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      } else {
        results.push({
          status: 'exists',
          name: userData.name,
          email: userData.email,
          role: userData.role
        });
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test users setup complete!',
      users: results,
      loginCredentials: [
        'Student: student@test.com / password123',
        'Lecturer: lecturer@test.com / password123',
        'Admin: admin@test.com / password123'
      ]
    });

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test users',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const users = await User.find({}, { password: 0 }); // Exclude password field
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
