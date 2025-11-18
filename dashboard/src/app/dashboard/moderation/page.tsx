'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, Search } from 'lucide-react';

export default function ModerationLogsPage(): JSX.Element {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['moderation-actions', filters],
    queryFn: () => apiClient.getModerationActions(filters),
  });

  const actions = data?.actions || [];
  const filteredActions = searchTerm
    ? actions.filter((action: { memberId: string; staffId: string; reason: string }) =>
        action.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : actions;

  const getActionTypeColor = (type: string): string => {
    if (type.includes('BAN') || type.includes('KICK')) {
      return 'bg-red-100 text-red-800';
    }
    if (type.includes('WARNING')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (type.includes('TIMEOUT')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (type.includes('VERIFICATION')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Moderation Logs</h1>
        <p className="mt-1 text-sm text-gray-600">View all moderation actions taken by staff</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by member ID, staff ID, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={(filters.actionType as string) || ''}
          onChange={(e) => setFilters({ ...filters, actionType: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Actions</option>
          <option value="WARNING_ISSUED">Warning Issued</option>
          <option value="INFORMAL_WARNING_ISSUED">Informal Warning</option>
          <option value="TIMEOUT">Timeout</option>
          <option value="KICK">Kick</option>
          <option value="BAN">Ban</option>
          <option value="UNBAN">Unban</option>
          <option value="WATCHLIST_ADDED">Watchlist Added</option>
          <option value="WATCHLIST_REMOVED">Watchlist Removed</option>
          <option value="VERIFICATION_GRANTED">Verification Granted</option>
          <option value="VERIFICATION_REVOKED">Verification Revoked</option>
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
          <p className="text-sm text-red-800">Error loading moderation logs. Please try again.</p>
        </div>
      )}

      {/* Moderation Actions List */}
      <div className="rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No moderation actions found</p>
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
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      When
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredActions.map((action: {
                    id: string;
                    memberId: string;
                    staffId: string;
                    actionType: string;
                    reason: string;
                    when: string;
                    duration: string | null;
                    isActive: boolean;
                  }) => (
                    <tr key={action.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {action.memberId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {action.staffId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionTypeColor(action.actionType)}`}
                        >
                          {action.actionType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-900">{action.reason}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {format(new Date(action.when), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {action.duration || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            action.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {action.isActive ? 'Active' : 'Inactive'}
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
                {filteredActions.map((action: {
                  id: string;
                  memberId: string;
                  staffId: string;
                  actionType: string;
                  reason: string;
                  when: string;
                  duration: string | null;
                  isActive: boolean;
                }, index: number) => (
                  <div
                    key={action.id}
                    className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">Member: {action.memberId}</h3>
                          <p className="mt-1 text-xs text-gray-500">Staff: {action.staffId}</p>
                        </div>
                        <span
                          className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${getActionTypeColor(action.actionType)}`}
                        >
                          {action.actionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Reason:</span>
                          <p className="mt-1 text-gray-900">{action.reason}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-gray-700">When:</span>
                            <span className="ml-2 text-gray-900">
                              {format(new Date(action.when), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="ml-2 text-gray-900">{action.duration || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span
                              className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                action.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {action.isActive ? 'Active' : 'Inactive'}
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
          Showing {filteredActions.length} of {data.total || 0} moderation actions
        </div>
      )}
    </div>
  );
}

