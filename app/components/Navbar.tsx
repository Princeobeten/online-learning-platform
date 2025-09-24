'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-primary bg-opacity-90 text-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main nav links */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold">
                OLP
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary hover:bg-opacity-70">
                  Home
                </Link>
                <Link href="/courses" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary hover:bg-opacity-70">
                  Courses
                </Link>
                {isAuthenticated && (
                  <Link href="/forum" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary hover:bg-opacity-70">
                    Forums
                  </Link>
                )}
                {isAuthenticated && user?.role !== 'student' && (
                  <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary hover:bg-opacity-70">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* User menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <span className="mr-3">{user?.name}</span>
                    <button 
                      onClick={logout}
                      className="px-3 py-2 rounded-md text-sm font-medium bg-cta hover:bg-ctaHover"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary hover:bg-opacity-70">
                    Login
                  </Link>
                  <Link href="/signup" className="px-3 py-2 rounded-md text-sm font-medium bg-cta hover:bg-ctaHover">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-primary hover:bg-opacity-70 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:bg-opacity-70">
            Home
          </Link>
          <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:bg-opacity-70">
            Courses
          </Link>
          {isAuthenticated && (
            <Link href="/forum" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:bg-opacity-70">
              Forums
            </Link>
          )}
          {isAuthenticated && user?.role !== 'student' && (
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:bg-opacity-70">
              Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-primary">
          {isAuthenticated ? (
            <div className="px-2 space-y-1">
              <div className="px-3 py-2">{user?.name}</div>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-cta hover:bg-ctaHover"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:bg-opacity-70">
                Login
              </Link>
              <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium bg-cta hover:bg-ctaHover">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
