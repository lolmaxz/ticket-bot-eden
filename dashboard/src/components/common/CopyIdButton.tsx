'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyIdButtonProps {
  id: string;
  className?: string;
  size?: 'small' | 'default';
}

export function CopyIdButton({ id, className = '', size = 'default' }: CopyIdButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const iconSize = size === 'small' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  const padding = size === 'small' ? 'px-0.5 py-0' : 'px-1 py-0.5';

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${padding} text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 ${className}`}
      title="Copy ID"
    >
      {copied ? (
        <Check className={iconSize} />
      ) : (
        <Copy className={iconSize} />
      )}
    </button>
  );
}

