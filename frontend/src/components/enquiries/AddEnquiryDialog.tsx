import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { enquiryApi, type CreateEnquiryInput } from '../../lib/api';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddEnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

type FieldErrors = Partial<Record<keyof CreateEnquiryInput, string>>;

export default function AddEnquiryDialog({ open, onOpenChange, onCreated }: AddEnquiryDialogProps) {
  const [values, setValues] = useState<CreateEnquiryInput>({
    customerName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (values.customerName.trim().length < 2) {
      next.customerName = 'Customer name must be at least 2 characters';
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      next.email = 'Please enter a valid email address';
    }
    if (!PHONE_PATTERN.test(values.phone.trim())) {
      next.phone = 'Please enter a valid phone number';
    }
    if (values.message.trim().length === 0) {
      next.message = 'Message is required';
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
      await enquiryApi.create({
        customerName: values.customerName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      });
      toast.success('Enquiry created successfully');
      setValues({ customerName: '', email: '', phone: '', message: '' });
      setErrors({});
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (field: keyof CreateEnquiryInput, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Enquiry"
      description="Capture a new customer enquiry."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="add-customerName">Customer name</Label>
          <Input
            id="add-customerName"
            data-testid="add-customerName"
            value={values.customerName}
            onChange={(e) => setField('customerName', e.target.value)}
            placeholder="Jane Doe"
          />
          {errors.customerName ? (
            <p className="text-sm text-red-600">{errors.customerName}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-email">Email</Label>
          <Input
            id="add-email"
            data-testid="add-email"
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="jane@example.com"
          />
          {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-phone">Phone</Label>
          <Input
            id="add-phone"
            data-testid="add-phone"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="+1 555 000 0000"
          />
          {errors.phone ? <p className="text-sm text-red-600">{errors.phone}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-message">Message</Label>
          <Textarea
            id="add-message"
            data-testid="add-message"
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            placeholder="How can we help?"
          />
          {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="button"
            data-testid="cancel-add-enquiry"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" data-testid="save-enquiry" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create Enquiry'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
