'use client';

import { useState } from 'react';
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

type Forum = {
  _id: string;
  courseId: string;
  posts: Post[];
  createdAt: string;
  updatedAt: string;
};

type PostFormData = {
  title: string;
  content: string;
};

type ReplyFormData = {
  content: string;
};

export default function useForums() {
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get forum for a course
  const getForumByCourseId = async (courseId: string): Promise<Forum | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/forums?courseId=${courseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch forum');
      }
      
      if (data.success && data.forum) {
        setForum(data.forum);
        return data.forum;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Forum fetch error:', error);
      setError(error.message || 'An error occurred while fetching the forum');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (courseId: string, postData: PostFormData): Promise<Post | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch('/api/forums/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, ...postData }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }
      
      if (data.success && data.post) {
        toast.success('Post created successfully');
        
        // Update the forum state if we have it loaded
        if (forum && forum.courseId === courseId) {
          setForum({
            ...forum,
            posts: [data.post, ...forum.posts],
          });
        }
        
        return data.post;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Post creation error:', error);
      setError(error.message || 'An error occurred while creating the post');
      toast.error(error.message || 'Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add a reply to a post
  const addReply = async (postId: string, replyData: ReplyFormData): Promise<Reply | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(`/api/forums/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(replyData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add reply');
      }
      
      if (data.success && data.reply) {
        toast.success('Reply added successfully');
        
        // Update the forum state if we have it loaded
        if (forum) {
          const updatedPosts = forum.posts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                replies: [...post.replies, data.reply],
              };
            }
            return post;
          });
          
          setForum({
            ...forum,
            posts: updatedPosts,
          });
        }
        
        return data.reply;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Reply creation error:', error);
      setError(error.message || 'An error occurred while adding the reply');
      toast.error(error.message || 'Failed to add reply');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    forum,
    loading,
    error,
    getForumByCourseId,
    createPost,
    addReply,
  };
}
