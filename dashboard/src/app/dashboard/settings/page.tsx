'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { User, Bell, Shield, Database, Info, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage(): JSX.Element {
  const { data: session } = useSession();
  const [emailRevealed, setEmailRevealed] = useState(false);

  const censorEmail = (email: string | null | undefined): string => {
    if (!email) return 'Not available';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    const censoredLocal = localPart.length > 2 
      ? `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 2, 3))}${localPart[localPart.length - 1]}`
      : localPart.length > 1
      ? `${localPart[0]}*`
      : '*';
    
    const [domainName, ...domainParts] = domain.split('.');
    const censoredDomain = domainName.length > 2
      ? `${domainName[0]}${'*'.repeat(Math.min(domainName.length - 2, 3))}${domainName[domainName.length - 1]}`
      : domainName.length > 1
      ? `${domainName[0]}*`
      : '*';
    
    const fullDomain = domainParts.length > 0 
      ? `${censoredDomain}.${domainParts.join('.')}`
      : censoredDomain;
    
    return `${censoredLocal}@${fullDomain}`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your account and application settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Settings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Discord Username</label>
              <p className="mt-1 text-sm text-gray-900">
                {session?.user?.username || 'Not available'}
                {session?.user?.discriminator && session.user.discriminator !== '0'
                  ? `#${session.user.discriminator}`
                  : ''}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discord ID</label>
              <p className="mt-1 text-sm text-gray-900">{session?.user?.discordId || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center space-x-2">
                <p className="text-sm text-gray-900">
                  {emailRevealed 
                    ? (session?.user?.email || 'Not available')
                    : censorEmail(session?.user?.email)
                  }
                </p>
                {session?.user?.email && (
                  <button
                    onClick={() => setEmailRevealed(!emailRevealed)}
                    className="rounded p-1 text-gray-500 transition-colors hover:text-gray-700"
                    type="button"
                    aria-label={emailRevealed ? 'Hide email' : 'Reveal email'}
                  >
                    {emailRevealed ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive email updates about tickets</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Ticket Alerts</label>
                <p className="text-xs text-gray-500">Get notified of new tickets</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Authentication Method</label>
              <p className="mt-1 text-sm text-gray-900">Discord OAuth2</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Session Duration</label>
              <p className="mt-1 text-sm text-gray-900">30 days</p>
            </div>
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Change Password
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Info className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">API URL</label>
              <p className="mt-1 text-sm text-gray-900">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <p className="mt-1 text-sm text-gray-900">
                {process.env.NODE_ENV || 'development'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <p className="mt-1 text-sm text-gray-900">1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Database Status</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm font-medium text-green-900">Connection</p>
            <p className="mt-1 text-2xl font-bold text-green-900">Active</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">Provider</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">MySQL</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm font-medium text-purple-900">Status</p>
            <p className="mt-1 text-2xl font-bold text-purple-900">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

