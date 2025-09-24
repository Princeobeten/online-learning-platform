'use client';

import { useState } from 'react';
import useForums from '@/hooks/useForums';
import { useApp } from '@/context/AppContext';
import { getRelativeTime } from '@/lib/utils/dateUtils';
import toast from 'react-hot-toast';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Reply = {
  _id: string;
  userId: string | User;
  content: string;
  createdAt: string;
};

type Post = {
  _id: string;
  userId: string | User;
  title: string;
  content: string;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
};

type ForumPostProps = {
  post: Post;
};

export default function ForumPost({ post }: ForumPostProps) {
  const { addReply } = useForums();
  const { isAuthenticated } = useApp();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to reply to this post');
      return;
    }
    
    if (!replyContent.trim()) {
      toast.error('Reply content cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await addReply(post._id, { content: replyContent });
      if (result) {
        setReplyContent('');
        toast.success('Reply added successfully');
        setShowReplies(true); // Show replies after adding a new one
      }
    } catch (error) {
      console.error('Reply submission error:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user name from userId
  const getUserName = (userId: string | User): string => {
    if (typeof userId === 'string') {
      return 'Unknown User';
    }
    return userId.name || 'Unknown User';
  };

  // Get user role from userId
  const getUserRole = (userId: string | User): string => {
    if (typeof userId === 'string') {
      return 'user';
    }
    return userId.role || 'user';
  };

  return (
    <div className="card mb-6">
      {/* Post header */}
      <div className="border-b border-primary border-opacity-30 p-4">
        <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center">
            <span className="mr-2">
              Posted by: {getUserName(post.userId)}
              {getUserRole(post.userId) === 'lecturer' && (
                <span className="ml-2 px-2 py-1 bg-cta rounded-full text-xs">
                  Lecturer
                </span>
              )}
              {getUserRole(post.userId) === 'admin' && (
                <span className="ml-2 px-2 py-1 bg-red-600 rounded-full text-xs">
                  Admin
                </span>
              )}
            </span>
          </div>
          <span>{getRelativeTime(post.createdAt)}</span>
        </div>
      </div>

      {/* Post content */}
      <div className="p-4">
        <p className="text-sm whitespace-pre-line">{post.content}</p>
      </div>

      {/* Replies section */}
      <div className="border-t border-primary border-opacity-30 p-4">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-sm text-cta mb-4 flex items-center"
        >
          {showReplies ? 'Hide' : 'Show'} Replies ({post.replies.length})
          <svg
            className={`ml-1 h-4 w-4 transform ${
              showReplies ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        {showReplies && (
          <div className="space-y-4 mb-4">
            {post.replies.length > 0 ? (
              post.replies.map((reply) => (
                <div
                  key={reply._id}
                  className="bg-primary bg-opacity-30 rounded-md p-3"
                >
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                    <div className="flex items-center">
                      <span>
                        {getUserName(reply.userId)}
                        {getUserRole(reply.userId) === 'lecturer' && (
                          <span className="ml-2 px-2 py-1 bg-cta rounded-full text-xs">
                            Lecturer
                          </span>
                        )}
                        {getUserRole(reply.userId) === 'admin' && (
                          <span className="ml-2 px-2 py-1 bg-red-600 rounded-full text-xs">
                            Admin
                          </span>
                        )}
                      </span>
                    </div>
                    <span>{getRelativeTime(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{reply.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No replies yet</p>
            )}
          </div>
        )}

        {/* Reply form */}
        <form onSubmit={handleSubmitReply}>
          <div className="mb-3">
            <textarea
              className="form-input w-full"
              rows={3}
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={!isAuthenticated || isSubmitting}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isAuthenticated || isSubmitting}
              className={`btn btn-primary ${
                !isAuthenticated || isSubmitting
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
