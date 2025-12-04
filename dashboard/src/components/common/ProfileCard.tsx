'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface ProfileCardProps {
  discordId: string;
  username: string;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
  clickPosition?: { x: number; y: number } | null;
  alwaysVisible?: boolean;
}

export function ProfileCard({ discordId, onClose, triggerElement, clickPosition, alwaysVisible = false }: ProfileCardProps): JSX.Element | null {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; arrowPosition: 'top' | 'bottom' | 'left' | 'right' } | null>(null);
  const [copiedType, setCopiedType] = useState<'username' | 'discordId' | null>(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['discord-user', discordId],
    queryFn: () => apiClient.getDiscordUser(discordId),
    enabled: !!discordId,
  });

  // Convert accent color number to hex
  const accentColorHex = userData?.accentColor 
    ? `#${userData.accentColor.toString(16).padStart(6, '0')}`
    : '#5865F2'; // Default Discord blurple


  // Calculate position based on trigger element
  useEffect(() => {
    if (!triggerElement) return;

    const updatePosition = (): void => {
      const rect = triggerElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const isMobileView = window.innerWidth < 1024;
      
      setIsMobile(isMobileView);

      if (isMobileView) {
        // On mobile, position above the card with more space so it doesn't cover the username
        const cardHeight = 280; // Approximate card height
        const spacing = 24; // Increased space above to avoid covering username
        const topPosition = Math.max(16, rect.top + scrollY - cardHeight - spacing);
        
        setPosition({
          top: topPosition,
          left: scrollX + 16, // 16px from left edge
          arrowPosition: 'bottom', // Arrow points down
        });
      } else {
        // On desktop, position 30px away from cursor
        const cardWidth = 320; // w-80 = 320px
        const cardHeight = 280; // Approximate height
        const offset = 30; // 30px away from cursor
        
        let left: number;
        let top: number;
        let arrowPosition: 'top' | 'bottom' | 'left' | 'right';
        
        if (clickPosition) {
          // Use click position
          const cursorX = clickPosition.x;
          const cursorY = clickPosition.y;
          
          // Calculate space on each side of cursor
          const spaceRight = window.innerWidth - cursorX;
          const spaceLeft = cursorX;
          const spaceBottom = window.innerHeight - cursorY;
          
          // Determine best position (prefer right, then left, then bottom, then top)
          if (spaceRight >= cardWidth + offset) {
            // Place to the right of cursor
            left = cursorX + scrollX + offset;
            top = cursorY + scrollY - (cardHeight / 2);
            arrowPosition = 'left';
          } else if (spaceLeft >= cardWidth + offset) {
            // Place to the left of cursor
            left = cursorX + scrollX - cardWidth - offset;
            top = cursorY + scrollY - (cardHeight / 2);
            arrowPosition = 'right';
          } else if (spaceBottom >= cardHeight + offset) {
            // Place below cursor
            left = cursorX + scrollX - (cardWidth / 2);
            top = cursorY + scrollY + offset;
            arrowPosition = 'top';
          } else {
            // Place above cursor
            left = cursorX + scrollX - (cardWidth / 2);
            top = cursorY + scrollY - cardHeight - offset;
            arrowPosition = 'bottom';
          }
        } else {
          // Fallback to trigger element positioning
          const usernameRight = rect.right + scrollX;
          const usernameCenter = rect.top + scrollY + (rect.height / 2);
          const spacing = 12;
          
          const spaceRight = (window.innerWidth + scrollX) - usernameRight;
          const spaceLeft = usernameRight - scrollX;
          const placeOnRight = spaceRight >= spaceLeft;
          
          if (placeOnRight) {
            left = usernameRight + spacing;
            top = usernameCenter - (cardHeight / 2);
            arrowPosition = 'left';
          } else {
            left = usernameRight - cardWidth - spacing;
            top = usernameCenter - (cardHeight / 2);
            arrowPosition = 'right';
          }
        }
        
        // Adjust if too far right
        if (left + cardWidth > window.innerWidth + scrollX - 16) {
          left = window.innerWidth + scrollX - cardWidth - 16;
        }
        // Adjust if too far left
        if (left < scrollX + 16) {
          left = scrollX + 16;
        }
        
        // Adjust vertical position if too high or too low
        if (top < scrollY + 16) {
          top = scrollY + 16;
        } else if (top + cardHeight > scrollY + window.innerHeight - 16) {
          top = scrollY + window.innerHeight - cardHeight - 16;
        }
        
        setPosition({
          top,
          left,
          arrowPosition,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [triggerElement, clickPosition]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent): void => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        triggerElement &&
        !triggerElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Add event listener with a small delay to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose, triggerElement]);

  // Always visible version (for individual ticket page)
  if (alwaysVisible) {
    return (
      <div className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-gray-800 dark:bg-gray-800">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-500"></div>
          </div>
        ) : userData ? (
          <div className="rounded-lg overflow-hidden bg-gray-800 dark:bg-gray-800">
            {/* Banner */}
            <div
              className="h-32 w-full relative"
              style={{ backgroundColor: accentColorHex }}
            >
              {userData.bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userData.bannerUrl}
                  alt="Banner"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Profile Content */}
            <div className="bg-gray-800 dark:bg-gray-800 px-6 pb-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4">
                <div className="relative inline-block">
                  {/* Background circle (slightly bigger) */}
                  <div
                    className="absolute"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: '#1F2937', // gray-800
                      top: '-4px',
                      left: '-4px',
                    }}
                  />
                  {/* Avatar image (clipped to circle) */}
                  <div
                    className="relative"
                    style={{
                      width: '112px',
                      height: '112px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userData.avatarUrl}
                      alt={userData.username}
                      className="h-28 w-28 object-cover"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                  {/* Status indicator (outside the clipped area) */}
                  <div
                    className="absolute rounded-full bg-green-500"
                    style={{
                      width: '28px',
                      height: '28px',
                      bottom: '0px',
                      right: '0px',
                      border: '4px solid #1F2937', // gray-800 border
                    }}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  {userData.username}
                  {userData.discriminator !== '0' && (
                    <span className="text-gray-400 font-normal">#{userData.discriminator}</span>
                  )}
                </h3>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const usernameText = userData.discriminator !== '0'
                        ? `${userData.username}#${userData.discriminator}`
                        : userData.username;
                      await navigator.clipboard.writeText(usernameText);
                      setCopiedType('username');
                      setTimeout(() => setCopiedType(null), 5000);
                    } catch (err) {
                      console.error('Failed to copy username:', err);
                    }
                  }}
                  className="text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                  title="Copy Username"
                >
                  {copiedType === 'username' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <div className="rounded-lg bg-gray-900 dark:bg-gray-900 p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Discord ID</p>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await navigator.clipboard.writeText(userData.discordId);
                          setCopiedType('discordId');
                          setTimeout(() => setCopiedType(null), 5000);
                        } catch (err) {
                          console.error('Failed to copy Discord ID:', err);
                        }
                      }}
                      className="text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                      title="Copy Discord ID"
                    >
                      {copiedType === 'discordId' ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-white font-mono select-all">{userData.discordId}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // Calculate arrow position based on arrow direction
  const getArrowStyle = (): React.CSSProperties => {
    if (!triggerElement || !position) return {};
    
    const rect = triggerElement.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    switch (position.arrowPosition) {
      case 'top':
        return {
          left: `${rect.left + scrollX + (rect.width / 2) - position.left}px`,
          top: '-8px',
        };
      case 'bottom':
        return {
          left: `${rect.left + scrollX + (rect.width / 2) - position.left}px`,
          bottom: '-8px',
        };
      case 'left':
        return {
          left: '-8px',
          top: `${rect.top + scrollY + (rect.height / 2) - position.top}px`,
        };
      case 'right':
        return {
          right: '-8px',
          top: `${rect.top + scrollY + (rect.height / 2) - position.top}px`,
        };
      default:
        return {};
    }
  };

  if (isMobile && position) {
    return (
      <div
        ref={cardRef}
        className="absolute z-50 w-[calc(100%-32px)] rounded-lg overflow-hidden shadow-2xl bg-gray-800 dark:bg-gray-800"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Back Button */}
        <div className="flex items-center border-b border-gray-700 dark:border-gray-700 px-4 py-2 bg-gray-800 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-300 dark:text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-gray-800 dark:bg-gray-800">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-500"></div>
          </div>
        ) : userData ? (
          <>
            {/* Banner */}
            <div 
              className="h-24 w-full relative"
              style={{ backgroundColor: accentColorHex }}
            >
              {userData.bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userData.bannerUrl}
                  alt="Banner"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Profile Content */}
            <div className="bg-gray-800 dark:bg-gray-800 px-4 pb-4">
              {/* Avatar */}
              <div className="relative -mt-10 mb-3">
                <div className="relative inline-block">
                  {/* Background circle (slightly bigger) */}
                  <div 
                    className="absolute"
                    style={{
                      width: '66px',
                      height: '66px',
                      borderRadius: '50%',
                      backgroundColor: '#1F2937', // gray-800
                      top: '-1px',
                      left: '-1px',
                    }}
                  />
                  {/* Avatar image (clipped to circle) */}
                  <div
                    className="relative"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userData.avatarUrl}
                      alt={userData.username}
                      className="h-16 w-16 object-cover"
                      style={{ 
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                  {/* Status indicator (outside the clipped area) */}
                  <div 
                    className="absolute rounded-full bg-green-500"
                    style={{
                      width: '20px',
                      height: '20px',
                      bottom: '0px',
                      right: '0px',
                      border: '4px solid #1F2937', // gray-800 border
                    }}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {userData.username}
                  {userData.discriminator !== '0' && (
                    <span className="text-gray-400 font-normal">#{userData.discriminator}</span>
                  )}
                </h3>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const usernameText = userData.discriminator !== '0' 
                        ? `${userData.username}#${userData.discriminator}`
                        : userData.username;
                      await navigator.clipboard.writeText(usernameText);
                      setCopiedType('username');
                      setTimeout(() => setCopiedType(null), 5000);
                    } catch (err) {
                      console.error('Failed to copy:', err);
                    }
                  }}
                  className="text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                  title="Copy Username"
                >
                  {copiedType === 'username' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <div className="rounded-lg bg-gray-900 dark:bg-gray-900 p-3 border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Discord ID</p>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await navigator.clipboard.writeText(userData.discordId);
                          setCopiedType('discordId');
                          setTimeout(() => setCopiedType(null), 5000);
                        } catch (err) {
                          console.error('Failed to copy:', err);
                        }
                      }}
                      className="text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                      title="Copy Discord ID"
                    >
                      {copiedType === 'discordId' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-white font-mono select-all">{userData.discordId}</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Desktop tooltip version
  if (!position) return null;
  
  const arrowStyle = getArrowStyle();
  const arrowClasses = {
    top: 'absolute -top-2 left-1/2 transform -translate-x-1/2',
    bottom: 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-180',
    left: 'absolute -left-2 top-1/2 transform -translate-y-1/2 -rotate-90',
    right: 'absolute -right-2 top-1/2 transform -translate-y-1/2 rotate-90',
  };

  return (
    <div
      ref={cardRef}
      className="fixed z-50 w-80 rounded-lg overflow-hidden shadow-2xl bg-gray-800 dark:bg-gray-800 animate-fade-in profile-card-container"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Arrow pointing to cursor/username */}
      <div
        className={arrowClasses[position.arrowPosition]}
        style={arrowStyle}
      >
        <div className="h-4 w-4 rotate-45 bg-gray-800 dark:bg-gray-800 border-l border-t border-gray-700 dark:border-gray-700"></div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-gray-800 dark:bg-gray-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-500"></div>
        </div>
      ) : userData ? (
        <>
          {/* Banner */}
          <div 
            className="h-20 w-full relative"
            style={{ backgroundColor: accentColorHex }}
          >
            {userData.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userData.bannerUrl}
                alt="Banner"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Profile Content */}
          <div className="bg-gray-800 dark:bg-gray-800 px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-12 mb-4">
              <div className="relative inline-block">
                {/* Background circle (slightly bigger) */}
                <div 
                  className="absolute"
                  style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '50%',
                    backgroundColor: '#1F2937', // gray-800
                    top: '-2.5px',
                    left: '-2.5px',
                  }}
                />
                {/* Avatar image (clipped to circle) */}
                <div
                  className="relative"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userData.avatarUrl}
                    alt={userData.username}
                    className="h-20 w-20 object-cover"
                    style={{ 
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
                {/* Status indicator (outside the clipped area) */}
                <div 
                  className="absolute rounded-full bg-green-500"
                  style={{
                    width: '20px',
                    height: '20px',
                    bottom: '0px',
                    right: '0px',
                    border: '4px solid #1F2937', // gray-800 border
                  }}
                />
              </div>
            </div>

            {/* Username */}
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                {userData.username}
                {userData.discriminator !== '0' && (
                  <span className="text-gray-400 font-normal">#{userData.discriminator}</span>
                )}
              </h3>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    const usernameText = userData.discriminator !== '0' 
                      ? `${userData.username}#${userData.discriminator}`
                      : userData.username;
                    await navigator.clipboard.writeText(usernameText);
                    setCopiedType('username');
                    setTimeout(() => setCopiedType(null), 5000);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }}
                className="text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                title="Copy Username"
              >
                {copiedType === 'username' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <div className="rounded-lg bg-gray-900 dark:bg-gray-900 p-3 border border-gray-700">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Discord ID</p>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await navigator.clipboard.writeText(userData.discordId);
                        setCopiedType('discordId');
                        setTimeout(() => setCopiedType(null), 5000);
                      } catch (err) {
                        console.error('Failed to copy:', err);
                      }
                    }}
                    className="text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                    title="Copy Discord ID"
                  >
                     {copiedType === 'discordId' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-white font-mono select-all">{userData.discordId}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

