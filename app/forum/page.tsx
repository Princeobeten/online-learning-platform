'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useCourses from '@/hooks/useCourses';
import { useApp } from '@/context/AppContext';
import AuthCheck from '@/app/components/AuthCheck';
import toast from 'react-hot-toast';

export default function ForumPage() {
  const { getCourses, courses, loading, error } = useCourses();
  const { isAuthenticated } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        await getCourses();
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courses, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <AuthCheck>
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Discussion Forums</h1>
          <p className="text-gray-300">
            Select a course to view its discussion forum. Engage with instructors and peers
            to enhance your learning experience.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search courses..."
                className="form-input w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Course List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 p-4 rounded-md text-center">
            <p>Failed to load courses. Please try again later.</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div key={course._id} className="card p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-300 mb-2">
                      Instructor: {typeof course.lecturerId === 'object' && course.lecturerId !== null && 'name' in course.lecturerId ? course.lecturerId.name : 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {course.enrolledStudents.length} students enrolled
                    </p>
                  </div>
                  <Link
                    href={`/course/${course._id}?tab=forum`}
                    className="btn btn-primary"
                  >
                    View Forum
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl">No courses found matching your search.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 btn btn-secondary"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </AuthCheck>
  );
}
