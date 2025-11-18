'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard,
  Ticket,
  Shield,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
  { name: 'Verifications', href: '/dashboard/verifications', icon: Shield },
  { name: 'Warnings', href: '/dashboard/warnings', icon: FileText },
  { name: 'Moderation Logs', href: '/dashboard/moderation', icon: Users },
  { name: 'Mod on Call', href: '/dashboard/mod-on-call', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <h1 className="text-xl font-bold">Ticket Bot</h1>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          {session?.user && (
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-800">
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
                <p className="truncate text-sm font-medium text-white">
                  {session.user.username}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {session.user.discriminator !== '0' ? `#${session.user.discriminator}` : ''}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

