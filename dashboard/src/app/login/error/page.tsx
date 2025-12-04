'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertCircle, Home } from 'lucide-react';

function LoginErrorContent(): JSX.Element {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (): string => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact support.';
      case 'AccessDenied':
        return 'You do not have permission to access this portal.';
      case 'Verification':
        return 'The verification token has expired or is invalid.';
      default:
        return 'An unexpected error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Authentication Error</h1>
            <p className="mt-2 text-sm text-gray-600">{getErrorMessage()}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
            >
              <Home className="h-5 w-5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginErrorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginErrorContent />
    </Suspense>
  );
}

