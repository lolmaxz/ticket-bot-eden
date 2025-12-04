'use client';

import Link from 'next/link';
import { Shield, Home, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function NoPermissionPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background grid - subtle */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(cyan 1px, transparent 1px),
            linear-gradient(90deg, cyan 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-pink-100 dark:bg-pink-500/20 border border-pink-300 dark:border-pink-500/40">
            <AlertCircle className="w-10 h-10 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-pink-300 mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-gray-700 dark:text-purple-200 mb-2">
            You don&apos;t have permission to access this dashboard.
          </p>
          <p className="text-sm text-gray-600 dark:text-purple-300 mb-8">
            This dashboard is restricted to members of The Eden Apis Discord Server with appropriate roles. 
            If you believe this is an error, please contact an administrator.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-white"
            style={{ 
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
              boxShadow: theme === 'dark' 
                ? '0 0 10px rgba(168, 85, 247, 0.4), 0 0 20px rgba(236, 72, 153, 0.2)'
                : '0 0 8px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Link>

          <div className="pt-4 border-t border-gray-200 dark:border-cyan-500/20">
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-cyan-300">
              <Shield className="w-4 h-4 mr-2" />
              <span>Access requires server membership and specific roles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
