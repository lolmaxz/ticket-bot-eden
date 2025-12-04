'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';
import { UsernameDisplay } from '@/components/common/UsernameDisplay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber?: number;
  type: string;
  status: string;
  title: string;
  creatorId: string;
  creatorUsername?: string;
  creatorDisplayName?: string | null;
  assignedStaffId?: string | null;
  assignedStaffUsername?: string | null;
  assignedStaffDisplayName?: string | null;
  closedBy?: string | null;
  closedByUsername?: string | null;
  closedByDisplayName?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastInteraction?: string;
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  total: number;
}

type SortField = 'ticketNumber' | 'type' | 'status' | 'creatorUsername' | 'lastInteraction' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

interface TicketListComponentProps extends TicketListProps {
  isClosedTab?: boolean;
}

export function TicketList({ tickets, loading, total, isClosedTab = false }: TicketListComponentProps): JSX.Element {
  const [dateFormat, , formatDate, getAbsoluteDate] = useDateFormat();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: string | number | null | undefined;
    let bValue: string | number | null | undefined;

    switch (sortField) {
      case 'ticketNumber':
        aValue = a.ticketNumber ?? 0;
        bValue = b.ticketNumber ?? 0;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'creatorUsername':
        aValue = a.creatorUsername || a.creatorId;
        bValue = b.creatorUsername || b.creatorId;
        break;
      case 'lastInteraction':
        aValue = a.lastInteraction ? new Date(a.lastInteraction).getTime() : 0;
        bValue = b.lastInteraction ? new Date(b.lastInteraction).getTime() : 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField): JSX.Element => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3 text-blue-600" />;
    }
    return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:px-6 lg:py-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white lg:text-lg">
          Tickets ({total})
        </h2>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('ticketNumber')}
              >
                <div className="flex items-center gap-1">
                  ID
                  {getSortIcon('ticketNumber')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('creatorUsername')}
              >
                <div className="flex items-center gap-1">
                  Opened By
                  {getSortIcon('creatorUsername')}
                </div>
              </th>
              {isClosedTab ? (
                <>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('creatorUsername')}
                  >
                    <div className="flex items-center gap-1">
                      Closed By
                      {getSortIcon('creatorUsername')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Closed At
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                </>
              ) : (
                <>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('lastInteraction')}
                  >
                    <div className="flex items-center gap-1">
                      Last Interaction
                      {getSortIcon('lastInteraction')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      {dateFormat === 'relative' ? 'Created Since' : 'Created'}
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={isClosedTab ? 7 : 7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No tickets found
                </td>
              </tr>
            ) : (
              sortedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {ticket.type.replace('_', ' ')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        ticket.status === 'OPEN'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : ticket.status === 'CLOSED'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <UsernameDisplay
                      discordId={ticket.creatorId}
                      username={ticket.creatorUsername || ticket.creatorId}
                      displayName={ticket.creatorDisplayName}
                    />
                  </td>
                  {isClosedTab ? (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.closedBy ? (
                          <UsernameDisplay
                            discordId={ticket.closedBy}
                            username={ticket.closedByUsername || ticket.closedBy}
                            displayName={ticket.closedByDisplayName}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td 
                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                        title={ticket.closedAt && dateFormat === 'relative' ? getAbsoluteDate(ticket.closedAt) : undefined}
                      >
                        {ticket.closedAt ? formatDate(ticket.closedAt) : '-'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td 
                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                        title={ticket.lastInteraction && dateFormat === 'relative' ? getAbsoluteDate(ticket.lastInteraction) : undefined}
                      >
                        {ticket.lastInteraction ? formatDate(ticket.lastInteraction) : formatDate(ticket.createdAt)}
                      </td>
                      <td 
                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                        title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                      >
                        {formatDate(ticket.createdAt)}
                      </td>
                    </>
                  )}
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tickets.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No tickets found
            </div>
          ) : (
            sortedTickets.map((ticket, index) => {
              const getTicketTypeColor = (type: string): string => {
                switch (type) {
                  case 'VERIFICATION_ID':
                    return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                  case 'STAFF_TALK':
                    return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
                  case 'EVENT_REPORT':
                    return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
                  case 'UNSOLICITED_DM':
                    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
                  case 'FRIEND_REQUEST':
                    return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200';
                  case 'DRAMA':
                    return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
                  default:
                    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
                }
              };

              return (
              <div
                key={ticket.id}
                className={`border-b-2 border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'}`}
              >
                {/* Mobile: Ticket Type Banner with ticket number and unassigned warning */}
                <div className={`w-full px-4 py-1.5 flex items-center justify-between text-xs font-semibold ${getTicketTypeColor(ticket.type)}`}>
                  <span>
                    {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
                  </span>
                  <span>{ticket.type.replace('_', ' ')}</span>
                  {!ticket.assignedStaffUsername && (
                    <span className="text-red-600 dark:text-red-400">⚠️</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${
                        ticket.status === 'OPEN'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : ticket.status === 'CLOSED'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Opened By:</span>
                      <div className="mt-1">
                        <UsernameDisplay
                          discordId={ticket.creatorId}
                          username={ticket.creatorUsername || ticket.creatorId}
                          displayName={ticket.creatorDisplayName}
                        />
                      </div>
                    </div>
                    {isClosedTab ? (
                      <>
                        {ticket.closedBy && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Closed By:</span>
                            <div className="mt-1">
                              <UsernameDisplay
                                discordId={ticket.closedBy}
                                username={ticket.closedByUsername || ticket.closedBy}
                                displayName={ticket.closedByDisplayName}
                              />
                            </div>
                          </div>
                        )}
                        {ticket.closedAt && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Closed At:</span>
                            <span 
                              className="ml-2 text-gray-900 dark:text-white"
                              title={dateFormat === 'relative' ? getAbsoluteDate(ticket.closedAt) : undefined}
                            >
                              {formatDate(ticket.closedAt)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Last Interaction:</span>
                          <span 
                            className="ml-2 text-gray-900 dark:text-white"
                            title={ticket.lastInteraction && dateFormat === 'relative' ? getAbsoluteDate(ticket.lastInteraction) : undefined}
                          >
                            {ticket.lastInteraction ? formatDate(ticket.lastInteraction) : formatDate(ticket.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {dateFormat === 'relative' ? 'Created Since:' : 'Created:'}
                          </span>
                          <span 
                            className="ml-2 text-gray-900 dark:text-white"
                            title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                          >
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="block w-full rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

