'use client';

import { Ticket, Clock, AlertCircle } from 'lucide-react';

interface Ticket {
  id: string;
  type: string;
  status: string;
  assignedStaffId?: string | null;
  createdAt: string;
}

interface StatsCardsProps {
  tickets: Ticket[];
  loading: boolean;
}

export function StatsCards({ tickets, loading }: StatsCardsProps): JSX.Element {
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    incomplete: tickets.filter((t) => {
      const createdAt = new Date(t.createdAt);
      const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      return t.status !== 'CLOSED' && hoursSinceCreation > 48;
    }).length,
  };

  const cardData = [
    {
      name: 'Total Tickets',
      value: stats.total,
      icon: Ticket,
      color: 'bg-blue-500',
    },
    {
      name: 'Open Tickets',
      value: stats.open,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      name: 'Incomplete',
      value: stats.incomplete,
      icon: Clock,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {cardData.map((card) => (
        <div key={card.name} className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm truncate">{card.name}</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">{card.value}</p>
            </div>
            <div className={`rounded-full ${card.color} p-2 flex-shrink-0 sm:p-3`}>
              <card.icon className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

