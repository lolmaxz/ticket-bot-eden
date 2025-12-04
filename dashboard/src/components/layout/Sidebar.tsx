"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, BarChart3, FileText, LayoutDashboard, Lock, LogOut, Settings, Shield, Ticket, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  { name: "Verifications", href: "/dashboard/verifications", icon: Shield },
  { name: "Moderation Logs", href: "/dashboard/moderation", icon: FileText },
  { name: "Kicks and Bans", href: "/dashboard/kicks-bans", icon: Ban },
  { name: "Mod on Call", href: "/dashboard/mod-on-call", icon: BarChart3 },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ isMobileOpen: externalIsMobileOpen, setIsMobileOpen: externalSetIsMobileOpen }: SidebarProps = {}): JSX.Element {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [internalIsMobileOpen, setInternalIsMobileOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isMobileOpen = externalIsMobileOpen !== undefined ? externalIsMobileOpen : internalIsMobileOpen;
  const setIsMobileOpen = externalSetIsMobileOpen || setInternalIsMobileOpen;

  // Check admin access with React Query caching (5 minute stale time, 10 minute cache time)
  const { data: adminAccessData } = useQuery({
    queryKey: ["admin-access", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/admin/check-access");
      if (!response.ok) return { hasAccess: false };
      return response.json() as Promise<{ hasAccess: boolean }>;
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes
    retry: false,
  });

  const hasAdminAccess = adminAccessData?.hasAccess ?? false;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 dark:bg-opacity-70 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gray-900 dark:bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 dark:border-gray-700 border-cyan-500/20 dark:border-cyan-500/30 px-4">
          <h1 className="text-xl font-bold text-cyan-300 neon-text" style={{ color: '#67e8f9' }}>Eden Ticket Portal</h1>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-gray-300 hover:text-cyan-300 transition-colors" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navigation.map((item) => {
            // For Dashboard, only match exact path. For others, match exact or sub-paths
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-600/20 dark:bg-purple-600/30 text-cyan-300 border border-cyan-500/30 neon-border"
                    : "text-gray-300 hover:bg-purple-600/10 dark:hover:bg-purple-600/20 hover:text-cyan-200"
                }`}
                style={isActive ? { color: '#67e8f9' } : {}}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 dark:border-gray-700 p-4">
          {session?.user && (
            <div className="mb-4 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-800 dark:bg-gray-700">
                  {session.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                      alt={session.user.username}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-white">{session.user.username}</p>
                  <p className="truncate text-xs text-gray-400">
                    {session.user.discriminator !== "0" ? `#${session.user.discriminator}` : ""}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setIsMobileOpen(false)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          )}
          {/* Admin Panel - anchored at the bottom, above Sign Out */}
          {hasAdminAccess === true && (
            <Link
              href="/dashboard/admin"
              onClick={() => setIsMobileOpen(false)}
              className={`mb-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/dashboard/admin" || pathname?.startsWith("/dashboard/admin/")
                  ? "bg-pink-600/30 dark:bg-pink-600/40 text-pink-300 border border-pink-500/40 neon-border"
                  : "text-pink-300/70 hover:bg-pink-600/20 dark:hover:bg-pink-600/30 hover:text-pink-200"
              }`}
              style={pathname === "/dashboard/admin" || pathname?.startsWith("/dashboard/admin/") ? { color: '#f9a8d4' } : {}}
            >
              <Lock className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Admin Panel</span>
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
