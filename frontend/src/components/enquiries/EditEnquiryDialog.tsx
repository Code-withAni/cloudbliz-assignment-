import { useState } from 'react';
import { toast } from 'sonner';
import { enquiryApi, type Enquiry, type EnquiryStatus, type UserSummary } from '../../lib/api';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';

const STATUS_OPTIONS: { value: EnquiryStatus; label: string }[] = [
  { value: 'New', label: 'New' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Closed', label: 'Closed' },
];

const UNASSIGNED = '__unassigned__';

interface EditEnquiryDialogProps {
  enquiry: Enquiry | null;
  users: UserSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export default function EditEnquiryDialog({
  enquiry,
  users,
  open,
  onOpenChange,
  onUpdated,
}: EditEnquiryDialogProps) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry?.status ?? 'New');
  const [assignedTo, setAssignedTo] = useState<string>(enquiry?.assignedTo?.id ?? UNASSIGNED);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enquiry) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await enquiryApi.update(enquiry.id, {
        status,
        assignedTo: assignedTo === UNASSIGNED ? null : assignedTo,
      });
      toast.success('Enquiry updated successfully');
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update enquiry';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Enquiry"
      description={enquiry.customerName}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            ariaLabel="Edit status"
            value={status}
            onValueChange={(value) => setStatus(value as EnquiryStatus)}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="space-y-2">
          <Label>Assigned to</Label>
          <Select
            ariaLabel="Edit assigned to"
            value={assignedTo}
            onValueChange={setAssignedTo}
            options={[
              { value: UNASSIGNED, label: 'Unassigned' },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
            placeholder="Unassigned"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            data-testid="cancel-edit-enquiry"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button data-testid="save-edit-enquiry" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
