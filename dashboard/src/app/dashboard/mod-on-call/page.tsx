'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { Clock, User, Ticket, FileText, Calendar } from 'lucide-react';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'staffUsername' | 'weekStart' | 'ticketsClosed' | 'recordsLogged' | 'isActive';
type SortDirection = 'asc' | 'desc' | null;

export default function ModOnCallPage(): JSX.Element {
  const { data: currentMod, isLoading: currentLoading, error: currentError } = useQuery({
    queryKey: ['mod-on-call', 'current'],
    queryFn: () => apiClient.getCurrentModOnCall(),
    retry: false,
  });

  const { data: allRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['mod-on-call', 'all'],
    queryFn: () => apiClient.getModOnCall({ limit: '100' }),
  });

  const records = allRecords?.records || [];
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: string | number | boolean | null | undefined;
    let bValue: string | number | boolean | null | undefined;
    switch (sortField) {
      case 'staffUsername':
        aValue = a.staffUsername || a.staffId;
        bValue = b.staffUsername || b.staffId;
        break;
      case 'weekStart':
        aValue = new Date(a.weekStart).getTime();
        bValue = new Date(b.weekStart).getTime();
        break;
      case 'ticketsClosed':
        aValue = a.ticketsClosed || 0;
        bValue = b.ticketsClosed || 0;
        break;
      case 'recordsLogged':
        aValue = a.recordsLogged || 0;
        bValue = b.recordsLogged || 0;
        break;
      case 'isActive':
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
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

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Mod on Call</h1>
        <p className="mt-1 text-sm text-gray-600">View current and historical mod on call records</p>
      </div>

      {/* Current Mod on Call Card */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Current Mod on Call</h2>
        {currentLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : currentError ? (
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">No active mod on call at this time.</p>
          </div>
        ) : currentMod ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Staff Member</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <p className="text-2xl font-bold text-blue-900">
                  {(currentMod as { staffUsername?: string }).staffUsername || currentMod.staffId}
                </p>
                <CopyIdButton id={currentMod.staffId} />
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Tickets Closed</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-900">
                {currentMod.ticketsClosed || 0}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Records Logged</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-900">
                {currentMod.recordsLogged || 0}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Week</span>
              </div>
              <p className="mt-2 text-sm font-bold text-orange-900">
                {currentMod.weekStart
                  ? format(new Date(currentMod.weekStart), 'MMM d')
                  : 'N/A'}{' '}
                -{' '}
                {currentMod.weekEnd
                  ? format(new Date(currentMod.weekEnd), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Historical Records */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Historical Records</h2>
        </div>
        {recordsLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Clock className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No mod on call records found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('staffUsername')}
                    >
                      <div className="flex items-center gap-1">
                        Staff Member
                        {getSortIcon('staffUsername')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('weekStart')}
                    >
                      <div className="flex items-center gap-1">
                        Week Period
                        {getSortIcon('weekStart')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('ticketsClosed')}
                    >
                      <div className="flex items-center gap-1">
                        Tickets Closed
                        {getSortIcon('ticketsClosed')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('recordsLogged')}
                    >
                      <div className="flex items-center gap-1">
                        Records Logged
                        {getSortIcon('recordsLogged')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {getSortIcon('isActive')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedRecords.map((record: {
                    id: string;
                    staffId: string;
                    staffUsername?: string;
                    weekStart: string;
                    weekEnd: string;
                    ticketsClosed: number;
                    recordsLogged: number;
                    isActive: boolean;
                  }) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <span>{record.staffUsername || record.staffId}</span>
                          <CopyIdButton id={record.staffId} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {format(new Date(record.weekStart), 'MMM d')} -{' '}
                        {format(new Date(record.weekEnd), 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {record.ticketsClosed || 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {record.recordsLogged || 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            record.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {record.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {sortedRecords.map((record: {
                  id: string;
                  staffId: string;
                  staffUsername?: string;
                  weekStart: string;
                  weekEnd: string;
                  ticketsClosed: number;
                  recordsLogged: number;
                  isActive: boolean;
                }, index: number) => (
                  <div
                    key={record.id}
                    className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-medium text-gray-900">
                              {record.staffUsername || record.staffId}
                            </h3>
                            <CopyIdButton id={record.staffId} />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {format(new Date(record.weekStart), 'MMM d')} -{' '}
                            {format(new Date(record.weekEnd), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span
                          className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${
                            record.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {record.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Tickets Closed:</span>
                          <span className="ml-2 text-gray-900">{record.ticketsClosed || 0}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Records Logged:</span>
                          <span className="ml-2 text-gray-900">{record.recordsLogged || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

