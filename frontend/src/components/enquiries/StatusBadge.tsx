import type { EnquiryStatus } from '../../lib/api';
import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  New: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-amber-100 text-amber-800',
  Closed: 'bg-green-100 text-green-800',
};

const STATUS_DOT: Record<EnquiryStatus, string> = {
  New: 'bg-blue-500',
  'In Progress': 'bg-amber-500',
  Closed: 'bg-green-500',
};

export default function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} />
      {status}
    </span>
  );
}
