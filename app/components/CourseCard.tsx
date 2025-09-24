'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import useCourses from '@/hooks/useCourses';
import toast from 'react-hot-toast';

type CourseCardProps = {
  course: {
    _id: string;
    title: string;
    description: string;
    lecturerId: {
      _id: string;
      name: string;
      email: string;
    } | string | null;
    enrolledStudents: (string | { _id: string })[];
    thumbnail: string;
    createdAt: string;
  };
};

export default function CourseCard({ course }: CourseCardProps) {
  const { user, isAuthenticated } = useApp();
  const { enrollCourse } = useCourses();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(
    Array.isArray(course.enrolledStudents) && user?._id ? 
      course.enrolledStudents.some(studentId => 
        (typeof studentId === 'object' && studentId !== null && '_id' in studentId) ? 
          studentId._id === user._id : 
          studentId === user._id
      ) : 
      false
  );

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      return;
    }

    setIsEnrolling(true);
    try {
      const result = await enrollCourse(course._id);
      if (result) {
        setIsEnrolled(true);
        toast.success('Successfully enrolled in the course');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Truncate description
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <div className="relative h-48">
        {course.thumbnail && course.thumbnail.startsWith('http') ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
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
            src={course.thumbnail || '/images/default-course.svg'}
            alt={course.title}
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
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
        <p className="text-sm text-gray-300 mb-4 flex-grow">
          {truncateDescription(course.description)}
        </p>
        <div className="text-xs text-gray-400 mb-4">
          <p>Instructor: {typeof course.lecturerId === 'object' && course.lecturerId !== null && 'name' in course.lecturerId ? course.lecturerId.name : 'Unknown Instructor'}</p>
          <p>Created: {formatDate(course.createdAt)}</p>
        </div>
        <div className="flex justify-between items-center">
          <Link
            href={`/course/${course._id}`}
            className="btn btn-secondary text-sm"
          >
            View Details
          </Link>
          {!isEnrolled ? (
            <button
              onClick={handleEnroll}
              disabled={isEnrolling || !isAuthenticated}
              className={`btn btn-primary text-sm ${
                isEnrolling ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          ) : (
            <span className="text-sm text-green-400">Enrolled</span>
          )}
        </div>
      </div>
    </div>
  );
}
