'use client';

import { CopyIdButton } from './CopyIdButton';
import { ProfileCard } from './ProfileCard';
import { useState } from 'react';

interface UsernameDisplayProps {
  discordId: string;
  username: string;
  displayName?: string | null;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export function UsernameDisplay({ discordId, username, displayName, className = '', onClick }: UsernameDisplayProps): JSX.Element {
  const [selectedUser, setSelectedUser] = useState<{ discordId: string; username: string; triggerElement: HTMLElement | null; clickPosition?: { x: number; y: number } | null } | null>(null);

  const handleDisplayNameClick = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (onClick) {
      onClick(e);
    } else {
      // Default behavior: show popup ProfileCard
      if (selectedUser?.discordId === discordId) {
        setSelectedUser(null);
      } else {
        setSelectedUser({
          discordId,
          username: displayName || username,
          triggerElement: e.currentTarget,
          clickPosition: { x: e.clientX, y: e.clientY },
        });
      }
    }
  };

  const displayNameText = displayName || username;
  const showUsername = displayName && displayName !== username;

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        <button
          onClick={handleDisplayNameClick}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer text-left"
        >
          {displayNameText}
        </button>
        {showUsername && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{username}</span>
            {discordId && <CopyIdButton id={discordId} size="small" />}
          </div>
        )}
        {!showUsername && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{username}</span>
            {discordId && <CopyIdButton id={discordId} size="small" />}
          </div>
        )}
      </div>
      {selectedUser && (
        <ProfileCard
          discordId={selectedUser.discordId}
          username={selectedUser.username}
          onClose={() => setSelectedUser(null)}
          triggerElement={selectedUser.triggerElement}
          clickPosition={selectedUser.clickPosition}
        />
      )}
    </>
  );
}

