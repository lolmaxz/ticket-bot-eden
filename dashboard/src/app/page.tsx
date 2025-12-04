'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Ticket, Shield, Users, BarChart3, Settings, ExternalLink, ChevronDown, Github, Moon, Sun, Menu, X, Power } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

// Simple Discord icon component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [externalLinksOpen, setExternalLinksOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRefDesktop = useRef<HTMLButtonElement>(null);
  const userMenuButtonRefMobile = useRef<HTMLButtonElement>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (userMenuOpen && mounted) {
      const buttonRef = window.innerWidth >= 768 ? userMenuButtonRefDesktop.current : userMenuButtonRefMobile.current;
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
        setUserMenuPosition({
          top: rect.bottom + 8, // 8px = mt-2 equivalent
          right: window.innerWidth - rect.right,
        });
      }
    } else {
      setUserMenuPosition(null);
    }
  }, [userMenuOpen, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const element = target as Element;
      
      // Don't close if clicking on navbar buttons or links
      if (element.closest('nav button, nav a')) {
        return;
      }
      
      // Check external links dropdown
      if (externalLinksOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setExternalLinksOpen(false);
      }
      
      // Check user menu dropdown - only close if click is outside both button and dropdown
      if (userMenuOpen) {
        const clickedInsideButton = userMenuRef.current?.contains(target);
        const clickedInsideDropdown = userMenuDropdownRef.current?.contains(target);
        
        if (!clickedInsideButton && !clickedInsideDropdown) {
          setUserMenuOpen(false);
        }
      }
    }

    if (externalLinksOpen || userMenuOpen) {
      // Use click event instead of mousedown, and add a small delay
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
    
    // Return undefined if no cleanup needed
    return undefined;
  }, [externalLinksOpen, userMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950 dark:to-indigo-950 relative">
      {/* Animated background grid - subtle */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(cyan 1px, transparent 1px),
            linear-gradient(90deg, cyan 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-purple-200 dark:border-cyan-500/20 bg-white/80 dark:bg-black/40 backdrop-blur-md" style={{ pointerEvents: 'auto', position: 'sticky' }}>
        <div className="container mx-auto px-4 py-4 relative" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
          <div className="flex items-center justify-between gap-4 relative" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
            <div className="flex items-center space-x-2 min-w-0 flex-shrink" style={{ position: 'relative', zIndex: 100 }}>
              {/* Mobile Menu Button - Left side */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Toggle menu"
                type="button"
                style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Ticket className="w-6 h-6 text-purple-600 dark:text-cyan-400 flex-shrink-0 hidden lg:block" />
              <span className="text-lg md:text-xl font-bold text-purple-700 dark:text-cyan-300 truncate">Eden Ticket Portal</span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-shrink-0 min-w-0" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
              <Link href="/" className="text-purple-700 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 transition-colors py-2 px-1 block" style={{ position: 'relative', zIndex: 100 }}>
                Home
              </Link>
              <Link href="#" className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors py-2 px-1 block" style={{ position: 'relative', zIndex: 100 }}>
                Changelog
              </Link>
              <Link href="#" className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors py-2 px-1 block" style={{ position: 'relative', zIndex: 100 }}>
                Documentation
              </Link>
              <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExternalLinksOpen(!externalLinksOpen);
                  }}
                  className="flex items-center text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors py-2 px-1"
                  type="button"
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}
                >
                  External Links
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${externalLinksOpen ? 'rotate-180' : ''}`} />
                </button>
                {externalLinksOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="https://discord.gg/theedenapis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 dark:text-cyan-300 hover:bg-gray-100 dark:hover:bg-cyan-500/10 hover:text-gray-900 dark:hover:text-cyan-200"
                      onClick={() => setExternalLinksOpen(false)}
                    >
                      Discord Server
                    </Link>
                    <Link
                      href="https://theedenapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 dark:text-cyan-300 hover:bg-gray-100 dark:hover:bg-cyan-500/10 hover:text-gray-900 dark:hover:text-cyan-200"
                      onClick={() => setExternalLinksOpen(false)}
                    >
                      Website
                    </Link>
                  </div>
                )}
              </div>
              <Link href="#" className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors py-2 px-1 block" style={{ position: 'relative', zIndex: 100 }}>
                Support
              </Link>
              <Link href="#" className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors py-2 px-1 block" style={{ position: 'relative', zIndex: 100 }}>
                Invite
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="p-2 rounded-lg text-gray-600 dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer"
                aria-label="Toggle theme"
                type="button"
                style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 pointer-events-none" /> : <Moon className="w-5 h-5 pointer-events-none" />}
              </button>
              {/* User Profile Dropdown - Desktop */}
              {isAuthenticated && session?.user && (
                <div className="relative flex-shrink-0" ref={userMenuRef} style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
                  <button
                    ref={userMenuButtonRefDesktop}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    type="button"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {session.user.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                        alt={session.user.username || 'User'}
                        className="h-8 w-8 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple-600 dark:bg-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {(session.user.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-purple-300 hidden lg:inline truncate max-w-[120px]">
                      {session.user.username}
                      {session.user.discriminator && session.user.discriminator !== '0' ? `#${session.user.discriminator}` : ''}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-purple-300 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && userMenuPosition && mounted && createPortal(
                    <div 
                      ref={userMenuDropdownRef}
                      className="fixed w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-lg shadow-lg z-[9999] pointer-events-auto"
                      style={{
                        top: `${userMenuPosition.top}px`,
                        right: `${userMenuPosition.right}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Logout button clicked');
                          signOut({ callbackUrl: '/' });
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        type="button"
                      >
                        <Power className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              )}
            </div>
            {/* Mobile User Info - Top Right */}
            {isAuthenticated && session?.user && (
              <div className="md:hidden relative flex-shrink-0" ref={userMenuRef} style={{ position: 'relative', zIndex: 100 }}>
                <button
                  ref={userMenuButtonRefMobile}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  type="button"
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}
                >
                  {session.user.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                      alt={session.user.username || 'User'}
                      className="h-8 w-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-600 dark:bg-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {(session.user.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-purple-300 truncate max-w-[100px]">
                    {session.user.username}
                    {session.user.discriminator && session.user.discriminator !== '0' ? `#${session.user.discriminator}` : ''}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-purple-300 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && userMenuPosition && mounted && createPortal(
                  <div 
                    ref={userMenuDropdownRef}
                    className="fixed w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-lg shadow-lg z-[9999] pointer-events-auto"
                    style={{
                      top: `${userMenuPosition.top}px`,
                      right: `${userMenuPosition.right}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Logout button clicked');
                        signOut({ callbackUrl: '/' });
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      type="button"
                    >
                      <Power className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-purple-200 dark:border-cyan-500/20 pt-4">
              <div className="flex flex-col space-y-3">
                {/* Theme Toggle at top of mobile menu */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="flex items-center justify-between text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  type="button"
                >
                  <span>Theme</span>
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="border-t border-purple-200 dark:border-cyan-500/20 my-2"></div>
                <Link 
                  href="/" 
                  className="text-purple-700 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Changelog
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documentation
                </Link>
                <Link 
                  href="https://discord.gg/theedenapis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Discord Server
                </Link>
                <Link 
                  href="https://theedenapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Website
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-600 dark:text-purple-300 hover:text-gray-800 dark:hover:text-purple-200 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Invite
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-purple-700 dark:text-purple-300" style={{ 
              textShadow: theme === 'dark' ? '0 0 8px rgba(168, 85, 247, 0.3)' : 'none'
            }}>
              Eden Ticket Portal
            </h1>
            <p className="text-xl text-purple-600 dark:text-cyan-300 mb-2">
              Exclusively made for The Eden Apis Discord Server
            </p>
            <p className="text-lg text-gray-700 dark:text-purple-200 mb-8 max-w-2xl mx-auto">
              Streamline your community support, enhance team collaboration, and deliver exceptional member experiences with our comprehensive ticketing solution.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="#"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-300 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-purple-200 dark:border-purple-700"
            >
              <DiscordIcon className="w-5 h-5 mr-2" />
              Add to Server
            </Link>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-white"
                style={{ 
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                  boxShadow: theme === 'dark' 
                    ? '0 0 10px rgba(168, 85, 247, 0.4), 0 0 20px rgba(236, 72, 153, 0.2)'
                    : '0 0 8px rgba(124, 58, 237, 0.3)'
                }}
              >
                <Settings className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="inline-flex items-center px-8 py-4 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-white"
                style={{ 
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                  boxShadow: theme === 'dark' 
                    ? '0 0 10px rgba(168, 85, 247, 0.4), 0 0 20px rgba(236, 72, 153, 0.2)'
                    : '0 0 8px rgba(124, 58, 237, 0.3)'
                }}
              >
                <Settings className="w-5 h-5 mr-2" />
                Dashboard
              </button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-cyan-500/20 hover:border-purple-300 dark:hover:border-cyan-400/30 transition-all shadow-md hover:shadow-lg">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Ticket className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-cyan-300 mb-2">Ticket Management</h3>
              <p className="text-gray-600 dark:text-purple-200 text-sm">
                Track and manage all support tickets efficiently
              </p>
            </div>

            <div className="p-6 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-pink-500/20 hover:border-purple-300 dark:hover:border-pink-400/30 transition-all shadow-md hover:shadow-lg">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-300 mb-2">Verification System</h3>
              <p className="text-gray-600 dark:text-purple-200 text-sm">
                Streamline ID verification workflows
              </p>
            </div>

            <div className="p-6 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/30 transition-all shadow-md hover:shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-300 mb-2">Analytics & Insights</h3>
              <p className="text-gray-600 dark:text-purple-200 text-sm">
                Get detailed insights into your server activity
              </p>
            </div>
          </div>

          {/* Why Eden Ticket Portal Section */}
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-500/20 p-8 mb-16 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-purple-300 mb-4">Why Eden Ticket Portal?</h2>
            <p className="text-gray-700 dark:text-purple-200 mb-8">
              Trusted by The Eden Apis community, Eden Ticket Portal makes providing support to your users simple and efficient.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-cyan-300 mb-2">Feature Rich</h3>
                <p className="text-gray-600 dark:text-purple-200 text-sm">
                  We are always innovating and creating new features exclusive to Eden Ticket Portal to extend the benefits gained from using the service.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-300 mb-2">Bleeding Edge</h3>
                <p className="text-gray-600 dark:text-purple-200 text-sm">
                  Eden Ticket Portal is always the first bot to make use of new Discord features, ensuring you have the latest tools at your disposal.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-300 mb-2">Reliable</h3>
                <p className="text-gray-600 dark:text-purple-200 text-sm">
                  Eden Ticket Portal is built with redundancy and scalability as a core competency, designed to run for months on end with zero downtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-100 dark:bg-black/80 border-t border-purple-200 dark:border-cyan-500/20 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {/* Left Column - Navigation */}
            <div>
              <h3 className="text-purple-700 dark:text-cyan-300 font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Column - Info */}
            <div>
              <h3 className="text-purple-700 dark:text-cyan-300 font-semibold mb-4">Eden Ticket Portal</h3>
              <p className="text-gray-700 dark:text-purple-200 mb-4">
                Developed exclusively for the staff of{' '}
                <a
                  href="https://discord.gg/theedenapis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 hover:underline"
                >
                  The Eden Apis
                </a>{' '}
                Discord Server
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <a
                  href="https://discord.gg/theedenapis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 transition-colors"
                  aria-label="Discord Server"
                >
                  <DiscordIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://theedenapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 transition-colors"
                  aria-label="Website"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-purple-200 dark:border-cyan-500/20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-700 dark:text-purple-300 text-sm mb-4 md:mb-0">
                © 2025{' '}
                <a
                  href="https://lolmaxz.theedenapis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-cyan-300 hover:text-purple-800 dark:hover:text-cyan-200 hover:underline"
                >
                  lolmaxz
                </a>
                . Website made for The Eden Apis. All rights reserved.
              </p>
              <p className="text-gray-700 dark:text-purple-300 text-sm text-center md:text-right">
                Eden Ticket Portal - Exclusively for The Eden Apis Discord Server
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
