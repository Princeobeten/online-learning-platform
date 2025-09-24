// Simple API testing script
// Run with: node scripts/test-api.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123456',
  role: 'student',
};

// Test lecturer credentials
const TEST_LECTURER = {
  name: 'Test Lecturer',
  email: 'lecturer@example.com',
  password: 'Lecturer123',
  role: 'lecturer',
};

// Test course data
const TEST_COURSE = {
  title: 'Test Course',
  description: 'This is a test course for API testing',
};

// Store tokens and IDs
let studentToken = '';
let lecturerToken = '';
let courseId = '';
let assessmentId = '';
let forumPostId = '';

// Helper function to log results
const logResult = (testName, success, data = null, error = null) => {
  console.log(`\n----- ${testName} -----`);
  console.log(`Status: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (data) {
    console.log('Data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
  
  if (error) {
    console.log('Error:', error);
  }
  
  console.log('-'.repeat(testName.length + 12));
};

// Run all tests sequentially
const runTests = async () => {
  try {
    console.log('🧪 Starting API Tests...\n');
    
    // 1. Create test lecturer account
    try {
      const lecturerRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_LECTURER),
      });
      
      const lecturerData = await lecturerRes.json();
      
      if (lecturerRes.ok && lecturerData.success) {
        lecturerToken = lecturerData.token;
        logResult('Create Lecturer Account', true, { email: lecturerData.user.email, role: lecturerData.user.role });
      } else {
        // If user already exists, try logging in
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: TEST_LECTURER.email,
            password: TEST_LECTURER.password,
          }),
        });
        
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.success) {
          lecturerToken = loginData.token;
          logResult('Login Lecturer Account', true, { email: loginData.user.email, role: loginData.user.role });
        } else {
          throw new Error(loginData.error || 'Failed to login lecturer');
        }
      }
    } catch (error) {
      logResult('Create/Login Lecturer Account', false, null, error.message);
      return;
    }
    
    // 2. Create test student account
    try {
      const studentRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER),
      });
      
      const studentData = await studentRes.json();
      
      if (studentRes.ok && studentData.success) {
        studentToken = studentData.token;
        logResult('Create Student Account', true, { email: studentData.user.email, role: studentData.user.role });
      } else {
        // If user already exists, try logging in
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: TEST_USER.email,
            password: TEST_USER.password,
          }),
        });
        
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.success) {
          studentToken = loginData.token;
          logResult('Login Student Account', true, { email: loginData.user.email, role: loginData.user.role });
        } else {
          throw new Error(loginData.error || 'Failed to login student');
        }
      }
    } catch (error) {
      logResult('Create/Login Student Account', false, null, error.message);
      return;
    }
    
    // 3. Create a test course as lecturer
    try {
      const courseRes = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lecturerToken}`,
        },
        body: JSON.stringify(TEST_COURSE),
      });
      
      const courseData = await courseRes.json();
      
      if (courseRes.ok && courseData.success) {
        courseId = courseData.course._id;
        logResult('Create Course', true, { title: courseData.course.title, id: courseId });
      } else {
        throw new Error(courseData.error || 'Failed to create course');
      }
    } catch (error) {
      logResult('Create Course', false, null, error.message);
      return;
    }
    
    // 4. List all courses
    try {
      const coursesRes = await fetch(`${BASE_URL}/courses`);
      const coursesData = await coursesRes.json();
      
      if (coursesRes.ok && coursesData.success) {
        const courseCount = coursesData.courses.length;
        logResult('List Courses', true, { courseCount });
      } else {
        throw new Error(coursesData.error || 'Failed to list courses');
      }
    } catch (error) {
      logResult('List Courses', false, null, error.message);
    }
    
    // 5. Enroll student in course
    try {
      const enrollRes = await fetch(`${BASE_URL}/courses/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ courseId }),
      });
      
      const enrollData = await enrollRes.json();
      
      if (enrollRes.ok && enrollData.success) {
        logResult('Enroll in Course', true, { message: enrollData.message });
      } else {
        throw new Error(enrollData.error || 'Failed to enroll in course');
      }
    } catch (error) {
      logResult('Enroll in Course', false, null, error.message);
    }
    
    // 6. Create an assessment as lecturer
    try {
      const assessmentRes = await fetch(`${BASE_URL}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lecturerToken}`,
        },
        body: JSON.stringify({
          courseId,
          title: 'Test Assessment',
          type: 'assignment',
          description: 'This is a test assessment',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        }),
      });
      
      const assessmentData = await assessmentRes.json();
      
      if (assessmentRes.ok && assessmentData.success) {
        assessmentId = assessmentData.assessment._id;
        logResult('Create Assessment', true, { title: assessmentData.assessment.title, id: assessmentId });
      } else {
        throw new Error(assessmentData.error || 'Failed to create assessment');
      }
    } catch (error) {
      logResult('Create Assessment', false, null, error.message);
    }
    
    // 7. Create a forum post as student
    try {
      const forumRes = await fetch(`${BASE_URL}/forums/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          courseId,
          title: 'Test Forum Post',
          content: 'This is a test forum post',
        }),
      });
      
      const forumData = await forumRes.json();
      
      if (forumRes.ok && forumData.success) {
        forumPostId = forumData.post._id;
        logResult('Create Forum Post', true, { title: forumData.post.title, id: forumPostId });
      } else {
        throw new Error(forumData.error || 'Failed to create forum post');
      }
    } catch (error) {
      logResult('Create Forum Post', false, null, error.message);
    }
    
    // 8. Reply to forum post as lecturer
    if (forumPostId) {
      try {
        const replyRes = await fetch(`${BASE_URL}/forums/posts/${forumPostId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lecturerToken}`,
          },
          body: JSON.stringify({
            content: 'This is a test reply from the lecturer',
          }),
        });
        
        const replyData = await replyRes.json();
        
        if (replyRes.ok && replyData.success) {
          logResult('Reply to Forum Post', true, { content: replyData.reply.content });
        } else {
          throw new Error(replyData.error || 'Failed to reply to forum post');
        }
      } catch (error) {
        logResult('Reply to Forum Post', false, null, error.message);
      }
    }
    
    console.log('\n🎉 API Tests Completed!');
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
};

// Run the tests
runTests();
