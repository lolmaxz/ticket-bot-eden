'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

async function checkDashboardAccess(): Promise<boolean> {
  try {
    const response = await fetch('/api/dashboard/check-access', {
      // Don't cache the request
      cache: 'no-store',
      // Add credentials to ensure cookies are sent
      credentials: 'include',
    });
    
    if (response.status === 401) {
      console.error('Dashboard access check: Unauthorized (401) - session may have expired');
      return false;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // For 403, log but don't treat as fatal - might be transient
      if (response.status === 403) {
        console.warn('Dashboard access check: Forbidden (403)', errorData);
      } else {
        console.error('Dashboard access check failed:', response.status, errorData);
      }
      return false;
    }
    
    const data = await response.json();
    return data.hasAccess === true;
  } catch (error) {
    console.error('Dashboard access check error:', error);
    // Network errors should not immediately fail - allow retry
    return false;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { status, data: session } = useSession();
  const router = useRouter();
  const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  const [accessChecked, setAccessChecked] = useState(false);

  // Check dashboard access when authenticated
  // Retry on failure to handle transient network issues
  const { data: hasAccess, isLoading: checkingAccess } = useQuery({
    queryKey: ['dashboard-access', session?.user?.id],
    queryFn: checkDashboardAccess,
    enabled: status === 'authenticated' && !SKIP_AUTH,
    retry: (failureCount) => {
      // Retry up to 2 times for network errors or 403s (might be transient)
      if (failureCount < 2) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary checks
    refetchOnMount: true, // Always check on mount
  });

  useEffect(() => {
    // Redirect to sign-in if not authenticated (unless SKIP_AUTH is enabled)
    if (status === 'unauthenticated' && !SKIP_AUTH) {
      // Redirect to home page which will handle sign-in
      router.push('/');
      return;
    }

    // Check access when authenticated
    if (status === 'authenticated' && !SKIP_AUTH) {
      if (!checkingAccess && hasAccess !== undefined) {
        setAccessChecked(true);
        if (hasAccess === false) {
          console.log('Dashboard access denied, redirecting to /no-permission');
          router.push('/no-permission');
        }
      }
    } else if (SKIP_AUTH || (status === 'authenticated' && SKIP_AUTH)) {
      setAccessChecked(true);
    }
  }, [status, router, SKIP_AUTH, hasAccess, checkingAccess]);

  // Show loading state while checking authentication or access
  if (status === 'loading' || (status === 'authenticated' && !SKIP_AUTH && checkingAccess)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (unless SKIP_AUTH)
  if (status === 'unauthenticated' && !SKIP_AUTH) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if access check failed (unless SKIP_AUTH)
  if (status === 'authenticated' && !SKIP_AUTH && accessChecked && hasAccess === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated and has access (or SKIP_AUTH is enabled)
  // Also allow rendering if access check hasn't completed yet (hasAccess is undefined)
  if ((status === 'authenticated' && (SKIP_AUTH || hasAccess === true || hasAccess === undefined)) || SKIP_AUTH) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar - always visible on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto dark:bg-gray-900">{children}</main>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}

