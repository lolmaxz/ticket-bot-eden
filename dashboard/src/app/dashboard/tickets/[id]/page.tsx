'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';
import { CopyIdButton } from '@/components/common/CopyIdButton';

export default function TicketDetailPage(): JSX.Element {
  const params = useParams();
  const ticketId = params.id as string;
  const [dateFormat, , formatDate, getAbsoluteDate] = useDateFormat();

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiClient.getTicket(ticketId),
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse rounded-lg bg-white p-6 shadow">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="rounded-lg bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Error</h2>
          <p className="mt-2 text-sm text-red-800">
            {error instanceof Error ? error.message : 'Failed to load ticket'}
          </p>
          <Link href="/tickets" className="mt-4 inline-block text-sm text-red-600 hover:text-red-800">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      {/* Mobile: Ticket Type Banner */}
      <div className="lg:hidden">
        <div className={`w-full rounded-t-lg px-4 py-2 text-center text-sm font-semibold ${getTicketTypeColor(ticket.type)}`}>
          {ticket.type.replace('_', ' ')}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/tickets" className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to Tickets
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 lg:text-3xl">{ticket.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ticket {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
          </p>
        </div>
        <div className="flex space-x-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              ticket.status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : ticket.status === 'CLOSED'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Details</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Desktop: Show type, Mobile: Hidden (shown in banner) */}
              <div className="hidden lg:block">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.type.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Opened By</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-gray-900">
                  <span>{(ticket as { creatorUsername?: string }).creatorUsername || ticket.creatorId}</span>
                  <CopyIdButton id={ticket.creatorId} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned Staff</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-gray-900">
                  {ticket.assignedStaffId ? (
                    <>
                      <span>{(ticket as { assignedStaffUsername?: string | null }).assignedStaffUsername || ticket.assignedStaffId}</span>
                      <CopyIdButton id={ticket.assignedStaffId} />
                    </>
                  ) : (
                    <span className="text-gray-500 italic">Unassigned</span>
                  )}
                </dd>
              </div>
              {ticket.closedBy && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Closed By</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm text-gray-900">
                      <span>{(ticket as { closedByUsername?: string | null }).closedByUsername || ticket.closedBy}</span>
                      <CopyIdButton id={ticket.closedBy} />
                    </dd>
                  </div>
                  {ticket.closedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Closed At</dt>
                      <dd 
                        className="mt-1 text-sm text-gray-900"
                        title={dateFormat === 'relative' ? getAbsoluteDate(ticket.closedAt) : undefined}
                      >
                        {formatDate(ticket.closedAt)}
                      </dd>
                    </div>
                  )}
                  {ticket.closeReason && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Closing Reason</dt>
                      <dd className="mt-1 text-sm text-gray-900">{ticket.closeReason}</dd>
                    </div>
                  )}
                </>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {dateFormat === 'relative' ? 'Created Since' : 'Created'}
                </dt>
                <dd 
                  className="mt-1 text-sm text-gray-900"
                  title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                >
                  {formatDate(ticket.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd 
                  className="mt-1 text-sm text-gray-900"
                  title={dateFormat === 'relative' ? getAbsoluteDate(ticket.updatedAt) : undefined}
                >
                  {formatDate(ticket.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Assign Staff
              </button>
              <button className="w-full rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700">
                Change Status
              </button>
              <button className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

