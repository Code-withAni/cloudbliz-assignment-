import { toast } from 'sonner';
import { userApi, type AuthUser } from '../../lib/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DeleteUserDialogProps {
  user: AuthUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export default function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onDeleted,
}: DeleteUserDialogProps) {
  if (!user) return null;

  const handleConfirm = async () => {
    try {
      await userApi.remove(user.id);
      toast.success('User deleted');
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete user"
      description={`Delete ${user.name} (${user.email})? Their assigned enquiries will be unassigned. This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
    />
  );
}
