'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary bg-opacity-90 text-foreground py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About OLP</h3>
            <p className="text-sm text-gray-300">
              Online Learning Platform (OLP) is a modern e-learning solution designed for Nigerian universities,
              providing flexible, accessible, and resilient education.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gray-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-gray-300">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-gray-300">
                  Forums
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gray-300">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@olp.edu.ng</li>
              <li>Phone: +234 123 456 7890</li>
              <li>Address: University Campus, Nigeria</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-sm text-center">
          <p>&copy; {currentYear} Online Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
