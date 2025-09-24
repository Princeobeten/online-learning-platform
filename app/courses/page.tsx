'use client';

import { useState, useEffect } from 'react';
import useCourses from '@/hooks/useCourses';
import CourseCard from '@/app/components/CourseCard';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const { getCourses, courses, loading, error } = useCourses();
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
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
        <p className="text-gray-300">Browse our collection of courses and start learning today.</p>
      </div>

      {/* Search and Filter */}
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

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-md text-center">
          <p>Failed to load courses. Please try again later.</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
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
  );
}
