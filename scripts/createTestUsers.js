import dbConnect from '../dbConnect.js';
import User from '../models/User.js';

async function createTestUsers() {
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

    // Create users if they don't exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log('\n🎉 Test users setup complete!');
    console.log('\nYou can now login with:');
    console.log('Student: student@test.com / password123');
    console.log('Lecturer: lecturer@test.com / password123');
    console.log('Admin: admin@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
