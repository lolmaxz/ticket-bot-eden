'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerificationsPage(): JSX.Element {
  const [filters] = useState<Record<string, unknown>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['verification-tickets', filters],
    queryFn: () => apiClient.getVerificationTickets(filters),
  });

  const verificationTickets = data?.verificationTickets || [];
  const filteredTickets = searchTerm
    ? verificationTickets.filter((vt: { ticket: { title: string; creatorId: string } }) =>
        vt.ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vt.ticket.creatorId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : verificationTickets;

  const getVerificationStatus = (vt: {
    initialVerifiedAt: string | null;
    finalVerifiedAt: string | null;
    idReceivedAt: string | null;
  }): { label: string; color: string; icon: typeof CheckCircle } => {
    if (vt.finalVerifiedAt) {
      return { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    if (vt.initialVerifiedAt) {
      return { label: 'Initial Verified', color: 'bg-blue-100 text-blue-800', icon: Clock };
    }
    if (vt.idReceivedAt) {
      return { label: 'ID Received', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
    return { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: XCircle };
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Verifications</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage verification tickets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or creator ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">Error loading verification tickets. Please try again.</p>
        </div>
      )}

      {/* Verification Tickets List */}
      <div className="rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No verification tickets found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Initial Verifier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Final Verifier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reminders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredTickets.map((vt: {
                    id: string;
                    ticketId: string;
                    verificationType: string;
                    initialVerifierId: string | null;
                    finalVerifierId: string | null;
                    reminderCount: number;
                    ticket: { title: string; createdAt: string };
                    initialVerifiedAt: string | null;
                    finalVerifiedAt: string | null;
                    idReceivedAt: string | null;
                  }) => {
                    const status = getVerificationStatus(vt);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={vt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{vt.ticket.title}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(vt.ticket.createdAt), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {vt.verificationType}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{status.label}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {vt.initialVerifierId || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {vt.finalVerifierId || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {vt.reminderCount || 0}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <Link
                            href={`/dashboard/tickets/${vt.ticketId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredTickets.map((vt: {
                  id: string;
                  ticketId: string;
                  verificationType: string;
                  initialVerifierId: string | null;
                  finalVerifierId: string | null;
                  reminderCount: number;
                  ticket: { title: string; createdAt: string };
                  initialVerifiedAt: string | null;
                  finalVerifiedAt: string | null;
                  idReceivedAt: string | null;
                }, index: number) => {
                  const status = getVerificationStatus(vt);
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={vt.id}
                      className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">{vt.ticket.title}</h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {format(new Date(vt.ticket.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{status.label}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="ml-2 text-gray-900">{vt.verificationType}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Reminders:</span>
                            <span className="ml-2 text-gray-900">{vt.reminderCount || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Initial Verifier:</span>
                            <span className="ml-2 text-gray-900">{vt.initialVerifierId || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Final Verifier:</span>
                            <span className="ml-2 text-gray-900">{vt.finalVerifierId || '-'}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Link
                            href={`/dashboard/tickets/${vt.ticketId}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {data && (
        <div className="text-sm text-gray-600">
          Showing {filteredTickets.length} of {data.total || 0} verification tickets
        </div>
      )}
    </div>
  );
}

