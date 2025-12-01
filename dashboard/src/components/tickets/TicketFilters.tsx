'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Clipboard } from 'lucide-react';

interface TicketFiltersProps {
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
}

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'AWAITING_RESPONSE', label: 'Awaiting Response' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const TYPE_OPTIONS = [
  { value: 'VERIFICATION_ID', label: 'Verification (ID)' },
  { value: 'STAFF_TALK', label: 'Staff Talk' },
  { value: 'EVENT_REPORT', label: 'Event Report' },
  { value: 'UNSOLICITED_DM', label: 'Unsolicited DM' },
  { value: 'FRIEND_REQUEST', label: 'Friend Request' },
  { value: 'DRAMA', label: 'Drama' },
  { value: 'OTHER', label: 'Other' },
];

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps): JSX.Element {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const getStatusArray = (): string[] => {
    const status = localFilters.status;
    if (Array.isArray(status)) return status;
    if (typeof status === 'string' && status) return [status];
    return [];
  };

  const getTypeArray = (): string[] => {
    const type = localFilters.type;
    if (Array.isArray(type)) return type;
    if (typeof type === 'string' && type) return [type];
    return [];
  };

  const toggleStatus = (e: React.MouseEvent<HTMLButtonElement>, value: string): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    const current = getStatusArray();
    const newStatus = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    
    const newFilters = { ...localFilters };
    if (newStatus.length === 0) {
      delete newFilters.status;
    } else {
      newFilters.status = newStatus;
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleType = (e: React.MouseEvent<HTMLButtonElement>, value: string): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    const current = getTypeArray();
    const newType = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    
    const newFilters = { ...localFilters };
    if (newType.length === 0) {
      delete newFilters.type;
    } else {
      newFilters.type = newType;
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (key: string, value: unknown): void => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = (): void => {
    const cleared = { limit: localFilters.limit || '50' };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  // Check if there are any active filters (excluding default limit)
  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => key !== 'limit' && localFilters[key] !== undefined && localFilters[key] !== ''
  );

  const selectedStatuses = getStatusArray();
  const selectedTypes = getTypeArray();

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
                {selectedStatuses.length + selectedTypes.length + (localFilters.assignedStaffId ? 1 : 0)}
              </span>
            )}
          </div>
          {isOpen && <X className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatuses.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        toggleStatus(e, option.value);
                        // Prevent any default behavior that might cause scrolling
                        if (e.currentTarget) {
                          e.currentTarget.blur();
                        }
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((option) => {
                  const isSelected = selectedTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        toggleType(e, option.value);
                        // Prevent any default behavior that might cause scrolling
                        if (e.currentTarget) {
                          e.currentTarget.blur();
                        }
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={(localFilters.assignedStaffId as string) || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit to 25 digits
                    if (value === '' || /^\d{0,25}$/.test(value)) {
                      handleFilterChange('assignedStaffId', value || undefined);
                    }
                  }}
                  placeholder="Staff Discord ID"
                  maxLength={25}
                  className="flex-1 rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      const numbersOnly = text.replace(/\D/g, '').slice(0, 25);
                      if (numbersOnly) {
                        handleFilterChange('assignedStaffId', numbersOnly || undefined);
                      }
                    } catch (err) {
                      console.error('Failed to read clipboard:', err);
                    }
                  }}
                  className="lg:hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-600 hover:bg-gray-50"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Limit</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={(localFilters.limit as string) || '50'}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers
                    if (value === '' || /^\d+$/.test(value)) {
                      handleFilterChange('limit', value || '50');
                    }
                  }}
                  placeholder="50"
                  className="flex-1 rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      const numbersOnly = text.replace(/\D/g, '');
                      if (numbersOnly) {
                        handleFilterChange('limit', numbersOnly || '50');
                      }
                    } catch (err) {
                      console.error('Failed to read clipboard:', err);
                    }
                  }}
                  className="lg:hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-600 hover:bg-gray-50"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = selectedStatuses.includes(option.value);
                return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        toggleStatus(e, option.value);
                        // Prevent any default behavior that might cause scrolling
                        if (e.currentTarget) {
                          e.currentTarget.blur();
                        }
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => {
                const isSelected = selectedTypes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={(e) => toggleType(e, option.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
              <input
                type="text"
                value={(localFilters.assignedStaffId as string) || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Limit to 25 digits
                  if (value === '' || /^\d{0,25}$/.test(value)) {
                    handleFilterChange('assignedStaffId', value || undefined);
                  }
                }}
                placeholder="Staff Discord ID"
                maxLength={25}
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                value={(localFilters.limit as string) || '50'}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers
                  if (value === '' || /^\d+$/.test(value)) {
                    handleFilterChange('limit', value || '50');
                  }
                }}
                placeholder="50"
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
