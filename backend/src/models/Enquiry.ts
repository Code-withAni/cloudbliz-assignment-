import { Schema, model } from 'mongoose';
import type { Types } from 'mongoose';

export type EnquiryStatus = 'New' | 'In Progress' | 'Closed';

export const ENQUIRY_STATUSES: EnquiryStatus[] = ['New', 'In Progress', 'Closed'];

export interface IEnquiry {
  customerName: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  assignedTo: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SafeAssignedUser {
  id: string;
  name: string;
  email: string;
}

export interface SafeEnquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  assignedTo: SafeAssignedUser | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'New' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Enquiry = model<IEnquiry>('Enquiry', enquirySchema);

export function toSafeEnquiry(
  enquiry: IEnquiry & { _id: unknown; assignedTo?: Types.ObjectId | SafeAssignedUser | null },
): SafeEnquiry {
  let assignedTo: SafeAssignedUser | null = null;
  if (enquiry.assignedTo && typeof enquiry.assignedTo === 'object') {
    const a = enquiry.assignedTo as { _id?: unknown; id?: string; name?: string; email?: string };
    assignedTo = {
      id: String(a.id ?? a._id ?? ''),
      name: a.name ?? '',
      email: a.email ?? '',
    };
  }

  return {
    id: String(enquiry._id),
    customerName: enquiry.customerName,
    email: enquiry.email,
    phone: enquiry.phone,
    message: enquiry.message,
    status: enquiry.status,
    assignedTo,
    isDeleted: enquiry.isDeleted,
    createdAt: enquiry.createdAt instanceof Date ? enquiry.createdAt.toISOString() : '',
    updatedAt: enquiry.updatedAt instanceof Date ? enquiry.updatedAt.toISOString() : '',
  };
}
