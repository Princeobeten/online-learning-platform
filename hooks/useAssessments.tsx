'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type Grade = {
  value: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
};

type Submission = {
  content?: string;
  fileUrl?: string;
  submittedAt?: string;
};

type Assessment = {
  _id: string;
  courseId: string;
  userId: string;
  title: string;
  type: 'quiz' | 'assignment';
  description: string;
  dueDate?: string;
  submission?: Submission;
  grade?: Grade;
  status: 'pending' | 'submitted' | 'graded';
  createdAt: string;
  updatedAt: string;
};

type AssessmentFormData = {
  title: string;
  type: 'quiz' | 'assignment';
  description: string;
  dueDate?: string;
};

type SubmissionFormData = {
  content?: string;
  fileUrl?: string;
};

type GradeFormData = {
  value: number;
  feedback?: string;
};

export default function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get assessments for a course
  const getAssessmentsByCourse = async (courseId: string): Promise<Assessment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(`/api/assessments?courseId=${courseId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assessments');
      }
      
      if (data.success && data.assessments) {
        setAssessments(data.assessments);
        return data.assessments;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Assessments fetch error:', error);
      setError(error.message || 'An error occurred while fetching assessments');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get assessments for a user
  const getAssessmentsByUser = async (): Promise<Assessment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch('/api/assessments/user', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assessments');
      }
      
      if (data.success && data.assessments) {
        setAssessments(data.assessments);
        return data.assessments;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Assessments fetch error:', error);
      setError(error.message || 'An error occurred while fetching assessments');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new assessment
  const createAssessment = async (courseId: string, assessmentData: AssessmentFormData): Promise<Assessment | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, ...assessmentData }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create assessment');
      }
      
      if (data.success && data.assessment) {
        toast.success('Assessment created successfully');
        setAssessments(prevAssessments => [...prevAssessments, data.assessment]);
        return data.assessment;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Assessment creation error:', error);
      setError(error.message || 'An error occurred while creating the assessment');
      toast.error(error.message || 'Failed to create assessment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Submit an assessment
  const submitAssessment = async (assessmentId: string, submissionData: SubmissionFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assessment');
      }
      
      if (data.success) {
        toast.success('Assessment submitted successfully');
        
        // Update the current assessment if it's the one we just submitted
        if (currentAssessment && currentAssessment._id === assessmentId) {
          setCurrentAssessment({
            ...currentAssessment,
            submission: {
              content: submissionData.content,
              fileUrl: submissionData.fileUrl,
              submittedAt: new Date().toISOString(),
            },
            status: 'submitted',
          });
        }
        
        // Update the assessments list
        setAssessments(prevAssessments => 
          prevAssessments.map(assessment => 
            assessment._id === assessmentId
              ? {
                  ...assessment,
                  submission: {
                    content: submissionData.content,
                    fileUrl: submissionData.fileUrl,
                    submittedAt: new Date().toISOString(),
                  },
                  status: 'submitted',
                }
              : assessment
          )
        );
        
        return true;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Assessment submission error:', error);
      setError(error.message || 'An error occurred while submitting the assessment');
      toast.error(error.message || 'Failed to submit assessment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Grade an assessment
  const gradeAssessment = async (assessmentId: string, gradeData: GradeFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(`/api/assessments/${assessmentId}/grade`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gradeData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to grade assessment');
      }
      
      if (data.success) {
        toast.success('Assessment graded successfully');
        
        // Update the current assessment if it's the one we just graded
        if (currentAssessment && currentAssessment._id === assessmentId) {
          setCurrentAssessment({
            ...currentAssessment,
            grade: {
              value: gradeData.value,
              feedback: gradeData.feedback,
              gradedAt: new Date().toISOString(),
              gradedBy: data.gradedBy,
            },
            status: 'graded',
          });
        }
        
        // Update the assessments list
        setAssessments(prevAssessments => 
          prevAssessments.map(assessment => 
            assessment._id === assessmentId
              ? {
                  ...assessment,
                  grade: {
                    value: gradeData.value,
                    feedback: gradeData.feedback,
                    gradedAt: new Date().toISOString(),
                    gradedBy: data.gradedBy,
                  },
                  status: 'graded',
                }
              : assessment
          )
        );
        
        return true;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Assessment grading error:', error);
      setError(error.message || 'An error occurred while grading the assessment');
      toast.error(error.message || 'Failed to grade assessment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    assessments,
    currentAssessment,
    loading,
    error,
    getAssessmentsByCourse,
    getAssessmentsByUser,
    createAssessment,
    submitAssessment,
    gradeAssessment,
  };
}
