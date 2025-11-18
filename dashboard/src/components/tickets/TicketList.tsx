'use client';

import Link from 'next/link';

interface Ticket {
  id: string;
  type: string;
  status: string;
  title: string;
  creatorId: string;
  assignedStaffId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  total: number;
}

export function TicketList({ tickets, loading, total }: TicketListProps): JSX.Element {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
        <h2 className="text-base font-semibold text-gray-900 lg:text-lg">
          Tickets ({total})
        </h2>
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
                Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900">
                    {ticket.id.slice(0, 8)}...
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {ticket.assignedStaffId ? 'Yes' : 'Unassigned'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
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
          {tickets.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No tickets found
            </div>
          ) : (
            tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{ticket.title}</h3>
                      <p className="mt-1 text-xs font-mono text-gray-500">{ticket.id.slice(0, 8)}...</p>
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
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-900">{ticket.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Assigned:</span>
                      <span className="ml-2 text-gray-900">{ticket.assignedStaffId ? 'Yes' : 'Unassigned'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
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

