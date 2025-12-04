'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useDateFormat } from '@/lib/use-date-format';
import { UsernameDisplay } from '@/components/common/UsernameDisplay';
import { ProfileCard } from '@/components/common/ProfileCard';
import { useState } from 'react';
import { CheckCircle, Clock, Shield } from 'lucide-react';

export default function VerificationTicketDetailPage(): JSX.Element {
  const params = useParams();
  const verificationTicketId = params.id as string;
  const [dateFormat, , formatDate, getAbsoluteDate] = useDateFormat();
  const [selectedUser, setSelectedUser] = useState<{ discordId: string; username: string; triggerElement: HTMLElement | null; clickPosition?: { x: number; y: number } | null } | null>(null);

  const { data: verificationTicket, isLoading, error } = useQuery({
    queryKey: ['verification-ticket', verificationTicketId],
    queryFn: () => apiClient.getVerificationTicket(verificationTicketId),
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

  if (error || !verificationTicket) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="rounded-lg bg-red-50 dark:bg-red-900 p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">Error</h2>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : 'Failed to load verification ticket'}
          </p>
          <Link href="/dashboard/verifications" className="mt-4 inline-block text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
            ← Back to Verifications
          </Link>
        </div>
      </div>
    );
  }

  const getVerificationStatus = () => {
    if (verificationTicket.finalVerifiedAt) {
      return { label: 'Completed', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: CheckCircle };
    }
    if (verificationTicket.initialVerifiedAt) {
      return { label: 'Initial Verified', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200', icon: Shield };
    }
    if (verificationTicket.idReceivedAt) {
      return { label: 'ID Received', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: Clock };
    }
    return { label: 'Pending', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200', icon: Clock };
  };

  const status = getVerificationStatus();
  const StatusIcon = status.icon;

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/verifications" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Verifications
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
            Verification Ticket {verificationTicket.ticket?.ticketNumber ? `#${verificationTicket.ticket.ticketNumber}` : `#${verificationTicket.ticketId.slice(0, 8)}`}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Ticket ID: {verificationTicket.ticketId}
          </p>
        </div>
        <div className="flex space-x-2">
          <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-sm font-semibold ${status.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span>{status.label}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Verification Details</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{status.label}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reminder Count</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{verificationTicket.reminderCount || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Opener</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <UsernameDisplay
                    discordId={verificationTicket.ticket?.openedBy?.discordId || verificationTicket.ticket?.creatorId || ""}
                    username={verificationTicket.creatorUsername || verificationTicket.ticket?.openedBy?.discordTag || verificationTicket.ticket?.creatorId || ""}
                    displayName={verificationTicket.creatorDisplayName || verificationTicket.ticket?.openedBy?.displayName || null}
                    onClick={(e) => {
                      const discordId = verificationTicket.ticket?.openedBy?.discordId || verificationTicket.ticket?.creatorId;
                      if (discordId) {
                        setSelectedUser({
                          discordId,
                          username: verificationTicket.creatorUsername || verificationTicket.ticket?.openedBy?.discordTag || discordId,
                          triggerElement: e.currentTarget,
                          clickPosition: { x: e.clientX, y: e.clientY },
                        });
                      }
                    }}
                  />
                </dd>
              </div>
              {verificationTicket.initialVerifierId || verificationTicket.initialVerifier ? (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Initial Verifier</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <UsernameDisplay
                      discordId={verificationTicket.initialVerifier?.discordId || verificationTicket.initialVerifierId || ""}
                      username={verificationTicket.initialVerifierUsername || verificationTicket.initialVerifier?.discordTag || verificationTicket.initialVerifierId || ""}
                      displayName={verificationTicket.initialVerifierDisplayName || verificationTicket.initialVerifier?.displayName || null}
                      onClick={(e) => {
                        const discordId = verificationTicket.initialVerifier?.discordId || verificationTicket.initialVerifierId;
                        if (discordId) {
                          setSelectedUser({
                            discordId,
                            username: verificationTicket.initialVerifierUsername || verificationTicket.initialVerifier?.discordTag || discordId,
                            triggerElement: e.currentTarget,
                            clickPosition: { x: e.clientX, y: e.clientY },
                          });
                        }
                      }}
                    />
                  </dd>
                </div>
              ) : null}
              {verificationTicket.finalVerifierId || verificationTicket.finalVerifier ? (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Verifier</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <UsernameDisplay
                      discordId={verificationTicket.finalVerifier?.discordId || verificationTicket.finalVerifierId || ""}
                      username={verificationTicket.finalVerifierUsername || verificationTicket.finalVerifier?.discordTag || verificationTicket.finalVerifierId || ""}
                      displayName={verificationTicket.finalVerifierDisplayName || verificationTicket.finalVerifier?.displayName || null}
                      onClick={(e) => {
                        const discordId = verificationTicket.finalVerifier?.discordId || verificationTicket.finalVerifierId;
                        if (discordId) {
                          setSelectedUser({
                            discordId,
                            username: verificationTicket.finalVerifierUsername || verificationTicket.finalVerifier?.discordTag || discordId,
                            triggerElement: e.currentTarget,
                            clickPosition: { x: e.clientX, y: e.clientY },
                          });
                        }
                      }}
                    />
                  </dd>
                </div>
              ) : null}
              {verificationTicket.idReceivedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {dateFormat === 'relative' ? 'ID Received Since' : 'ID Received'}
                  </dt>
                  <dd 
                    className="mt-1 text-sm text-gray-900 dark:text-white"
                    title={dateFormat === 'relative' ? getAbsoluteDate(verificationTicket.idReceivedAt) : undefined}
                  >
                    {formatDate(verificationTicket.idReceivedAt)}
                  </dd>
                </div>
              )}
              {verificationTicket.initialVerifiedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {dateFormat === 'relative' ? 'Initial Verified Since' : 'Initial Verified'}
                  </dt>
                  <dd 
                    className="mt-1 text-sm text-gray-900 dark:text-white"
                    title={dateFormat === 'relative' ? getAbsoluteDate(verificationTicket.initialVerifiedAt) : undefined}
                  >
                    {formatDate(verificationTicket.initialVerifiedAt)}
                  </dd>
                </div>
              )}
              {verificationTicket.finalVerifiedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {dateFormat === 'relative' ? 'Final Verified Since' : 'Final Verified'}
                  </dt>
                  <dd 
                    className="mt-1 text-sm text-gray-900 dark:text-white"
                    title={dateFormat === 'relative' ? getAbsoluteDate(verificationTicket.finalVerifiedAt) : undefined}
                  >
                    {formatDate(verificationTicket.finalVerifiedAt)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {dateFormat === 'relative' ? 'Created Since' : 'Created'}
                </dt>
                <dd 
                  className="mt-1 text-sm text-gray-900 dark:text-white"
                  title={dateFormat === 'relative' ? getAbsoluteDate(verificationTicket.ticket?.createdAt || '') : undefined}
                >
                  {formatDate(verificationTicket.ticket?.createdAt || '')}
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

