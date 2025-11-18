'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { useState } from 'react';

export default function TicketsPage(): JSX.Element {
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => apiClient.getTickets(filters),
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
        <p className="mt-1 text-sm text-gray-600">Manage and view all tickets</p>
      </div>

      <TicketFilters filters={filters} onFiltersChange={setFilters} />

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">Error loading tickets. Please try again.</p>
        </div>
      )}

      <TicketList tickets={data?.tickets || []} loading={isLoading} total={data?.total || 0} />
    </div>
  );
}

