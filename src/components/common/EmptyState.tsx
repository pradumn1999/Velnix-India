import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-500 mb-4">
        {icon || <PackageOpen className="w-7 h-7 text-neutral-400" />}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-md mb-6">{description}</p>
      {actionText && actionHref && (
        <Link to={actionHref}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      )}
      {actionText && !actionHref && onActionClick && (
        <Button variant="primary" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
