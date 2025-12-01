'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyIdButtonProps {
  id: string;
  className?: string;
}

export function CopyIdButton({ id, className = '' }: CopyIdButtonProps): JSX.Element {
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

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded border border-gray-300 bg-white px-1 py-0.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 ${className}`}
      title="Copy ID"
    >
      {copied ? (
        <Check className="h-2.5 w-2.5" />
      ) : (
        <Copy className="h-2.5 w-2.5" />
      )}
    </button>
  );
}

