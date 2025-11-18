'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Header(): JSX.Element {
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Ticket Management</h2>
        </div>
        {session?.user && (
          <div className="flex items-center space-x-2 lg:space-x-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {session.user.username}
              {session.user.discriminator !== '0' ? `#${session.user.discriminator}` : ''}
            </span>
            {session.user.avatar && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 lg:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                  alt={session.user.username}
                  className="h-8 w-8 rounded-full"
                />
              </div>
            )}
          </div>
        )}
      </header>
      {/* Mobile Sidebar - only shown on mobile */}
      <div className="lg:hidden">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>
    </>
  );
}

