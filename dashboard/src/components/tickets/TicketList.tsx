'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber?: number;
  type: string;
  status: string;
  title: string;
  creatorId: string;
  creatorUsername?: string;
  assignedStaffId?: string | null;
  assignedStaffUsername?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  total: number;
}

type SortField = 'ticketNumber' | 'type' | 'status' | 'title' | 'creatorUsername' | 'assignedStaffUsername' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

export function TicketList({ tickets, loading, total }: TicketListProps): JSX.Element {
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
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'creatorUsername':
        aValue = a.creatorUsername || a.creatorId;
        bValue = b.creatorUsername || b.creatorId;
        break;
      case 'assignedStaffUsername':
        aValue = a.assignedStaffUsername || 'Unassigned';
        bValue = b.assignedStaffUsername || 'Unassigned';
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
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('ticketNumber')}
              >
                <div className="flex items-center gap-1">
                  ID
                  {getSortIcon('ticketNumber')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title
                  {getSortIcon('title')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('creatorUsername')}
              >
                <div className="flex items-center gap-1">
                  Opened By
                  {getSortIcon('creatorUsername')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('assignedStaffUsername')}
              >
                <div className="flex items-center gap-1">
                  Assign To
                  {getSortIcon('assignedStaffUsername')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  {dateFormat === 'relative' ? 'Created Since' : 'Created'}
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              sortedTickets.map((ticket) => (
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span>{ticket.creatorUsername || ticket.creatorId}</span>
                      <CopyIdButton id={ticket.creatorId} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {ticket.assignedStaffUsername ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-900">{ticket.assignedStaffUsername}</span>
                        <CopyIdButton id={ticket.assignedStaffId || ''} />
                      </div>
                    ) : (
                      <span className="text-red-600 font-medium">⚠️ Unassigned</span>
                    )}
                  </td>
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
          {tickets.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No tickets found
            </div>
          ) : (
            sortedTickets.map((ticket, index) => {
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
              <div
                key={ticket.id}
                className={`border-b-2 border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Mobile: Ticket Type Banner with ticket number and unassigned warning */}
                <div className={`w-full px-4 py-1.5 flex items-center justify-between text-xs font-semibold ${getTicketTypeColor(ticket.type)}`}>
                  <span>
                    {ticket.ticketNumber ? `#${ticket.ticketNumber}` : `#${ticket.id.slice(0, 8)}`}
                  </span>
                  <span>{ticket.type.replace('_', ' ')}</span>
                  {!ticket.assignedStaffUsername && (
                    <span className="text-red-600">⚠️</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">{ticket.title}</h3>
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
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700">Opened By:</span>
                      <span className="text-gray-900">{ticket.creatorUsername || ticket.creatorId}</span>
                      <CopyIdButton id={ticket.creatorId} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700">Assign To:</span>
                      {ticket.assignedStaffUsername ? (
                        <>
                          <span className="text-gray-900">{ticket.assignedStaffUsername}</span>
                          <CopyIdButton id={ticket.assignedStaffId || ''} />
                        </>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

