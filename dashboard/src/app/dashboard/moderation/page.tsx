"use client";

import { UsernameDisplay } from "@/components/common/UsernameDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Shield } from "lucide-react";
import { useState } from "react";

type SortField = "memberUsername" | "staffUsername" | "actionType" | "reason" | "when" | "duration" | "isActive";
type SortDirection = "asc" | "desc" | null;

export default function ModerationLogsPage(): JSX.Element {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);

  // Build filters for API calls
  const apiFilters: Record<string, unknown> = {};
  if (filters.actionType) {
    apiFilters.actionType = filters.actionType;
  }
  if (filters.isActive !== undefined) {
    apiFilters.isActive = filters.isActive;
  }
  if (filters.memberId) {
    apiFilters.memberId = filters.memberId;
  }
  if (filters.staffId) {
    apiFilters.staffId = filters.staffId;
  }

  // Fetch both moderation actions and warnings
  const {
    data: actionsData,
    isLoading: actionsLoading,
    error: actionsError,
  } = useQuery({
    queryKey: ["moderation-actions", apiFilters],
    queryFn: () => apiClient.getModerationActions(apiFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // For warnings, map actionType to type and staffId to loggedBy
  const warningFilters: Record<string, unknown> = {};
  if (filters.memberId) {
    warningFilters.memberId = filters.memberId;
  }
  if (filters.staffId) {
    warningFilters.loggedBy = filters.staffId;
  }
  if (filters.isActive !== undefined) {
    warningFilters.isActive = filters.isActive;
  }
  // Map actionType filter to warning type
  if (filters.actionType === "INFORMAL_WARNING_ISSUED") {
    warningFilters.type = "INFORMAL_WARNING";
  } else if (filters.actionType === "WATCHLIST_ADDED") {
    warningFilters.type = "WATCHLIST";
  }

  const {
    data: warningsData,
    isLoading: warningsLoading,
    error: warningsError,
  } = useQuery({
    queryKey: ["warnings", warningFilters],
    queryFn: () => apiClient.getWarnings(warningFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const isLoading = actionsLoading || warningsLoading;
  const error = actionsError || warningsError;

  // Filter actions to only show: WATCHLIST_ADDED, TIMEOUT, INFORMAL_WARNING_ISSUED
  const allowedActionTypes = ["WATCHLIST_ADDED", "TIMEOUT", "INFORMAL_WARNING_ISSUED"];
  let filteredModerationActions = (actionsData?.actions || []).filter((action: { actionType: string }) =>
    allowedActionTypes.includes(action.actionType)
  );

  // Apply actionType filter if set
  if (filters.actionType) {
    filteredModerationActions = filteredModerationActions.filter(
      (action: { actionType: string }) => action.actionType === filters.actionType
    );
  }

  // Convert warnings to moderation action format for consistency
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
    loggedByUsername?: string;
  }

  const warnings = (warningsData?.warnings || []) as Warning[];
  let warningsAsActions = warnings
    .filter((warning) => {
      // Only include INFORMAL_WARNING and WATCHLIST from warnings
      return warning.type === "INFORMAL_WARNING" || warning.type === "WATCHLIST";
    })
    .map((warning) => ({
      id: warning.id,
      memberId: warning.memberId,
      memberUsername: warning.member?.discordTag || warning.memberId,
      memberDiscordId: warning.member?.discordId || null, // Add Discord ID for ProfileCard
      staffId: warning.loggedBy,
      staffUsername: warning.loggedByUsername || warning.loggedBy,
      actionType: warning.type === "INFORMAL_WARNING" ? "INFORMAL_WARNING_ISSUED" : "WATCHLIST_ADDED",
      reason: warning.why,
      when: warning.when,
      duration: null,
      isActive: warning.isActive,
    }));

  // Apply actionType filter to warnings if set
  if (filters.actionType) {
    warningsAsActions = warningsAsActions.filter((action: { actionType: string }) => action.actionType === filters.actionType);
  }

  // Combine actions and warnings
  const actions = [...filteredModerationActions, ...warningsAsActions];
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
    let aValue: string | number | boolean | null | undefined;
    let bValue: string | number | boolean | null | undefined;
    switch (sortField) {
      case "memberUsername":
        aValue = a.memberUsername || a.memberId;
        bValue = b.memberUsername || b.memberId;
        break;
      case "staffUsername":
        aValue = a.staffUsername || a.staffId;
        bValue = b.staffUsername || b.staffId;
        break;
      case "actionType":
        aValue = a.actionType;
        bValue = b.actionType;
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
      case "isActive":
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
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

  const getActionTypeColor = (type: string): string => {
    if (type.includes("BAN") || type.includes("KICK")) {
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    }
    if (type.includes("INFORMAL_WARNING")) {
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    }
    if (type.includes("TIMEOUT")) {
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    }
    if (type.includes("WATCHLIST")) {
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    }
    if (type.includes("VERIFICATION")) {
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Moderation Logs</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View all moderation actions taken by staff</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by member ID, staff ID, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={(filters.actionType as string) || ""}
            onChange={(e) => setFilters({ ...filters, actionType: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="INFORMAL_WARNING_ISSUED">Informal Warning</option>
            <option value="TIMEOUT">Timeout</option>
            <option value="WATCHLIST_ADDED">Watchlist</option>
          </select>
          <select
            value={(filters.isActive as string) || ""}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member ID</label>
            <input
              type="text"
              value={(filters.memberId as string) || ""}
              onChange={(e) => setFilters({ ...filters, memberId: e.target.value || undefined })}
              placeholder="Member Discord ID"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff ID</label>
            <input
              type="text"
              value={(filters.staffId as string) || ""}
              onChange={(e) => setFilters({ ...filters, staffId: e.target.value || undefined })}
              placeholder="Staff Discord ID"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">Error loading moderation logs. Please try again.</p>
        </div>
      )}

      {/* Moderation Actions List */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : filteredActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400">No moderation actions found</p>
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
                      onClick={() => handleSort("actionType")}
                    >
                      <div className="flex items-center gap-1">
                        Action
                        {getSortIcon("actionType")}
                      </div>
                    </th>
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
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("duration")}
                    >
                      <div className="flex items-center gap-1">
                        Duration
                        {getSortIcon("duration")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort("isActive")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {getSortIcon("isActive")}
                      </div>
                    </th>
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
                      actionType: string;
                      reason: string;
                      when: string;
                      duration: string | null;
                      isActive: boolean;
                    }) => (
                      <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionTypeColor(action.actionType)}`}
                          >
                            {action.actionType === "INFORMAL_WARNING_ISSUED"
                              ? "Informal Warning"
                              : action.actionType === "WATCHLIST_ADDED"
                              ? "Watchlist"
                              : action.actionType.replace(/_/g, " ")}
                          </span>
                        </td>
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
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {action.duration ? (
                            <span
                              title={(() => {
                                if (!action.duration || action.actionType !== "TIMEOUT") return "";
                                // Parse duration (e.g., "7 days", "2 weeks", "1 month")
                                const durationMatch = action.duration.match(
                                  /(\d+)\s*(day|days|week|weeks|month|months|hour|hours|minute|minutes)/i
                                );
                                if (!durationMatch) return "";
                                const amount = parseInt(durationMatch[1], 10);
                                const unit = durationMatch[2].toLowerCase();
                                const whenDate = new Date(action.when);
                                const endDate = new Date(whenDate);

                                if (unit.includes("minute")) {
                                  endDate.setMinutes(endDate.getMinutes() + amount);
                                } else if (unit.includes("hour")) {
                                  endDate.setHours(endDate.getHours() + amount);
                                } else if (unit.includes("day")) {
                                  endDate.setDate(endDate.getDate() + amount);
                                } else if (unit.includes("week")) {
                                  endDate.setDate(endDate.getDate() + amount * 7);
                                } else if (unit.includes("month")) {
                                  endDate.setMonth(endDate.getMonth() + amount);
                                }

                                return `Ends: ${format(endDate, "MMM d, yyyy HH:mm")}`;
                              })()}
                              className="cursor-help"
                            >
                              {action.duration}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              action.isActive
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {action.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
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
                      actionType: string;
                      reason: string;
                      when: string;
                      duration: string | null;
                      isActive: boolean;
                    },
                    index: number
                  ) => (
                    <div key={action.id} className={`p-4 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${getActionTypeColor(
                                action.actionType
                              )}`}
                            >
                              {action.actionType === "INFORMAL_WARNING_ISSUED"
                                ? "Informal Warning"
                                : action.actionType === "WATCHLIST_ADDED"
                                ? "Watchlist"
                                : action.actionType.replace(/_/g, " ")}
                            </span>
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Member:</p>
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
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">When:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {format(new Date(action.when), "MMM d, yyyy HH:mm")}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                              {action.duration ? (
                                <span
                                  title={(() => {
                                    if (!action.duration || action.actionType !== "TIMEOUT") return "";
                                    const durationMatch = action.duration.match(
                                      /(\d+)\s*(day|days|week|weeks|month|months|hour|hours|minute|minutes)/i
                                    );
                                    if (!durationMatch) return "";
                                    const amount = parseInt(durationMatch[1], 10);
                                    const unit = durationMatch[2].toLowerCase();
                                    const whenDate = new Date(action.when);
                                    const endDate = new Date(whenDate);

                                    if (unit.includes("minute")) {
                                      endDate.setMinutes(endDate.getMinutes() + amount);
                                    } else if (unit.includes("hour")) {
                                      endDate.setHours(endDate.getHours() + amount);
                                    } else if (unit.includes("day")) {
                                      endDate.setDate(endDate.getDate() + amount);
                                    } else if (unit.includes("week")) {
                                      endDate.setDate(endDate.getDate() + amount * 7);
                                    } else if (unit.includes("month")) {
                                      endDate.setMonth(endDate.getMonth() + amount);
                                    }

                                    return `Ends: ${format(endDate, "MMM d, yyyy HH:mm")}`;
                                  })()}
                                  className="ml-2 text-gray-900 dark:text-white cursor-help"
                                >
                                  {action.duration}
                                </span>
                              ) : (
                                <span className="ml-2 text-gray-900 dark:text-white">-</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                              <span
                                className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  action.isActive
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {action.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
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

      {(actionsData || warningsData) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedActions.length} of {actions.length} moderation logs
        </div>
      )}
    </div>
  );
}
