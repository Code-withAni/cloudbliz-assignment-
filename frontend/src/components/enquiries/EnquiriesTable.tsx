import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Enquiry } from '../../lib/api';
import { Button } from '../ui/Button';
import StatusBadge from './StatusBadge';

interface EnquiriesTableProps {
  enquiries: Enquiry[];
  onView: (enquiry: Enquiry) => void;
  onEdit?: (enquiry: Enquiry) => void;
  onDelete?: (enquiry: Enquiry) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EnquiriesTable({
  enquiries,
  onView,
  onEdit,
  onDelete,
}: EnquiriesTableProps) {
  if (enquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No enquiries found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search or filters, or create a new enquiry.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Assigned To</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enquiry) => (
            <tr
              key={enquiry.id}
              data-testid={`enquiry-row-${enquiry.id}`}
              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-slate-900">{enquiry.customerName}</td>
              <td className="px-4 py-3 text-slate-600">{enquiry.email}</td>
              <td className="px-4 py-3 text-slate-600">{enquiry.phone}</td>
              <td className="px-4 py-3">
                <StatusBadge status={enquiry.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {enquiry.assignedTo?.name ?? <span className="text-slate-400">Unassigned</span>}
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(enquiry.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`view-enquiry-${enquiry.id}`}
                    onClick={() => onView(enquiry)}
                    aria-label={`View ${enquiry.customerName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onEdit ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`edit-enquiry-${enquiry.id}`}
                      onClick={() => onEdit(enquiry)}
                      aria-label={`Edit ${enquiry.customerName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {onDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`delete-enquiry-${enquiry.id}`}
                      onClick={() => onDelete(enquiry)}
                      aria-label={`Delete ${enquiry.customerName}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
