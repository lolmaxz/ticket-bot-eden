"use client";

import { apiClient } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { Clock, Shield, Ticket, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPanelPage(): JSX.Element {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  // Check admin access with React Query caching (5 minute stale time, 10 minute cache time)
  const { data: adminAccessData, isLoading: accessLoading } = useQuery({
    queryKey: ["admin-access", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/admin/check-access");
      if (!response.ok) return { hasAccess: false };
      return response.json() as Promise<{ hasAccess: boolean }>;
    },
    enabled: status === "authenticated",
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes
    retry: false,
  });

  const hasAccess = adminAccessData?.hasAccess ?? false;

  // Redirect if access is denied
  useEffect(() => {
    if (status === "loading" || accessLoading) return;

    if (status === "authenticated" && !hasAccess) {
      router.push("/dashboard");
    }
  }, [status, hasAccess, accessLoading, router]);

  // Fetch analytics
  const { data: ticketAnalytics, isLoading: ticketsLoading } = useQuery({
    queryKey: ["admin-ticket-analytics", period],
    queryFn: () => apiClient.getAdminTicketAnalytics(period),
    enabled: hasAccess === true,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const { data: staffAnalytics, isLoading: staffLoading } = useQuery({
    queryKey: ["admin-staff-analytics", period],
    queryFn: () => apiClient.getAdminStaffAnalytics(period),
    enabled: hasAccess === true,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const { data: verificationAnalytics, isLoading: verificationLoading } = useQuery({
    queryKey: ["admin-verification-analytics", period],
    queryFn: () => apiClient.getAdminVerificationAnalytics(period),
    enabled: hasAccess === true,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (accessLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="text-center max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You do not have permission to access this page.</p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Debugging Information:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Please check your browser console for detailed logs about why access was denied.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Required: Server ID <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">734595073920204940</code> and one of these
              roles: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">735696916255604776</code> or{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">1114379479381442650</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const ticketData = ticketAnalytics;
  const staffData = staffAnalytics;
  const verificationData = verificationAnalytics;

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6 dark:bg-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Analytics and insights for ticket management</p>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2 rounded-lg bg-white dark:bg-gray-800 p-2 shadow">
        <button
          onClick={() => setPeriod("day")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            period === "day"
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Last 24 Hours
        </button>
        <button
          onClick={() => setPeriod("week")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            period === "week"
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            period === "month"
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Last 30 Days
        </button>
      </div>

      {/* Ticket Analytics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Ticket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ticketsLoading ? "..." : ticketData?.totalTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ticketsLoading ? "..." : ticketData?.closedTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ticketsLoading ? "..." : ticketData?.openTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Close</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ticketsLoading ? "..." : ticketData?.avgTimeToCloseHours ? `${Math.round(ticketData.avgTimeToCloseHours)}h` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Analytics */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Staff Activity</h2>
        {staffLoading ? (
          <LoadingSpinner size="lg" />
        ) : staffData?.staffStats && staffData.staffStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Closures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Participations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {staffData.staffStats.map(
                  (staff: {
                    staffId: string;
                    username: string;
                    assignments: number;
                    closures: number;
                    participations: number;
                    totalActivity: number;
                  }) => (
                    <tr key={staff.staffId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{staff.username}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{staff.assignments}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{staff.closures}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{staff.participations}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{staff.totalActivity}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No staff activity data available</p>
        )}
      </div>

      {/* Verification Analytics */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Verification Activity</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Verifications</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {verificationLoading ? "..." : verificationData?.totalVerifications || 0}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {verificationLoading ? "..." : verificationData?.completedVerifications || 0}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {verificationLoading ? "..." : verificationData?.openVerifications || 0}
            </p>
          </div>
        </div>
        {verificationLoading ? (
          <LoadingSpinner size="lg" />
        ) : verificationData?.verifierStats && verificationData.verifierStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Verifier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Initial Verifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Final Verifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {verificationData.verifierStats.map(
                  (verifier: {
                    staffId: string;
                    username: string;
                    initialVerifications: number;
                    finalVerifications: number;
                    totalVerifications: number;
                  }) => (
                    <tr key={verifier.staffId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{verifier.username}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {verifier.initialVerifications}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {verifier.finalVerifications}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {verifier.totalVerifications}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No verification activity data available</p>
        )}
      </div>
    </div>
  );
}
