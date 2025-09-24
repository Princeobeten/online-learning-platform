'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCourses from '@/hooks/useCourses';
import useAssessments from '@/hooks/useAssessments';
import { useApp } from '@/context/AppContext';
import AuthCheck from '@/app/components/AuthCheck';
import { formatDate } from '@/lib/utils/dateUtils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { getCourses, courses, createCourse, loading: coursesLoading } = useCourses();
  const { getAssessmentsByUser, assessments, loading: assessmentsLoading } = useAssessments();
  const { user, hasRole } = useApp();
  
  const [activeTab, setActiveTab] = useState('courses');
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCourses();
        await getAssessmentsByUser();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, []);

  const handleCourseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseFormData.title || !courseFormData.description) {
      toast.error('Title and description are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await createCourse(courseFormData);
      if (result) {
        toast.success('Course created successfully');
        setCourseFormData({
          title: '',
          description: '',
          thumbnail: '',
        });
        setShowCreateCourseForm(false);
        await getCourses(); // Refresh courses list
      }
    } catch (error) {
      console.error('Course creation error:', error);
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses based on user role
  const filteredCourses = courses?.filter(course => {
    if (hasRole(['admin'])) return true; // Admins see all courses
    return typeof course.lecturerId === 'object' && course.lecturerId !== null && '_id' in course.lecturerId && (course.lecturerId as { _id: string })._id === user?._id; // Lecturers see only their courses
  });

  return (
    <AuthCheck allowedRoles={['lecturer', 'admin']}>
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-300">
            Manage your courses, assessments, and student progress.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-primary border-opacity-30 mb-8">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('courses')}
              className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-cta text-cta'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assessments'
                  ? 'border-cta text-cta'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Assessments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Courses</h2>
                <button
                  onClick={() => setShowCreateCourseForm(!showCreateCourseForm)}
                  className="btn btn-primary"
                >
                  {showCreateCourseForm ? 'Cancel' : 'Create New Course'}
                </button>
              </div>

              {/* Create Course Form */}
              {showCreateCourseForm && (
                <div className="card p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
                  <form onSubmit={handleCreateCourse}>
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Course Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-input w-full"
                        placeholder="e.g., Introduction to Computer Science"
                        value={courseFormData.title}
                        onChange={handleCourseFormChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Course Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-input w-full"
                        rows={4}
                        placeholder="Provide a detailed description of your course..."
                        value={courseFormData.description}
                        onChange={handleCourseFormChange}
                        required
                      ></textarea>
                    </div>
                    <div className="mb-6">
                      <label htmlFor="thumbnail" className="block text-sm font-medium mb-1">
                        Thumbnail URL (Optional)
                      </label>
                      <input
                        type="text"
                        id="thumbnail"
                        name="thumbnail"
                        className="form-input w-full"
                        placeholder="https://example.com/image.jpg"
                        value={courseFormData.thumbnail}
                        onChange={handleCourseFormChange}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`btn btn-primary ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Course'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Courses List */}
              {coursesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cta"></div>
                </div>
              ) : filteredCourses && filteredCourses.length > 0 ? (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course._id} className="card p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">
                            Created: {formatDate(course.createdAt)}
                          </p>
                          <p className="text-sm text-gray-300">
                            {course.enrolledStudents.length} students enrolled
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/course/${course._id}`}
                            className="btn btn-secondary"
                          >
                            View
                          </Link>
                          <Link
                            href={`/course/${course._id}?tab=assessments`}
                            className="btn btn-primary"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p>You haven't created any courses yet.</p>
                  <button
                    onClick={() => setShowCreateCourseForm(true)}
                    className="mt-4 btn btn-primary"
                  >
                    Create Your First Course
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Assessments to Grade</h2>
              
              {assessmentsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cta"></div>
                </div>
              ) : assessments && assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments
                    .filter(assessment => assessment.status === 'submitted')
                    .map((assessment) => (
                      <div key={assessment._id} className="card p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{assessment.title}</h3>
                            <p className="text-sm text-gray-300 mb-1">
                              Type: {assessment.type === 'quiz' ? 'Quiz' : 'Assignment'}
                            </p>
                            <p className="text-sm text-gray-400">
                              Submitted: {formatDate(assessment.submission?.submittedAt)}
                            </p>
                          </div>
                          <Link
                            href={`/course/${assessment.courseId}?tab=assessments`}
                            className="btn btn-primary"
                          >
                            Grade Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  
                  {assessments.filter(assessment => assessment.status === 'submitted').length === 0 && (
                    <div className="card p-6 text-center">
                      <p>No pending assessments to grade.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p>No assessments found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
