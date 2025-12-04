"use client";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UsernameDisplay } from "@/components/common/UsernameDisplay";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle, Clock, Search, Shield, Ticket, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface VerificationTicketVerifier {
  discordId: string;
  discordTag: string;
  displayName: string | null;
}

interface VerificationTicket {
  id: string;
  ticketId: string;
  initialVerifierId: string | null;
  finalVerifierId: string | null;
  reminderCount: number;
  ticket: {
    title: string;
    createdAt: string;
    creatorId: string;
    ticketNumber?: number | null;
    openedBy?: {
      discordId: string;
      discordTag: string;
      displayName: string | null;
    };
  };
  initialVerifiedAt: string | null;
  finalVerifiedAt: string | null;
  idReceivedAt: string | null;
  lastInteraction?: string;
  creatorUsername?: string | null;
  creatorDisplayName?: string | null;
  initialVerifierUsername?: string | null;
  initialVerifierDisplayName?: string | null;
  finalVerifierUsername?: string | null;
  finalVerifierDisplayName?: string | null;
  initialVerifier?: VerificationTicketVerifier;
  finalVerifier?: VerificationTicketVerifier;
}

type SortField =
  | "ticketId"
  | "creatorUsername"
  | "status"
  | "initialVerifierUsername"
  | "finalVerifierUsername"
  | "reminderCount"
  | "lastInteraction"
  | "createdAt";
type SortDirection = "asc" | "desc" | null;
type TabType = "opened" | "completed";

