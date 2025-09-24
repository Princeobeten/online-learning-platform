UNICROSS Online Learning Platform - Minimal Prototype
This README provides guidelines for building a minimal viable prototype (MVP) of the UNICROSS Online Learning Platform tailored for Nigerian universities, as outlined in the provided document. The prototype uses Next.js (App Router) for the frontend and backend, MongoDB with Mongoose for data persistence, and React Context for global state management (e.g., authentication, course data, and database integration). The focus is on core features: user authentication, course browsing/management, live class simulation (UI-based), discussion forums, and basic assessment submission. Video conferencing and advanced notifications (e.g., email/SMS) are simulated via UI updates for the MVP to prioritize rapid development.
The system addresses the weaknesses of traditional in-person learning in Nigerian universities by providing a flexible, accessible, and resilient e-learning platform. Development follows an Agile methodology, emphasizing iterative delivery and modularity, with a modern, visually appealing UI/UX using pre-configured Tailwind CSS and the Bricolage Grotesque font from @next/font for a sleek, contemporary aesthetic.
Folder Structure
├── /app                  # Next.js app directory (App Router)
│   ├── /api              # API routes (e.g., /api/auth/login, /api/courses, /api/forums)
│   │   ├── /auth         # Auth-related routes (login, signup)
│   │   ├── /courses      # Course-related routes (browse, create, enroll)
│   │   ├── /forums       # Forum-related routes (post, reply)
│   │   └── /assessments  # Assessment-related routes (submit, grade)
│   ├── /components       # Reusable UI components (e.g., CourseCard, ForumPost, AuthCheck)
│   ├── /dashboard        # Instructor/admin dashboard page
│   ├── /login            # Login page
│   ├── /courses          # Course browsing page
│   ├── /course/[id]      # Dynamic course detail page
│   ├── /forum            # Discussion forum page
│   └── layout.tsx        # Root layout with AppProvider
├── /hooks                # Custom hooks (e.g., useAuth, useCourses, useForums)
├── /context              # Global state management
│   └── AppContext.tsx    # Central context for auth, user, and DB integration
├── /lib                  # Utilities
│   └── /utils            # Helper functions (e.g., validation, date formatting)
├── /models               # Mongoose models (root level: User, Course, Forum, Assessment)
├── /scripts              # Testing scripts
├── /public               # Static assets (e.g., course thumbnails, university logo)
├── dbConnect.js          # MongoDB connection (root level, do not modify)
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind CSS config (pre-configured)
├── .env.local            # Environment variables (MONGODB_URI)
└── README.md             # This file

Key Files and Their Purpose

dbConnect.js (root): Pre-configured Mongoose connection to MongoDB. Do not modify. Uses a hardcoded URI for MVP; update .env.local for production.
models/ (root): Mongoose schemas:
User.js: { email: String, password: String (hashed), role: String ('student'|'lecturer'|'admin'), name: String }.
Course.js: { title: String, description: String, lecturerId: ObjectId, materials: Array, enrolledStudents: Array of ObjectId }.
Forum.js: { courseId: ObjectId, posts: Array of { userId: ObjectId, content: String, createdAt: Date, replies: Array } }.
Assessment.js: { courseId: ObjectId, userId: ObjectId, type: String ('quiz'|'assignment'), submission: String, grade: Number, status: String }.


context/AppContext.tsx: Binds authentication, user state, and DB interactions. Wraps the app in layout.tsx to spread state globally. Integrates with hooks for API calls.
hooks/: Hooks like useAuth.tsx (for login/signup/logout), useCourses.tsx (for browsing/creating courses), useForums.tsx (for posting/replying), and useAssessments.tsx (for submitting/grading assessments) that call API routes via fetch.
app/api/: Serverless API routes using Mongoose for CRUD (e.g., /api/courses for POST/GET, /api/forums for POST/GET).
components/AuthCheck.tsx: Protects routes (e.g., dashboard, course pages) by checking auth via context.

Development Guidelines
1. Setup and Prerequisites

Node.js: v18+.
MongoDB: Use MongoDB Atlas (free tier) for cloud DB. Set MONGODB_URI in .env.local.
Tailwind CSS: Already configured in tailwind.config.js. Use utility classes for styling.
Install Dependencies (if not already installed):npm install next react react-dom mongoose react-hot-toast bcrypt @next/font


Run the Project:npm run dev  # Development server at http://localhost:3000



2. Database Integration

Connection: Import dbConnect in API routes to connect to MongoDB.
Models: Define in /models/ as described above.
Context Binding: In AppContext.tsx, use hooks to fetch/update data. Example: const { courses, enrollCourse } = useCourses(); spreads via useApp() hook.
API-Hooks Flow: Hooks (client-side) → API routes (server-side with Mongoose) → MongoDB.

3. Core Features for MVP
Implement these minimal features iteratively, following Agile principles:
a. Authentication (via Context and Hooks)

API Routes: /api/auth/signup, /api/auth/login (use bcrypt for hashing, JWT for tokens stored in localStorage).
Hook: useAuth.tsx (signup, login, logout, getCurrentUser). Exports to context.
Context: AppContext.tsx manages user, isAuthenticated, loading. Check auth on mount.
Pages: /login (form → login hook), protected routes redirect to login.

b. Course Browsing and Management

API Route: /api/courses (POST: create course by lecturer; GET: list courses; POST /api/courses/enroll for student enrollment).
Hook: useCourses.tsx (createCourse, enrollCourse, getCourses async functions).
Component: CourseCard.tsx (display course details), CourseForm.tsx (lecturer course creation).
Pages: /courses (list courses), /course/[id] (view materials, forums, assessments).

