'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';
import { UsernameDisplay } from '@/components/common/UsernameDisplay';
import { ProfileCard } from '@/components/common/ProfileCard';
import { useState } from 'react';

export default function TicketDetailPage(): JSX.Element {
  const params = useParams();
  const ticketId = params.id as string;
  const [dateFormat, , formatDate, getAbsoluteDate] = useDateFormat();
  const [selectedUser, setSelectedUser] = useState<{ discordId: string; username: string; triggerElement: HTMLElement | null; clickPosition?: { x: number; y: number } | null } | null>(null);

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiClient.getTicket(ticketId),
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="rounded-lg bg-red-50 dark:bg-red-900 p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">Error</h2>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : 'Failed to load ticket'}
          </p>
          <Link href="/dashboard/tickets" className="mt-4 inline-block text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      {/* Mobile: Ticket Type Banner */}
      <div className="lg:hidden">
        <div className={`w-full rounded-t-lg px-4 py-2 text-center text-sm font-semibold ${getTicketTypeColor(ticket.type)}`}>
          {ticket.type.replace('_', ' ')}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/tickets" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Tickets
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">{ticket.title}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Ticket {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
          </p>
        </div>
        <div className="flex space-x-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Details</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Desktop: Show type, Mobile: Hidden (shown in banner) */}
              <div className="hidden lg:block">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{ticket.type.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{ticket.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Opened By</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <UsernameDisplay
                    discordId={ticket.creatorId}
                    username={(ticket as { creatorUsername?: string }).creatorUsername || ticket.creatorId}
                    displayName={(ticket as { creatorDisplayName?: string | null }).creatorDisplayName || null}
                    onClick={(e) => {
                      setSelectedUser({
                        discordId: ticket.creatorId,
                        username: (ticket as { creatorUsername?: string }).creatorUsername || ticket.creatorId,
                        triggerElement: e.currentTarget,
                        clickPosition: { x: e.clientX, y: e.clientY },
                      });
                    }}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Staff</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {ticket.assignedStaffId ? (
                    <UsernameDisplay
                      discordId={ticket.assignedStaffId}
                      username={(ticket as { assignedStaffUsername?: string | null }).assignedStaffUsername || ticket.assignedStaffId}
                      displayName={(ticket as { assignedStaffDisplayName?: string | null }).assignedStaffDisplayName || null}
                      onClick={(e) => {
                        setSelectedUser({
                          discordId: ticket.assignedStaffId,
                          username: (ticket as { assignedStaffUsername?: string | null }).assignedStaffUsername || ticket.assignedStaffId,
                          triggerElement: e.currentTarget,
                          clickPosition: { x: e.clientX, y: e.clientY },
                        });
                      }}
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 italic">Unassigned</span>
                  )}
                </dd>
              </div>
              {ticket.closedBy && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed By</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <UsernameDisplay
                        discordId={ticket.closedBy}
                        username={(ticket as { closedByUsername?: string | null }).closedByUsername || ticket.closedBy}
                        displayName={(ticket as { closedByDisplayName?: string | null }).closedByDisplayName || null}
                        onClick={(e) => {
                          setSelectedUser({
                            discordId: ticket.closedBy,
                            username: (ticket as { closedByUsername?: string | null }).closedByUsername || ticket.closedBy,
                            triggerElement: e.currentTarget,
                            clickPosition: { x: e.clientX, y: e.clientY },
                          });
                        }}
                      />
                    </dd>
                  </div>
                  {ticket.closedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed At</dt>
                      <dd 
                        className="mt-1 text-sm text-gray-900 dark:text-white"
                        title={dateFormat === 'relative' ? getAbsoluteDate(ticket.closedAt) : undefined}
                      >
                        {formatDate(ticket.closedAt)}
                      </dd>
                    </div>
                  )}
                  {ticket.closeReason && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Closing Reason</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{ticket.closeReason}</dd>
                    </div>
                  )}
                </>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {dateFormat === 'relative' ? 'Created Since' : 'Created'}
                </dt>
                <dd 
                  className="mt-1 text-sm text-gray-900 dark:text-white"
                  title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                >
                  {formatDate(ticket.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd 
                  className="mt-1 text-sm text-gray-900 dark:text-white"
                  title={dateFormat === 'relative' ? getAbsoluteDate(ticket.updatedAt) : undefined}
                >
                  {formatDate(ticket.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Card for Selected User */}
          {selectedUser && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
              <ProfileCard
                discordId={selectedUser.discordId}
                username={selectedUser.username}
                onClose={() => setSelectedUser(null)}
                triggerElement={selectedUser.triggerElement}
                clickPosition={selectedUser.clickPosition}
                alwaysVisible={true}
              />
            </div>
          )}

          {/* Commented out buttons for now */}
          {/* <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full rounded-md bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600">
                Assign Staff
              </button>
              <button className="w-full rounded-md bg-yellow-600 dark:bg-yellow-700 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 dark:hover:bg-yellow-600">
                Change Status
              </button>
              <button className="w-full rounded-md bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600">
                Close Ticket
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

