'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { useState, useMemo } from 'react';
import { Ticket, CheckCircle } from 'lucide-react';

type TabType = 'opened' | 'closed';

export default function TicketsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('opened');
  const [openedFilters, setOpenedFilters] = useState<Record<string, unknown>>({});
  const [closedFilters, setClosedFilters] = useState<Record<string, unknown>>({});

  // Determine which filters to use based on active tab
  const currentFilters = activeTab === 'opened' ? openedFilters : closedFilters;
  const setCurrentFilters = activeTab === 'opened' ? setOpenedFilters : setClosedFilters;

  // Filter out VERIFICATION_ID and set status based on tab
  // Use useMemo to stabilize the queryFilters object reference
  const queryFilters = useMemo(() => ({
    ...currentFilters,
    type: Array.isArray(currentFilters.type)
      ? (currentFilters.type as string[]).filter((t) => t !== 'VERIFICATION_ID')
      : currentFilters.type !== 'VERIFICATION_ID' ? currentFilters.type : undefined,
    status: activeTab === 'opened' 
      ? ['OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE']
      : ['CLOSED', 'ARCHIVED'],
  }), [currentFilters, activeTab]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets', queryFilters],
    queryFn: () => apiClient.getTickets(queryFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6 dark:bg-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Tickets</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and view all tickets</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => setActiveTab('opened')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'opened'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Ticket className="h-4 w-4" />
            Opened
          </div>
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'closed'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Closed
          </div>
        </button>
      </div>

      <TicketFilters filters={currentFilters} onFiltersChange={setCurrentFilters} />

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">Error loading tickets. Please try again.</p>
        </div>
      )}

      <TicketList tickets={data?.tickets || []} loading={isLoading} total={data?.total || 0} isClosedTab={activeTab === 'closed'} />
    </div>
  );
}