c. Discussion Forums

API Route: /api/forums (POST: create post/reply; GET: list posts for course).
Hook: useForums.tsx (postMessage, replyMessage, getPosts functions).
Component: ForumPost.tsx (display posts/replies), PostForm.tsx (submit post/reply).
Page: /forum (course-specific forum view).

d. Assessments (Quizzes/Assignments)

API Route: /api/assessments (POST: submit quiz/assignment; GET: list submissions; POST /api/assessments/grade for grading).
Hook: useAssessments.tsx (submitAssessment, gradeAssessment functions).
Component: AssessmentForm.tsx (submit quiz/assignment), GradeViewer.tsx (view grades).
Page: Integrated in /course/[id] (assessment section).

e. Live Classes (Simulated)

Simulation: For MVP, simulate live classes with UI placeholders (e.g., a "Join Class" button showing a static video player UI). Later integrate Zoom/BigBlueButton API.
Component: LiveClassPlaceholder.tsx (mock live session interface).
Page: Integrated in /course/[id] (live class section).

f. Notifications (Simulated)

In context/hook: On forum post or assessment submission, update UI state. Use react-hot-toast for toast alerts instead of email/SMS for MVP.

4. UI/UX Design

Styling: Use pre-configured Tailwind CSS for a modern, sleek, and professional design that enhances user engagement and aligns with contemporary e-learning platforms. The UI is designed to be visually appealing, intuitive, and accessible, leveraging the Bricolage Grotesque font from @next/font for a clean, modern typography that reflects a cutting-edge educational experience. Implement the font in layout.tsx as follows:
import { Bricolage_Grotesque } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={bricolage.className}>
      <body>{children}</body>
    </html>
  );
}

Apply the following color scheme for a cohesive, modern aesthetic:

Text: #ffffff (white) - Primary text color for readability on dark backgrounds (e.g., text-white for headings, body text).
Foreground: #152345 (dark blue-gray) - Used for inputs, cards, borders, and secondary elements (e.g., bg-[#152345] for card backgrounds, border-[#152345] for form inputs).
CTA (Call-to-Action): #2563eb (blue) - Primary buttons and interactive elements (e.g., bg-[#2563eb] for "Enroll Now" or "Submit Assignment" buttons, hover:bg-[#1d4ed8] for hover states).
Main Background: #111827 (dark gray) - Overall page background (e.g., bg-[#111827] in layout or body).

Tailwind Configuration Update: Extend tailwind.config.js with custom colors:
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#152345',  // Foreground for inputs, cards
        cta: '#2563eb',      // CTA buttons
        background: '#111827', // Main background
      },
      fontFamily: {
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
      },
    },
  },
};

Use classes like bg-background text-white border-primary font-bricolage for cards, bg-cta text-white font-bricolage for buttons, and ensure contrast for accessibility (WCAG-compliant). The Bricolage Grotesque font should be applied universally to text elements (headings, paragraphs, buttons) for a consistent, modern look that elevates the platform’s visual identity.

Pages Layout: Responsive, intuitive (navbar with links: Home, Courses, Forum, Dashboard, Login/Logout). Dark theme by default for reduced eye strain during extended study sessions, with Bricolage Grotesque ensuring a polished, professional typography.

Best Practices: Loading spinners (animate-spin), error toasts (react-hot-toast). Consistent typography/spacing (e.g., p-4, shadow-md). Ensure mobile-first design for Nigerian users on varying devices, with Bricolage Grotesque enhancing readability across screen sizes.


5. Error Handling and Best Practices

Errors: In hooks/API: try-catch, log specifics (e.g., console.error('Course fetch error:', error.message)), return { success: false, error: msg }.
Security (MVP): Basic (hashed passwords, role checks). No advanced auth.
Modularity: Hooks for API logic; context spreads state/DB access.
Testing: Add /scripts/test.js for basic API tests (e.g., using supertest). Run node scripts/test.js.
Performance: Use Next.js Image for thumbnails, server components for static content, and optimize font loading with @next/font.

6. High-Level System Flow (Agile Approach)

User registers/logs in (context).
Browse/enroll in courses (hook → API → DB).
Participate in forums (hook → API → DB).
Submit/view assessments (hook → API → DB).
Lecturers manage courses/grades via dashboard.

Data Flow: Client (hooks/context) ↔ API (Mongoose) ↔ MongoDB.
Getting Started

Clone/Setup (if not already done):
cd project
npm install


Env Setup: Add MONGODB_URI=mongodb+srv://... to .env.local.

Build MVP (Iterative Sprints):

Sprint 1: Implement models, dbConnect, auth hook/API, login page.
Sprint 2: Add course model/hook/API, course pages.
Sprint 3: Add forum/assessment hooks/APIs, dashboard.
Sprint 4: Test flows, polish UI with Bricolage Grotesque, simulate live classes.


Deploy: Use Vercel (free) for Next.js hosting.


Limitations (MVP)

No real video conferencing (UI placeholders only).
No email/SMS notifications (UI toasts only).
Basic assessment system (no complex grading logic).
Limited analytics (extend later for performance tracking).

Goal
Build a functional, modern, and visually impressive MVP in 2-3 weeks: Authenticated users browse courses, participate in forums, submit assessments, and lecturers manage content with a sleek UI powered by Bricolage Grotesque and a cohesive color scheme. Extendable for full features (e.g., video streaming, analytics).
For questions, reference the project document. Contribute via PRs with clear commit messages.