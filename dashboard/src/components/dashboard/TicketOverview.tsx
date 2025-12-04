'use client';

import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';
import { useState } from 'react';
import { ProfileCard } from '@/components/common/ProfileCard';
import { CopyIdButton } from '@/components/common/CopyIdButton';

interface Ticket {
  id: string;
  ticketNumber?: number;
  type: string;
  status: string;
  title: string;
  createdAt: string;
  assignedStaffId?: string | null;
  creatorUsername?: string;
  creatorId?: string;
}

interface TicketOverviewProps {
  tickets: Ticket[];
  loading: boolean;
}

export function TicketOverview({ tickets, loading }: TicketOverviewProps): JSX.Element {
  const [dateFormat, , formatDate, getAbsoluteDate] = useDateFormat();
  const [selectedUser, setSelectedUser] = useState<{ discordId: string; username: string; triggerElement: HTMLElement | null; clickPosition: { x: number; y: number } | null } | null>(null);

  if (loading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow lg:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentTickets = tickets.slice(0, 10);

  const getTicketTypeColor = (type: string): string => {
    switch (type) {
      case 'VERIFICATION_ID':
        return 'bg-blue-100 text-blue-800';
      case 'STAFF_TALK':
        return 'bg-purple-100 text-purple-800';
      case 'EVENT_REPORT':
        return 'bg-orange-100 text-orange-800';
      case 'UNSOLICITED_DM':
        return 'bg-red-100 text-red-800';
      case 'FRIEND_REQUEST':
        return 'bg-pink-100 text-pink-800';
      case 'DRAMA':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:px-6 lg:py-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white lg:text-lg">Recent Tickets</h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Opened By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {dateFormat === 'relative' ? 'Created Since' : 'Created'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {recentTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No tickets found
                </td>
              </tr>
            ) : (
              recentTickets.map((ticket) => (
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {ticket.creatorId ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Toggle card on click
                            if (selectedUser?.discordId === ticket.creatorId) {
                              setSelectedUser(null);
                            } else {
                              setSelectedUser({ 
                                discordId: ticket.creatorId!, 
                                username: ticket.creatorUsername || 'Unknown',
                                triggerElement: e.currentTarget,
                                clickPosition: { x: e.clientX, y: e.clientY }
                              });
                            }
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                        >
                          {ticket.creatorUsername || ticket.creatorId || 'Unknown'}
                        </button>
                        <CopyIdButton id={ticket.creatorId} />
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td 
                    className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                    title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                  >
                    {formatDate(ticket.createdAt)}
                  </td>
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
          {recentTickets.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No tickets found
            </div>
          ) : (
            recentTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className={`border-b-2 border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'}`}
              >
                {/* Mobile: Ticket Type Banner */}
                <div className={`w-full px-4 py-1.5 text-center text-xs font-semibold ${getTicketTypeColor(ticket.type)}`}>
                  {ticket.type.replace('_', ' ')}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
                      </p>
                    </div>
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${
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
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{ticket.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Opened By:</span>
                      {ticket.creatorId ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Toggle card on click
                              if (selectedUser?.discordId === ticket.creatorId) {
                                setSelectedUser(null);
                              } else {
                                setSelectedUser({ 
                                  discordId: ticket.creatorId!, 
                                  username: ticket.creatorUsername || 'Unknown',
                                  triggerElement: e.currentTarget,
                                  clickPosition: { x: e.clientX, y: e.clientY }
                                });
                              }
                            }}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                          >
                            {ticket.creatorUsername || ticket.creatorId || 'Unknown'}
                          </button>
                          <CopyIdButton id={ticket.creatorId} />
                        </div>
                      ) : (
                        <span className="ml-2 text-gray-900 dark:text-white">Unknown</span>
                      )}
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
            ))
          )}
        </div>
      </div>

      {/* Profile Card Tooltip */}
      {selectedUser && (
        <ProfileCard
          discordId={selectedUser.discordId}
          username={selectedUser.username}
          onClose={() => {
            setSelectedUser(null);
          }}
          triggerElement={selectedUser.triggerElement}
          clickPosition={selectedUser.clickPosition}
        />
      )}
    </div>
  );
}

