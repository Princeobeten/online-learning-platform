'use client';

import { useState } from 'react';
import useAssessments from '@/hooks/useAssessments';
import { useApp } from '@/context/AppContext';
import { formatDate, daysRemaining } from '@/lib/utils/dateUtils';
import toast from 'react-hot-toast';

type Assessment = {
  _id: string;
  courseId: string | { _id: string; title: string };
  userId: string | { _id: string; name: string; email: string };
  title: string;
  type: 'quiz' | 'assignment';
  description: string;
  dueDate?: string;
  submission?: {
    content?: string;
    fileUrl?: string;
    submittedAt?: string;
  };
  grade?: {
    value: number;
    feedback?: string;
    gradedAt?: string;
    gradedBy?: string | { _id: string; name: string };
  };
  status: 'pending' | 'submitted' | 'graded';
  createdAt: string;
  updatedAt: string;
};

type AssessmentFormProps = {
  assessment: Assessment;
  onSubmitSuccess?: () => void;
};

export default function AssessmentForm({ assessment, onSubmitSuccess }: AssessmentFormProps) {
  const { submitAssessment, gradeAssessment } = useAssessments();
  const { user, hasRole } = useApp();
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');
  const [gradeValue, setGradeValue] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const isLecturerOrAdmin = hasRole(['lecturer', 'admin']);
  const isStudent = hasRole('student');
  const isPastDue = assessment.dueDate ? new Date(assessment.dueDate) < new Date() : false;
  const canSubmit = isStudent && assessment.status === 'pending' && !isPastDue;
  const canGrade = isLecturerOrAdmin && assessment.status === 'submitted';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionContent && !submissionFileUrl) {
      toast.error('Please provide either content or a file URL');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await submitAssessment(assessment._id, {
        content: submissionContent,
        fileUrl: submissionFileUrl,
      });
      
      if (result) {
        toast.success('Assessment submitted successfully');
        setSubmissionContent('');
        setSubmissionFileUrl('');
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (gradeValue < 0 || gradeValue > 100) {
      toast.error('Grade must be between 0 and 100');
      return;
    }
    
    setIsGrading(true);
    try {
      const result = await gradeAssessment(assessment._id, {
        value: gradeValue,
        feedback: gradeFeedback,
      });
      
      if (result) {
        toast.success('Assessment graded successfully');
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (error) {
      console.error('Assessment grading error:', error);
      toast.error('Failed to grade assessment');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="card mb-6">
      {/* Assessment header */}
      <div className="border-b border-primary border-opacity-30 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">{assessment.title}</h3>
            <span className="inline-block px-2 py-1 rounded-full text-xs mb-2 bg-primary">
              {assessment.type === 'quiz' ? 'Quiz' : 'Assignment'}
            </span>
          </div>
          <div className="text-right">
            {assessment.dueDate && (
              <div className="text-sm">
                <div>Due: {formatDate(assessment.dueDate)}</div>
                {!isPastDue && (
                  <div className="text-green-400">
                    {daysRemaining(assessment.dueDate)} days remaining
                  </div>
                )}
                {isPastDue && <div className="text-red-400">Past due</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment content */}
      <div className="p-4">
        <p className="text-sm whitespace-pre-line mb-4">{assessment.description}</p>

        {/* Status badge */}
        <div className="mb-4">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs ${
              assessment.status === 'pending'
                ? 'bg-yellow-600'
                : assessment.status === 'submitted'
                ? 'bg-blue-600'
                : 'bg-green-600'
            }`}
          >
            {assessment.status === 'pending'
              ? 'Pending'
              : assessment.status === 'submitted'
              ? 'Submitted'
              : 'Graded'}
          </span>
        </div>

        {/* Submission details if submitted */}
        {assessment.status !== 'pending' && assessment.submission && (
          <div className="mb-4 p-3 bg-primary bg-opacity-30 rounded-md">
            <h4 className="text-sm font-semibold mb-2">Submission</h4>
            {assessment.submission.submittedAt && (
              <p className="text-xs text-gray-400 mb-2">
                Submitted on: {formatDate(assessment.submission.submittedAt)}
              </p>
            )}
            {assessment.submission.content && (
              <p className="text-sm whitespace-pre-line mb-2">
                {assessment.submission.content}
              </p>
            )}
            {assessment.submission.fileUrl && (
              <a
                href={assessment.submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cta hover:underline"
              >
                View Attached File
              </a>
            )}
          </div>
        )}

        {/* Grade details if graded */}
        {assessment.status === 'graded' && assessment.grade && (
          <div className="mb-4 p-3 bg-primary bg-opacity-30 rounded-md">
            <h4 className="text-sm font-semibold mb-2">Grade</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold">
                {assessment.grade.value}/100
              </span>
              {assessment.grade.gradedAt && (
                <span className="text-xs text-gray-400">
                  Graded on: {formatDate(assessment.grade.gradedAt)}
                </span>
              )}
            </div>
            {assessment.grade.feedback && (
              <div>
                <h5 className="text-xs font-semibold mb-1">Feedback:</h5>
                <p className="text-sm whitespace-pre-line">
                  {assessment.grade.feedback}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submission form for students */}
        {canSubmit && (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Your Answer
              </label>
              <textarea
                className="form-input w-full"
                rows={5}
                placeholder="Write your answer here..."
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                File URL (Optional)
              </label>
              <input
                type="text"
                className="form-input w-full"
                placeholder="Enter URL to your file (e.g., Google Drive link)"
                value={submissionFileUrl}
                onChange={(e) => setSubmissionFileUrl(e.target.value)}
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
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          </form>
        )}

        {/* Grading form for lecturers/admins */}
        {canGrade && (
          <form onSubmit={handleGrade} className="mt-4">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Grade (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input w-full"
                value={gradeValue}
                onChange={(e) => setGradeValue(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Feedback</label>
              <textarea
                className="form-input w-full"
                rows={3}
                placeholder="Provide feedback to the student..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGrading}
                className={`btn btn-primary ${
                  isGrading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isGrading ? 'Submitting Grade...' : 'Submit Grade'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
