import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { userApi, type UserRole } from '../../lib/api';
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

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export default function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Please enter a valid email address';
    if (password.length < 6) next.password = 'Password must be at least 6 characters';
    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await userApi.create({ name: name.trim(), email: email.trim(), password, role });
      toast.success('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
      setRole('staff');
      setErrors({});
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create User"
      description="Add a new staff or admin account."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="create-user-name">Name</Label>
          <Input
            id="create-user-name"
            data-testid="create-user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
          {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-user-email">Email</Label>
          <Input
            id="create-user-email"
            data-testid="create-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
          />
          {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-user-password">Password</Label>
          <Input
            id="create-user-password"
            data-testid="create-user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
          />
          {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            ariaLabel="Create user role"
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="button"
            data-testid="cancel-create-user"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" data-testid="save-user" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create User'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
