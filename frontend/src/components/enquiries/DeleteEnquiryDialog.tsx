import { toast } from 'sonner';
import { enquiryApi, type Enquiry } from '../../lib/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DeleteEnquiryDialogProps {
  enquiry: Enquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export default function DeleteEnquiryDialog({
  enquiry,
  open,
  onOpenChange,
  onDeleted,
}: DeleteEnquiryDialogProps) {
  if (!enquiry) return null;

  const handleConfirm = async () => {
    try {
      await enquiryApi.remove(enquiry.id);
      toast.success('Enquiry deleted');
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete enquiry');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete enquiry"
      description={`Are you sure you want to delete the enquiry from ${enquiry.customerName}? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
    />
  );
}
