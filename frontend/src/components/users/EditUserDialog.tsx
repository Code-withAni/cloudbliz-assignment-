import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { userApi, type AuthUser, type UserRole } from '../../lib/api';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
];

interface EditUserDialogProps {
  user: AuthUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUpdated,
}: EditUserDialogProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'staff');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Please enter a valid email address';
    if (password.length > 0 && password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await userApi.update(user.id, {
        name: name.trim(),
        email: email.trim(),
        role,
        ...(password ? { password } : {}),
      });
      toast.success('User updated successfully');
      setPassword('');
      setErrors({});
      onOpenChange(false);
      onUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Edit User" description={user.email}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="edit-user-name">Name</Label>
          <Input
            id="edit-user-name"
            data-testid="edit-user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-email">Email</Label>
          <Input
            id="edit-user-email"
            data-testid="edit-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            ariaLabel="Edit user role"
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-password">New password (optional)</Label>
          <Input
            id="edit-user-password"
            data-testid="edit-user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />
          {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="button"
            data-testid="cancel-edit-user"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" data-testid="save-edit-user" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
