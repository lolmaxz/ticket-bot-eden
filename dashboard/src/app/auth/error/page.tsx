'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent(): JSX.Element {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error === 'Configuration'
              ? 'There is a problem with the server configuration.'
              : error === 'AccessDenied'
                ? 'You do not have permission to sign in.'
                : 'An error occurred during authentication.'}
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

