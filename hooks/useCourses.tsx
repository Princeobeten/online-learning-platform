'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type Course = {
  _id: string;
  title: string;
  description: string;
  lecturerId: string;
  materials: Material[];
  enrolledStudents: string[];
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
};

type Material = {
  title: string;
  description?: string;
  fileUrl?: string;
  type: 'document' | 'video' | 'link';
  createdAt: string;
};

type CourseFormData = {
  title: string;
  description: string;
  thumbnail?: string;
};

type MaterialFormData = {
  title: string;
  description?: string;
  fileUrl?: string;
  type: 'document' | 'video' | 'link';
};

export default function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all courses
  const getCourses = async (): Promise<Course[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // For courses listing, token is optional as it's a public endpoint
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/courses', {
        headers
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }
      
      if (data.success && data.courses) {
        setCourses(data.courses);
        return data.courses;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Course fetch error:', error);
      setError(error.message || 'An error occurred while fetching courses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get course by ID
  const getCourseById = async (courseId: string): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // For course details, token is optional as it's a public endpoint
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/courses/${courseId}`, {
        headers
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch course');
      }
      
      if (data.success && data.course) {
        setCurrentCourse(data.course);
        return data.course;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Course fetch error:', error);
      setError(error.message || 'An error occurred while fetching the course');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new course
  const createCourse = async (courseData: CourseFormData): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
      }
      
      if (data.success && data.course) {
        toast.success('Course created successfully');
        setCourses(prevCourses => [...prevCourses, data.course]);
        return data.course;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Course creation error:', error);
      setError(error.message || 'An error occurred while creating the course');
      toast.error(error.message || 'Failed to create course');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course
  const enrollCourse = async (courseId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Token retrieved successfully
      
      const response = await fetch(`/api/courses/enroll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll in course');
      }
      
      if (data.success) {
        toast.success('Enrolled in course successfully');
        
        // Update the current course if it's the one we just enrolled in
        if (currentCourse && currentCourse._id === courseId) {
          setCurrentCourse({
            ...currentCourse,
            enrolledStudents: [...currentCourse.enrolledStudents, data.userId],
          });
        }
        
        return true;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Course enrollment error:', error);
      setError(error.message || 'An error occurred while enrolling in the course');
      toast.error(error.message || 'Failed to enroll in course');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add material to a course
  const addMaterial = async (courseId: string, materialData: MaterialFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(`/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(materialData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add material');
      }
      
      if (data.success) {
        toast.success('Material added successfully');
        
        // Update the current course if it's the one we just added material to
        if (currentCourse && currentCourse._id === courseId) {
          setCurrentCourse({
            ...currentCourse,
            materials: [...currentCourse.materials, data.material],
          });
        }
        
        return true;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Add material error:', error);
      setError(error.message || 'An error occurred while adding material');
      toast.error(error.message || 'Failed to add material');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    currentCourse,
    loading,
    error,
    getCourses,
    getCourseById,
    createCourse,
    enrollCourse,
    addMaterial,
  };
}
