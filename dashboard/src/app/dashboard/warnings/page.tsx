'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Search } from 'lucide-react';

export default function WarningsPage(): JSX.Element {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['warnings', filters],
    queryFn: () => apiClient.getWarnings(filters),
  });

  const warnings = data?.warnings || [];
  const filteredWarnings = searchTerm
    ? warnings.filter((warning: { memberId: string; why: string; result: string }) =>
        warning.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warning.why.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warning.result.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : warnings;

  const getWarningTypeColor = (type: string): string => {
    switch (type) {
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFORMAL_WARNING':
        return 'bg-blue-100 text-blue-800';
      case 'WATCHLIST':
        return 'bg-orange-100 text-orange-800';
      case 'BANNED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Warnings</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage member warnings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by member ID, reason, or result..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={(filters.type as string) || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">Error loading warnings. Please try again.</p>
        </div>
      )}

      {/* Warnings List */}
      <div className="rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : filteredWarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No warnings found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      When
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredWarnings.map((warning: {
                    id: string;
                    memberId: string;
                    type: string;
                    why: string;
                    result: string;
                    when: string;
                    isActive: boolean;
                    loggedBy: string;
                  }) => (
                    <tr key={warning.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{warning.memberId}</div>
                        <div className="text-xs text-gray-500">By: {warning.loggedBy}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getWarningTypeColor(warning.type)}`}
                        >
                          {warning.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-900">{warning.why}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-900">{warning.result}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {format(new Date(warning.when), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            warning.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
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
              <div className="divide-y divide-gray-200">
                {filteredWarnings.map((warning: {
                  id: string;
                  memberId: string;
                  type: string;
                  why: string;
                  result: string;
                  when: string;
                  isActive: boolean;
                  loggedBy: string;
                }, index: number) => (
                  <div
                    key={warning.id}
                    className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{warning.memberId}</h3>
                          <p className="mt-1 text-xs text-gray-500">By: {warning.loggedBy}</p>
                        </div>
                        <span
                          className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${getWarningTypeColor(warning.type)}`}
                        >
                          {warning.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Reason:</span>
                          <p className="mt-1 text-gray-900">{warning.why}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Result:</span>
                          <p className="mt-1 text-gray-900">{warning.result}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-gray-700">When:</span>
                            <span className="ml-2 text-gray-900">
                              {format(new Date(warning.when), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span
                              className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                warning.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
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
        <div className="text-sm text-gray-600">
          Showing {filteredWarnings.length} of {data.total || 0} warnings
        </div>
      )}
    </div>
  );
}

