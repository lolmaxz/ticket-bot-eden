'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';

type DateFormat = 'absolute' | 'relative';

export function useDateFormat(): [DateFormat, (format: DateFormat) => void, (date: Date | string) => string, (date: Date | string) => string] {
  const { data: session } = useSession();
  const discordId = session?.user?.discordId;
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());

  // Fetch preferences from database
  const { data: preferences } = useQuery({
    queryKey: ['userPreferences', discordId],
    queryFn: () => apiClient.getUserPreferences(discordId || ''),
    enabled: !!discordId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const format = (preferences?.dateFormat as DateFormat) || 'absolute';

  // Mutation to update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (newFormat: DateFormat) => apiClient.updateUserPreferences(discordId || '', { dateFormat: newFormat }),
    onMutate: async (newFormat) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userPreferences', discordId] });
      
      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData(['userPreferences', discordId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['userPreferences', discordId], { dateFormat: newFormat });
      
      return { previousPreferences };
    },
    onError: (_err, _newFormat, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(['userPreferences', discordId], context.previousPreferences);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences', discordId] });
    },
  });

  useEffect(() => {
    // Update time every minute for relative format
    if (format === 'relative') {
      const interval = setInterval(() => {
        setNow(new Date());
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
    return undefined;
  }, [format]);

  const setFormat = (newFormat: DateFormat): void => {
    if (discordId) {
      updatePreferencesMutation.mutate(newFormat);
    }
  };

  const formatDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'relative') {
      return formatRelativeTime(dateObj, now);
    }
    
    return dateObj.toLocaleString();
  }, [format, now]);

  const getAbsoluteDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
  }, []);

  return [format, setFormat, formatDate, getAbsoluteDate];
}

function formatRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  } else {
    return `${diffYears}y ago`;
  }
}

