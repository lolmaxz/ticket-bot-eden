"use client";

import { UsernameDisplay } from "@/components/common/UsernameDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, Ban, Search, UserX } from "lucide-react";
import { useState } from "react";

type TabType = "kicks" | "bans";
type SortField = "memberUsername" | "staffUsername" | "reason" | "when" | "duration" | "appealIn";
type SortDirection = "asc" | "desc" | null;

export default function KicksBansPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("kicks");
  const [filters] = useState<Record<string, unknown>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [appealMonths, setAppealMonths] = useState<Record<string, number>>({});

  const actionType = activeTab === "kicks" ? "KICK" : "BAN";
  const queryFilters = { ...filters, actionType };

  const { data, isLoading, error } = useQuery({
    queryKey: ["moderation-actions", queryFilters],
    queryFn: () => apiClient.getModerationActions(queryFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const actions = (data?.actions || []).filter((action: { actionType: string }) => action.actionType === actionType);

  const filteredActions = searchTerm
    ? actions.filter((action: { memberUsername?: string; memberId: string; staffUsername?: string; staffId: string; reason: string }) => {
        const memberName = (action.memberUsername || action.memberId).toLowerCase();
        const staffName = (action.staffUsername || action.staffId).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return (
          memberName.includes(searchLower) ||
          staffName.includes(searchLower) ||
          action.memberId.toLowerCase().includes(searchLower) ||
          action.staffId.toLowerCase().includes(searchLower) ||
          action.reason.toLowerCase().includes(searchLower)
        );
      })
    : actions;

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

  const sortedActions = [...filteredActions].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: string | number | null | undefined;
    let bValue: string | number | null | undefined;
    switch (sortField) {
      case "memberUsername":
        aValue = a.memberUsername || a.memberId;
        bValue = b.memberUsername || b.memberId;
        break;
      case "staffUsername":
        aValue = a.staffUsername || a.staffId;
        bValue = b.staffUsername || b.staffId;
        break;
      case "reason":
        aValue = a.reason;
        bValue = b.reason;
        break;
      case "when":
        aValue = new Date(a.when).getTime();
        bValue = new Date(b.when).getTime();
        break;
      case "duration":
        aValue = a.duration || "";
        bValue = b.duration || "";
        break;
      case "appealIn":
        aValue = appealMonths[a.id] || 12;
        bValue = appealMonths[b.id] || 12;
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
      return <ArrowUpDown className="h-3 w-3 text-gray-400 dark:text-gray-500" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    }
    return <ArrowUpDown className="h-3 w-3 text-gray-400 dark:text-gray-500" />;
  };

  const handleAppealMonthsChange = (actionId: string, months: number): void => {
    setAppealMonths((prev) => ({ ...prev, [actionId]: months }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6 dark:bg-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Kicks and Bans</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage kicks and bans</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => setActiveTab("kicks")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "kicks"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <UserX className="h-4 w-4" />
            Kicks
          </div>
        </button>
        <button
          onClick={() => setActiveTab("bans")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "bans"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Ban className="h-4 w-4" />
            Bans
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by member, staff, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions List */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Ban className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400">Failed to load {activeTab}</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Ban className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400">No {activeTab} found</p>
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
                      onClick={() => handleSort("memberUsername")}
                    >
                      <div className="flex items-center gap-1">
                        Member
                        {getSortIcon("memberUsername")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("staffUsername")}
                    >
                      <div className="flex items-center gap-1">
                        Staff
                        {getSortIcon("staffUsername")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("reason")}
                    >
                      <div className="flex items-center gap-1">
                        Reason
                        {getSortIcon("reason")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("when")}
                    >
                      <div className="flex items-center gap-1">
                        When
                        {getSortIcon("when")}
                      </div>
                    </th>
                    {activeTab === "bans" && (
                      <>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                          onClick={() => handleSort("appealIn")}
                        >
                          <div className="flex items-center gap-1">
                            Appeal In
                            {getSortIcon("appealIn")}
                          </div>
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {sortedActions.map(
                    (action: {
                      id: string;
                      memberId: string;
                      memberUsername?: string;
                      memberDisplayName?: string | null;
                      memberDiscordId?: string | null;
                      staffId: string;
                      staffUsername?: string;
                      staffDisplayName?: string | null;
                      reason: string;
                      when: string;
                      duration: string | null;
                    }) => (
                      <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          <UsernameDisplay
                            discordId={(action as { memberDiscordId?: string | null }).memberDiscordId || action.memberId}
                            username={action.memberUsername || action.memberId}
                            displayName={(action as { memberDisplayName?: string | null }).memberDisplayName}
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <UsernameDisplay
                            discordId={action.staffId}
                            username={action.staffUsername || action.staffId}
                            displayName={(action as { staffDisplayName?: string | null }).staffDisplayName}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-900 dark:text-white">{action.reason}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(action.when), "MMM d, yyyy HH:mm")}
                        </td>
                        {activeTab === "bans" && (
                          <td className="whitespace-nowrap px-6 py-4">
                            <select
                              value={appealMonths[action.id] || 12}
                              onChange={(e) => handleAppealMonthsChange(action.id, parseInt(e.target.value, 10))}
                              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <option key={month} value={month}>
                                  {month} {month === 1 ? "month" : "months"}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedActions.map(
                  (
                    action: {
                      id: string;
                      memberId: string;
                      memberUsername?: string;
                      memberDisplayName?: string | null;
                      memberDiscordId?: string | null;
                      staffId: string;
                      staffUsername?: string;
                      staffDisplayName?: string | null;
                      reason: string;
                      when: string;
                      duration: string | null;
                    },
                    index: number
                  ) => (
                    <div key={action.id} className={`p-4 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Member:</h3>
                              <div className="mt-1">
                                <UsernameDisplay
                                  discordId={(action as { memberDiscordId?: string | null }).memberDiscordId || action.memberId}
                                  username={action.memberUsername || action.memberId}
                                  displayName={(action as { memberDisplayName?: string | null }).memberDisplayName}
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Staff:</p>
                              <div className="mt-1">
                                <UsernameDisplay
                                  discordId={action.staffId}
                                  username={action.staffUsername || action.staffId}
                                  displayName={(action as { staffDisplayName?: string | null }).staffDisplayName}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span>
                            <p className="mt-1 text-gray-900 dark:text-white">{action.reason}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">When:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{format(new Date(action.when), "MMM d, yyyy HH:mm")}</span>
                          </div>
                          {activeTab === "bans" && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Appeal In:</span>
                              <select
                                value={appealMonths[action.id] || 12}
                                onChange={(e) => handleAppealMonthsChange(action.id, parseInt(e.target.value, 10))}
                                className="ml-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                  <option key={month} value={month}>
                                    {month} {month === 1 ? "month" : "months"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {data && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedActions.length} of {data.total || 0} {activeTab}
        </div>
      )}
    </div>
  );
}
