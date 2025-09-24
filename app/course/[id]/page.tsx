'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useCourses from '@/hooks/useCourses';
import useForums from '@/hooks/useForums';
import useAssessments from '@/hooks/useAssessments';
import { useApp } from '@/context/AppContext';
import ForumPost from '@/app/components/ForumPost';
import AssessmentForm from '@/app/components/AssessmentForm';
import { formatDate } from '@/lib/utils/dateUtils';
import toast from 'react-hot-toast';

type CourseStudent = string | { _id: string; name?: string };

type CourseLecturer = {
  _id: string;
  name: string;
  email: string;
} | string | null;

type Course = {
  _id: string;
  title: string;
  description: string;
  lecturerId: CourseLecturer;
  materials: any[];
  enrolledStudents: CourseStudent[];
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { getCourseById, currentCourse, enrollCourse, loading: courseLoading } = useCourses();
  const { getForumByCourseId, forum, createPost, loading: forumLoading } = useForums();
  const { getAssessmentsByCourse, assessments, loading: assessmentsLoading } = useAssessments();
  const { user, isAuthenticated, hasRole } = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  useEffect(() => {
    if (courseId) {
      getCourseById(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId && activeTab === 'forum') {
      getForumByCourseId(courseId);
    }
  }, [courseId, activeTab]);

  useEffect(() => {
    if (courseId && activeTab === 'assessments') {
      getAssessmentsByCourse(courseId);
    }
  }, [courseId, activeTab]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      return;
    }

    setIsEnrolling(true);
    try {
      const result = await enrollCourse(courseId);
      if (result) {
        toast.success('Successfully enrolled in the course');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to create a post');
      return;
    }
    
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Post title and content are required');
      return;
    }
    
    setIsSubmittingPost(true);
    try {
      const result = await createPost(courseId, {
        title: postTitle,
        content: postContent,
      });
      
      if (result) {
        toast.success('Post created successfully');
        setPostTitle('');
        setPostContent('');
      }
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const isEnrolled = Array.isArray(currentCourse?.enrolledStudents) && user?._id ? 
    currentCourse.enrolledStudents.some(studentId => {
      if (typeof studentId === 'object' && studentId !== null) {
        return (studentId as CourseStudent & { _id: string })._id === user._id;
      }
      return studentId === user._id;
    }) : 
    false;
  const isLecturerOrAdmin = hasRole(['lecturer', 'admin']);
  // Check if lecturerId is an object with _id property
  const lecturerId = currentCourse?.lecturerId;
  const isCourseLecturer = 
    typeof lecturerId === 'object' && 
    lecturerId !== null && 
    '_id' in lecturerId && 
    (lecturerId as CourseLecturer & { _id: string })._id === user?._id;
  const canAccessCourse = isEnrolled || isLecturerOrAdmin || isCourseLecturer;

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="mb-6">The course you are looking for does not exist or has been removed.</p>
        <Link href="/courses" className="btn btn-primary">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Course Header */}
      <div className="bg-primary bg-opacity-30 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 md:mr-6">
            <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
              {currentCourse.thumbnail && currentCourse.thumbnail.startsWith('http') ? (
                <Image
                  src={currentCourse.thumbnail}
                  alt={currentCourse.title}
                  fill
                  className="object-cover"
                  unoptimized={true}
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-course.svg';
                  }}
                />
              ) : (
                <Image
                  src={currentCourse.thumbnail || '/images/default-course.svg'}
                  alt={currentCourse.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-course.svg';
                  }}
                />
              )}
            </div>
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{currentCourse.title}</h1>
            <p className="text-gray-300 mb-4">
              Instructor: {
                typeof currentCourse.lecturerId === 'object' && 
                currentCourse.lecturerId !== null && 
                'name' in currentCourse.lecturerId ? 
                (currentCourse.lecturerId as { name: string }).name : 'Unknown'
              }
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Created: {formatDate(currentCourse.createdAt)}
            </p>
            <p className="mb-6">{currentCourse.description}</p>
            
            {!isAuthenticated ? (
              <Link href="/login" className="btn btn-primary">
                Login to Enroll
              </Link>
            ) : !canAccessCourse ? (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className={`btn btn-primary ${
                  isEnrolling ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ) : (
              <span className="inline-block px-4 py-2 bg-green-600 bg-opacity-30 text-green-400 rounded-md">
                {isCourseLecturer ? 'You are the instructor' : 'You are enrolled'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      {canAccessCourse && (
        <>
          <div className="border-b border-primary border-opacity-30 mb-8">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-cta text-cta'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'materials'
                    ? 'border-cta text-cta'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forum'
                    ? 'border-cta text-cta'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Discussion Forum
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
                <div className="card p-6">
                  <p className="mb-4">{currentCourse.description}</p>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">What You'll Learn</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Comprehensive understanding of the subject matter</li>
                      <li>Practical skills that can be applied immediately</li>
                      <li>Advanced techniques and methodologies</li>
                      <li>Problem-solving strategies for real-world scenarios</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Structure</h3>
                    <p className="text-gray-300">
                      This course includes video lectures, reading materials, interactive
                      discussions, and practical assessments to ensure a comprehensive
                      learning experience.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Course Materials</h2>
                {currentCourse.materials && currentCourse.materials.length > 0 ? (
                  <div className="space-y-4">
                    {currentCourse.materials.map((material, index) => (
                      <div key={index} className="card p-6">
                        <div className="flex items-start">
                          <div className="mr-4">
                            {material.type === 'document' && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-cta"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            )}
                            {material.type === 'video' && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-cta"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                            {material.type === 'link' && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-cta"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{material.title}</h3>
                            {material.description && (
                              <p className="text-gray-300 mb-2">{material.description}</p>
                            )}
                            {material.fileUrl && (
                              <a
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cta hover:underline flex items-center"
                              >
                                <span>Access Material</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 ml-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(material.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-6 text-center">
                    <p>No materials available for this course yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Forum Tab */}
            {activeTab === 'forum' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Discussion Forum</h2>
                
                {/* Create Post Form */}
                <div className="card p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Create a New Post</h3>
                  <form onSubmit={handleCreatePost}>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Post Title"
                        className="form-input w-full"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        disabled={!isAuthenticated || isSubmittingPost}
                      />
                    </div>
                    <div className="mb-4">
                      <textarea
                        placeholder="Post Content"
                        className="form-input w-full"
                        rows={4}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        disabled={!isAuthenticated || isSubmittingPost}
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!isAuthenticated || isSubmittingPost}
                        className={`btn btn-primary ${
                          !isAuthenticated || isSubmittingPost
                            ? 'opacity-70 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {isSubmittingPost ? 'Posting...' : 'Create Post'}
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* Forum Posts */}
                {forumLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cta"></div>
                  </div>
                ) : forum && forum.posts && forum.posts.length > 0 ? (
                  <div className="space-y-6">
                    {forum.posts.map((post) => (
                      <ForumPost key={post._id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="card p-6 text-center">
                    <p>No posts in this forum yet. Be the first to start a discussion!</p>
                  </div>
                )}
              </div>
            )}

            {/* Assessments Tab */}
            {activeTab === 'assessments' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Assessments</h2>
                
                {assessmentsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cta"></div>
                  </div>
                ) : assessments && assessments.length > 0 ? (
                  <div className="space-y-6">
                    {assessments.map((assessment) => (
                      <AssessmentForm
                        key={assessment._id}
                        assessment={assessment}
                        onSubmitSuccess={() => {
                          // Make sure we're using the string ID for API call
                          const courseIdValue = typeof assessment.courseId === 'object' && assessment.courseId !== null
                            ? (assessment.courseId as { _id: string })._id
                            : courseId;
                          getAssessmentsByCourse(courseIdValue);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card p-6 text-center">
                    <p>No assessments available for this course yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
