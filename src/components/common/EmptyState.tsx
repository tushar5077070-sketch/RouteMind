import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center bg-white border border-slate-200 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <SearchX className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
