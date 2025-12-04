'use client';

import { useState } from 'react';
import { Menu, X, Moon, Sun, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { useTheme } from '@/components/providers/ThemeProvider';

export function Header(): JSX.Element {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="relative z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 dark:border-cyan-500/20 lg:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-cyan-300 dark:hover:bg-gray-700 dark:hover:text-cyan-200 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center space-x-2">
            <Ticket className="h-5 w-5 text-purple-600 dark:text-cyan-400" />
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-cyan-300">Eden Ticket Portal</h2>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {/* Mobile Sidebar - only shown on mobile */}
      <div className="lg:hidden">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>
    </>
  );
}

