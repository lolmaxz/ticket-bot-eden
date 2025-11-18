'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }): JSX.Element {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

