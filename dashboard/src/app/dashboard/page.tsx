'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TicketOverview } from '@/components/dashboard/TicketOverview';

export default function DashboardPage(): JSX.Element {
  const { data: session, status } = useSession();

  // In development mode with SKIP_AUTH, bypass authentication check
  const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets', 'overview'],
    queryFn: () => apiClient.getTickets({ limit: '100' }),
    enabled: status === 'authenticated' || SKIP_AUTH,
  });

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' && !SKIP_AUTH) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Please sign in</h1>
          <p className="text-gray-600">You need to be authenticated to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {session?.user?.username || 'User'}!
        </p>
      </div>

      <StatsCards tickets={ticketsData?.tickets || []} loading={ticketsLoading} />

      <TicketOverview tickets={ticketsData?.tickets || []} loading={ticketsLoading} />
    </div>
  );
}

