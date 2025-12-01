'use client';

import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';

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

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow lg:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Tickets</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
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
    <div className="rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
        <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Recent Tickets</h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {dateFormat === 'relative' ? 'Created Since' : 'Created'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {recentTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {ticket.type.replace('_', ' ')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        ticket.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'CLOSED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                  <td 
                    className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                    title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                  >
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="text-blue-600 hover:text-blue-900"
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
        <div className="divide-y divide-gray-200">
          {recentTickets.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No tickets found
            </div>
          ) : (
            recentTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className={`border-b-2 border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Mobile: Ticket Type Banner */}
                <div className={`w-full px-4 py-1.5 text-center text-xs font-semibold ${getTicketTypeColor(ticket.type)}`}>
                  {ticket.type.replace('_', ' ')}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{ticket.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
                      </p>
                    </div>
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${
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
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-900">{ticket.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {dateFormat === 'relative' ? 'Created Since:' : 'Created:'}
                      </span>
                      <span
                        className="ml-2 text-gray-900"
                        title={dateFormat === 'relative' ? getAbsoluteDate(ticket.createdAt) : undefined}
                      >
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
    </div>
  );
}

