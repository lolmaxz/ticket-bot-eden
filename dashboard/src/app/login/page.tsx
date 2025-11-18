'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { MessageSquare, Shield, Zap, ArrowRight, Ticket } from 'lucide-react';

function LoginContent(): JSX.Element {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Ticket Bot</h1>
          <p className="mt-2 text-lg text-gray-600">Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your ticket management dashboard
            </p>
          </div>

          {/* Features List */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Ticket className="h-4 w-4 text-blue-600" />
              </div>
              <span>Manage tickets and member records</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <span>Track warnings and moderation actions</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Zap className="h-4 w-4 text-indigo-600" />
              </div>
              <span>Real-time updates and analytics</span>
            </div>
          </div>

          {/* Discord Login Button */}
          <button
            onClick={() => signIn('discord', { callbackUrl })}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] px-6 py-4 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="text-lg font-semibold">Continue with Discord</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#4752C4] to-[#5865F2] opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to our terms of service and privacy policy
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Secure authentication powered by Discord OAuth2
        </p>
      </div>
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

