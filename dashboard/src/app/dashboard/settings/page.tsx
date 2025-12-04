"use client";

import { useDateFormat } from "@/lib/use-date-format";
import { Bell, Clock, Database, Eye, EyeOff, Info, Shield, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function SettingsPage(): JSX.Element {
  const { data: session } = useSession();
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [dateFormat, setDateFormat] = useDateFormat();

  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newFormat = e.target.value as "absolute" | "relative";
    setDateFormat(newFormat);
  };

  const censorEmail = (email: string | null | undefined): string => {
    if (!email) return "Not available";
    const [localPart, domain] = email.split("@");
    if (!domain) return email;

    const censoredLocal =
      localPart.length > 2
        ? `${localPart[0]}${"*".repeat(Math.min(localPart.length - 2, 3))}${localPart[localPart.length - 1]}`
        : localPart.length > 1
        ? `${localPart[0]}*`
        : "*";

    const [domainName, ...domainParts] = domain.split(".");
    const censoredDomain =
      domainName.length > 2
        ? `${domainName[0]}${"*".repeat(Math.min(domainName.length - 2, 3))}${domainName[domainName.length - 1]}`
        : domainName.length > 1
        ? `${domainName[0]}*`
        : "*";

    const fullDomain = domainParts.length > 0 ? `${censoredDomain}.${domainParts.join(".")}` : censoredDomain;

    return `${censoredLocal}@${fullDomain}`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:space-y-6 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your account and application settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discord Username</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {session?.user?.username || "Not available"}
                {session?.user?.discriminator && session.user.discriminator !== "0" ? `#${session.user.discriminator}` : ""}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discord ID</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{session?.user?.discordId || "Not available"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="mt-1 flex items-center space-x-2">
                <p className="text-sm text-gray-900 dark:text-white">
                  {emailRevealed ? session?.user?.email || "Not available" : censorEmail(session?.user?.email)}
                </p>
                {session?.user?.email && (
                  <button
                    onClick={() => setEmailRevealed(!emailRevealed)}
                    className="rounded p-1 text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                    type="button"
                    aria-label={emailRevealed ? "Hide email" : "Reveal email"}
                  >
                    {emailRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Display</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Date Format</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Choose how ticket dates are displayed</p>
              </div>
              <select
                value={dateFormat}
                onChange={handleDateFormatChange}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="absolute">Absolute Date</option>
                <option value="relative">Relative Time (e.g., &quot;2h ago&quot;)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive email updates about tickets</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Alerts</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified of new tickets</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Authentication Method</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">Discord OAuth2</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session Duration</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">30 days</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API URL</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Environment</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{process.env.NODE_ENV || "development"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Version</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Status</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-green-50 dark:bg-green-900 p-4">
            <p className="text-sm font-medium text-green-900 dark:text-green-200">Connection</p>
            <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-200">Active</p>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900 p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Provider</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">MySQL</p>
          </div>
          <div className="rounded-lg bg-purple-50 dark:bg-purple-900 p-4">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Status</p>
            <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-200">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
