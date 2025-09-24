'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type AuthCheckProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function AuthCheck({ children, allowedRoles }: AuthCheckProps) {
  const { user, isAuthenticated, loading, hasRole } = useApp();
  const router = useRouter();
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    if (isBrowser && !loading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.replace('/login');
        return;
      }

      // Check if user has required roles
      if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          console.log('Unauthorized access, redirecting to home');
          router.replace('/');
        }
      }
    }
  }, [loading, isAuthenticated, router, isBrowser, hasRole, allowedRoles]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
      </div>
    );
  }

  // Show loading spinner if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
      </div>
    );
  }

  // Show loading spinner if role check fails (will redirect)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
        </div>
      );
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
}