export default function VerificationsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("opened");
  const [openedSearchTerm, setOpenedSearchTerm] = useState("");
  const [completedSearchTerm, setCompletedSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  // Determine which search term to use based on active tab
  const currentSearchTerm = activeTab === "opened" ? openedSearchTerm : completedSearchTerm;
  const setCurrentSearchTerm = activeTab === "opened" ? setOpenedSearchTerm : setCompletedSearchTerm;

  // Build query filters (verification completion is handled client-side, so we don't send ticket status here)
  // Use useMemo to stabilize the queryFilters object reference
  const queryFilters = useMemo(
    () => ({
      ...filters,
    }),
    [filters]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["verification-tickets", queryFilters],
    queryFn: () => apiClient.getVerificationTickets(queryFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const verificationTickets = data?.verificationTickets || [];

  // Split tickets by verification completion status:
  // - "opened" tab: tickets without a final verification
  // - "completed" tab: tickets with a final verification timestamp
  const tabTickets =
    activeTab === "opened"
      ? verificationTickets.filter((vt: VerificationTicket) => !vt.finalVerifiedAt)
      : verificationTickets.filter((vt: VerificationTicket) => !!vt.finalVerifiedAt);

  const filteredTickets = currentSearchTerm
    ? tabTickets.filter((vt: VerificationTicket) => {
        const searchLower = currentSearchTerm.toLowerCase();
        return (
          (vt.ticket.creatorId && vt.ticket.creatorId.toLowerCase().includes(searchLower)) ||
          (vt.initialVerifierId && typeof vt.initialVerifierId === "string" && vt.initialVerifierId.toLowerCase().includes(searchLower)) ||
          (vt.finalVerifierId && typeof vt.finalVerifierId === "string" && vt.finalVerifierId.toLowerCase().includes(searchLower)) ||
          (vt.initialVerifier?.discordId && vt.initialVerifier.discordId.toLowerCase().includes(searchLower)) ||
          (vt.finalVerifier?.discordId && vt.finalVerifier.discordId.toLowerCase().includes(searchLower)) ||
          (vt.ticket.openedBy?.discordId && vt.ticket.openedBy.discordId.toLowerCase().includes(searchLower))
        );
      })
    : tabTickets;

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: string | number | null | undefined;
    let bValue: string | number | null | undefined;
    switch (sortField) {
      case "ticketId":
        aValue = a.ticketId;
        bValue = b.ticketId;
        break;
      case "creatorUsername":
        aValue = a.creatorUsername || a.ticket.creatorId || "";
        bValue = b.creatorUsername || b.ticket.creatorId || "";
        break;
      case "status":
        aValue = a.finalVerifiedAt ? 3 : a.initialVerifiedAt ? 2 : a.idReceivedAt ? 1 : 0;
        bValue = b.finalVerifiedAt ? 3 : b.initialVerifiedAt ? 2 : b.idReceivedAt ? 1 : 0;
        break;
      case "initialVerifierUsername":
        aValue = a.initialVerifierUsername || a.initialVerifier?.discordTag || a.initialVerifierId || "";
        bValue = b.initialVerifierUsername || b.initialVerifier?.discordTag || b.initialVerifierId || "";
        break;
      case "finalVerifierUsername":
        aValue = a.finalVerifierUsername || a.finalVerifier?.discordTag || a.finalVerifierId || "";
        bValue = b.finalVerifierUsername || b.finalVerifier?.discordTag || b.finalVerifierId || "";
        break;
      case "reminderCount":
        aValue = a.reminderCount || 0;
        bValue = b.reminderCount || 0;
        break;
      case "lastInteraction":
        aValue = (a as { lastInteraction?: string }).lastInteraction
          ? new Date((a as { lastInteraction: string }).lastInteraction).getTime()
          : 0;
        bValue = (b as { lastInteraction?: string }).lastInteraction
          ? new Date((b as { lastInteraction: string }).lastInteraction).getTime()
          : 0;
        break;
      case "createdAt":
        aValue = new Date(a.ticket.createdAt).getTime();
        bValue = new Date(b.ticket.createdAt).getTime();
        break;
      default:
        return 0;
    }
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField): JSX.Element => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3 w-3 text-blue-600" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-3 w-3 text-blue-600" />;
    }
    return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
  };

  const getVerificationStatus = (vt: {
    initialVerifiedAt: string | null;
    finalVerifiedAt: string | null;
    idReceivedAt: string | null;
  }): { label: string; color: string; icon: typeof CheckCircle } => {
    if (vt.finalVerifiedAt) {
      return { label: "Verified", color: "bg-green-100 text-green-800", icon: CheckCircle };
    }
    if (vt.initialVerifiedAt) {
      return { label: "Initial Verified", color: "bg-blue-100 text-blue-800", icon: Clock };
    }
    if (vt.idReceivedAt) {
      return { label: "ID Received", color: "bg-yellow-100 text-yellow-800", icon: Clock };
    }
    return { label: "Pending", color: "bg-gray-100 text-gray-800", icon: XCircle };
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6 dark:bg-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Verifications</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage verification tickets</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => setActiveTab("opened")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "opened"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Ticket className="h-4 w-4" />
            Opened
          </div>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "completed"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by participant ID (searches across all participants)..."
              value={currentSearchTerm}
              onChange={(e) => setCurrentSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticket Opener (Username/ID)</label>
            <input
              type="text"
              value={(filters.openedById as string) || ""}
              onChange={(e) => setFilters({ ...filters, openedById: e.target.value || undefined })}
              placeholder="Creator Discord ID or username"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Ticket ID</label>
            <input
              type="text"
              value={(filters.ticketId as string) || ""}
              onChange={(e) => setFilters({ ...filters, ticketId: e.target.value || undefined })}
              placeholder="Ticket ID"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">Error loading verification tickets. Please try again.</p>
        </div>
      )}

      {/* Verification Tickets List */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400">No verification tickets found</p>
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
                      onClick={() => handleSort("ticketId")}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {getSortIcon("ticketId")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {getSortIcon("status")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("creatorUsername")}
                    >
                      <div className="flex items-center gap-1">
                        Ticket Opener
                        {getSortIcon("creatorUsername")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("initialVerifierUsername")}
                    >
                      <div className="flex items-center gap-1">
                        Initial Verifier
                        {getSortIcon("initialVerifierUsername")}
                      </div>
                    </th>
                    {activeTab === "completed" && (
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                        onClick={() => handleSort("finalVerifierUsername")}
                      >
                        <div className="flex items-center gap-1">
                          Final Verifier
                          {getSortIcon("finalVerifierUsername")}
                        </div>
                      </th>
                    )}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("lastInteraction")}
                    >
                      <div className="flex items-center gap-1">
                        Last Interaction
                        {getSortIcon("lastInteraction")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("reminderCount")}
                    >
                      <div className="flex items-center gap-1">
                        Reminders
                        {getSortIcon("reminderCount")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {sortedTickets.map((vt: VerificationTicket) => {
                    const status = getVerificationStatus(vt);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={vt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {vt.ticket?.ticketNumber || vt.ticketId.slice(0, 8)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color} ${
                              status.color.includes("bg-green")
                                ? "dark:bg-green-900 dark:text-green-200"
                                : status.color.includes("bg-blue")
                                ? "dark:bg-blue-900 dark:text-blue-200"
                                : status.color.includes("bg-yellow")
                                ? "dark:bg-yellow-900 dark:text-yellow-200"
                                : "dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span>{status.label}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <UsernameDisplay
                            discordId={vt.ticket.creatorId}
                            username={vt.creatorUsername || vt.ticket.creatorId}
                            displayName={vt.creatorDisplayName}
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {vt.initialVerifierUsername || vt.initialVerifier ? (
                            <UsernameDisplay
                              discordId={vt.initialVerifier?.discordId || vt.initialVerifierId || ""}
                              username={vt.initialVerifierUsername || vt.initialVerifier?.discordTag || vt.initialVerifierId || ""}
                              displayName={vt.initialVerifierDisplayName || vt.initialVerifier?.displayName || null}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        {activeTab === "completed" && (
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {vt.finalVerifierUsername || vt.finalVerifier ? (
                              <UsernameDisplay
                                discordId={vt.finalVerifier?.discordId || vt.finalVerifierId || ""}
                                username={vt.finalVerifierUsername || vt.finalVerifier?.discordTag || vt.finalVerifierId || ""}
                                displayName={vt.finalVerifierDisplayName || vt.finalVerifier?.displayName || null}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {vt.lastInteraction
                            ? format(new Date(vt.lastInteraction), "MMM d, yyyy HH:mm")
                            : format(new Date(vt.ticket.createdAt), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{vt.reminderCount || 0}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <Link
                            href={`/dashboard/verifications/${vt.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((vt: VerificationTicket, index: number) => {
                  const status = getVerificationStatus(vt);
                  const StatusIcon = status.icon;
                  return (
                    <div key={vt.id} className={`p-4 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{vt.ticket.title}</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(vt.ticket.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color} ${
                              status.color.includes("bg-green")
                                ? "dark:bg-green-900 dark:text-green-200"
                                : status.color.includes("bg-blue")
                                ? "dark:bg-blue-900 dark:text-blue-200"
                                : status.color.includes("bg-yellow")
                                ? "dark:bg-yellow-900 dark:text-yellow-200"
                                : "dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span>{status.label}</span>
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{vt.ticket?.ticketNumber || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Ticket Opener:</span>
                            <div className="mt-1">
                              <UsernameDisplay
                                discordId={vt.ticket.creatorId}
                                username={vt.creatorUsername || vt.ticket.creatorId}
                                displayName={(vt as { creatorDisplayName?: string | null }).creatorDisplayName}
                              />
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Last Interaction:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {vt.lastInteraction
                                ? format(new Date(vt.lastInteraction), "MMM d, yyyy HH:mm")
                                : format(new Date(vt.ticket.createdAt), "MMM d, yyyy HH:mm")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Reminders:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{vt.reminderCount || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Initial Verifier:</span>
                            {vt.initialVerifierUsername || vt.initialVerifier ? (
                              <div className="mt-1">
                                <UsernameDisplay
                                  discordId={vt.initialVerifier?.discordId || vt.initialVerifierId || ""}
                                  username={vt.initialVerifierUsername || vt.initialVerifier?.discordTag || vt.initialVerifierId || ""}
                                  displayName={vt.initialVerifierDisplayName || vt.initialVerifier?.displayName || null}
                                />
                              </div>
                            ) : (
                              <span className="ml-2 text-gray-500 dark:text-gray-400">-</span>
                            )}
                          </div>
                          {activeTab === "completed" && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Final Verifier:</span>
                              {vt.finalVerifierUsername || vt.finalVerifier ? (
                                <div className="mt-1">
                                  <UsernameDisplay
                                    discordId={vt.finalVerifier?.discordId || vt.finalVerifierId || ""}
                                    username={vt.finalVerifierUsername || vt.finalVerifier?.discordTag || vt.finalVerifierId || ""}
                                    displayName={vt.finalVerifierDisplayName || vt.finalVerifier?.displayName || null}
                                  />
                                </div>
                              ) : (
                                <span className="ml-2 text-gray-500 dark:text-gray-400">-</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="pt-2">
                          <Link
                            href={`/dashboard/verifications/${vt.id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedTickets.length} of {data.total || 0} verification tickets
        </div>
      )}
    </div>
  );
}
