'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface TicketFiltersProps {
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
}

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps): JSX.Element {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: unknown): void => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = (): void => {
    setLocalFilters({});
    onFiltersChange({});
  };

  // Check if there are any active filters (excluding default limit)
  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => key !== 'limit' && localFilters[key] !== undefined && localFilters[key] !== ''
  );

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      {/* Mobile: Collapsed view with Add Filter button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>{isOpen ? 'Hide Filters' : 'Add Filter'}</span>
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                {Object.keys(localFilters).filter(
                  (key) => key !== 'limit' && localFilters[key] !== undefined && localFilters[key] !== ''
                ).length}
              </span>
            )}
          </div>
          {isOpen && <X className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={(localFilters.status as string) || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="AWAITING_RESPONSE">Awaiting Response</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={(localFilters.type as string) || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="VERIFICATION_ID">Verification (ID)</option>
                <option value="STAFF_TALK">Staff Talk</option>
                <option value="EVENT_REPORT">Event Report</option>
                <option value="UNSOLICITED_DM">Unsolicited DM</option>
                <option value="FRIEND_REQUEST">Friend Request</option>
                <option value="DRAMA">Drama</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
              <input
                type="text"
                value={(localFilters.assignedStaffId as string) || ''}
                onChange={(e) => handleFilterChange('assignedStaffId', e.target.value || undefined)}
                placeholder="Staff Discord ID"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                value={(localFilters.limit as string) || '50'}
                onChange={(e) => handleFilterChange('limit', e.target.value || '50')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Always visible */}
      <div className="hidden lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={(localFilters.status as string) || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="AWAITING_RESPONSE">Awaiting Response</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={(localFilters.type as string) || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="VERIFICATION_ID">Verification (ID)</option>
              <option value="STAFF_TALK">Staff Talk</option>
              <option value="EVENT_REPORT">Event Report</option>
              <option value="UNSOLICITED_DM">Unsolicited DM</option>
              <option value="FRIEND_REQUEST">Friend Request</option>
              <option value="DRAMA">Drama</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
            <input
              type="text"
              value={(localFilters.assignedStaffId as string) || ''}
              onChange={(e) => handleFilterChange('assignedStaffId', e.target.value || undefined)}
              placeholder="Staff Discord ID"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Limit</label>
            <input
              type="number"
              value={(localFilters.limit as string) || '50'}
              onChange={(e) => handleFilterChange('limit', e.target.value || '50')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

