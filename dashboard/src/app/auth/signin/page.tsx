'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent(): JSX.Element {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ticket Bot Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in with your Discord account</p>
        </div>
        <button
          onClick={() => signIn('discord', { callbackUrl })}
          className="w-full rounded-lg bg-[#5865F2] px-4 py-3 text-white transition-colors hover:bg-[#4752C4]"
        >
          Sign in with Discord
        </button>
        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}

export default function SignInPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

