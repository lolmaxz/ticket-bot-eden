'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Search } from 'lucide-react';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'memberTag' | 'type' | 'why' | 'result' | 'when' | 'isActive';
type SortDirection = 'asc' | 'desc' | null;

export default function WarningsPage(): JSX.Element {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['warnings', filters],
    queryFn: () => apiClient.getWarnings(filters),
  });

  interface Warning {
    id: string;
    memberId: string;
    member?: {
      id: string;
      discordId: string;
      discordTag: string;
    };
    type: string;
    why: string;
    result: string;
    when: string;
    isActive: boolean;
    loggedBy: string;
  }

  const warnings = (data?.warnings || []) as Warning[];
  const filteredWarnings = searchTerm
    ? warnings.filter((warning) => {
        const searchLower = searchTerm.toLowerCase();
        const memberName = warning.member?.discordTag?.toLowerCase() || '';
        return (
          memberName.includes(searchLower) ||
          warning.memberId.toLowerCase().includes(searchLower) ||
          warning.why.toLowerCase().includes(searchLower) ||
          warning.result.toLowerCase().includes(searchLower) ||
          warning.loggedBy.toLowerCase().includes(searchLower)
        );
      })
    : warnings;

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

  const sortedWarnings = [...filteredWarnings].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: string | number | boolean | null | undefined;
    let bValue: string | number | boolean | null | undefined;
    switch (sortField) {
      case 'memberTag':
        aValue = a.member?.discordTag || a.memberId;
        bValue = b.member?.discordTag || b.memberId;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'why':
        aValue = a.why;
        bValue = b.why;
        break;
      case 'result':
        aValue = a.result;
        bValue = b.result;
        break;
      case 'when':
        aValue = new Date(a.when).getTime();
        bValue = new Date(b.when).getTime();
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

  const getWarningTypeColor = (type: string): string => {
    switch (type) {
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'INFORMAL_WARNING':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'WATCHLIST':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'BANNED':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Warnings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage member warnings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by member name, reason, or result..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={(filters.type as string) || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="WARNING">Warning</option>
          <option value="INFORMAL_WARNING">Informal Warning</option>
          <option value="WATCHLIST">Watchlist</option>
          <option value="BANNED">Banned</option>
        </select>
        <select
          value={(filters.isActive as string) || ''}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">Error loading warnings. Please try again.</p>
        </div>
      )}

      {/* Warnings List */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-500"></div>
          </div>
        ) : filteredWarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400">No warnings found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('memberTag')}
                    >
                      <div className="flex items-center gap-1">
                        Member
                        {getSortIcon('memberTag')}
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
                      onClick={() => handleSort('why')}
                    >
                      <div className="flex items-center gap-1">
                        Reason
                        {getSortIcon('why')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('result')}
                    >
                      <div className="flex items-center gap-1">
                        Result
                        {getSortIcon('result')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('when')}
                    >
                      <div className="flex items-center gap-1">
                        When
                        {getSortIcon('when')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {getSortIcon('isActive')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {sortedWarnings.map((warning) => (
                    <tr key={warning.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {warning.member?.discordTag || warning.memberId}
                          </div>
                          <CopyIdButton id={warning.member?.discordId || warning.memberId} />
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            By: {(warning as { loggedByUsername?: string }).loggedByUsername || warning.loggedBy}
                          </span>
                          <CopyIdButton id={warning.loggedBy} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getWarningTypeColor(warning.type)}`}
                        >
                          {warning.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-900 dark:text-white">{warning.why}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-900 dark:text-white">{warning.result}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(warning.when), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            warning.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {warning.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWarnings.map((warning, index: number) => (
                  <div
                    key={warning.id}
                    className={`p-4 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {warning.member?.discordTag || warning.memberId}
                            </h3>
                            <CopyIdButton id={warning.member?.discordId || warning.memberId} />
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              By: {(warning as { loggedByUsername?: string }).loggedByUsername || warning.loggedBy}
                            </p>
                            <CopyIdButton id={warning.loggedBy} />
                          </div>
                        </div>
                        <span
                          className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${getWarningTypeColor(warning.type)}`}
                        >
                          {warning.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{warning.why}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Result:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{warning.result}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">When:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {format(new Date(warning.when), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                            <span
                              className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                warning.isActive
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              {warning.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
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

      {data && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedWarnings.length} of {data.total || 0} warnings
        </div>
      )}
    </div>
  );
}

