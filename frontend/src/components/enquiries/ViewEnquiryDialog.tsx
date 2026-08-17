import type { Enquiry } from '../../lib/api';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

interface ViewEnquiryDialogProps {
  enquiry: Enquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value || '—'}</p>
    </div>
  );
}

export default function ViewEnquiryDialog({ enquiry, open, onOpenChange }: ViewEnquiryDialogProps) {
  if (!enquiry) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enquiry details"
      description={enquiry.customerName}
    >
      <div className="grid grid-cols-2 gap-4">
        <Row label="Customer" value={enquiry.customerName} />
        <Row label="Status" value={enquiry.status} />
        <Row label="Email" value={enquiry.email} />
        <Row label="Phone" value={enquiry.phone} />
        <Row label="Assigned to" value={enquiry.assignedTo?.name ?? 'Unassigned'} />
        <Row label="Created" value={formatDate(enquiry.createdAt)} />
        <div className="col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Message</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">{enquiry.message}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          variant="outline"
          data-testid="close-view-enquiry"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>
    </Dialog>
  );
}
