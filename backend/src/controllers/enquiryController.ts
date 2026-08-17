import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Enquiry, toSafeEnquiry } from '../models/Enquiry';

const createEnquirySchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone must be at least 5 characters'),
  message: z.string().min(1, 'Message is required'),
});

const updateEnquirySchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(5, 'Phone must be at least 5 characters').optional(),
  message: z.string().min(1, 'Message is required').optional(),
  status: z.enum(['New', 'In Progress', 'Closed']).optional(),
  assignedTo: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), 'Invalid assigned user id')
    .nullable()
    .optional(),
});

const listQuerySchema = z.object({
  status: z.enum(['New', 'In Progress', 'Closed']).optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function createEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createEnquirySchema.parse(req.body);
    const enquiry = await Enquiry.create(data);
    const created = await Enquiry.findById(enquiry._id).populate('assignedTo', 'name email');
    res.status(201).json({ enquiry: toSafeEnquiry(created!) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    next(error);
  }
}

export async function listEnquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listQuerySchema.parse(req.query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.assignedTo && Types.ObjectId.isValid(query.assignedTo)) {
      filter.assignedTo = query.assignedTo;
    }
    if (query.search && query.search.trim()) {
      const pattern = new RegExp(escapeRegExp(query.search.trim()), 'i');
      filter.$or = [{ customerName: pattern }, { email: pattern }];
    }

    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email');

    res.json({ enquiries: enquiries.map((e) => toSafeEnquiry(e)) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    next(error);
  }
}

export async function getEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    const enquiry = await Enquiry.findOne({ _id: id, isDeleted: false }).populate(
      'assignedTo',
      'name email',
    );
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ enquiry: toSafeEnquiry(enquiry) });
  } catch (error) {
    next(error);
  }
}

export async function updateEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    const data = updateEnquirySchema.parse(req.body);

    const update: Record<string, unknown> = {};
    if (data.customerName !== undefined) update.customerName = data.customerName;
    if (data.email !== undefined) update.email = data.email;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.message !== undefined) update.message = data.message;
    if (data.status !== undefined) update.status = data.status;
    if (data.assignedTo !== undefined) {
      update.assignedTo = data.assignedTo === null ? null : new Types.ObjectId(data.assignedTo);
    }

    const enquiry = await Enquiry.findOneAndUpdate({ _id: id, isDeleted: false }, update, {
      new: true,
    }).populate('assignedTo', 'name email');

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ enquiry: toSafeEnquiry(enquiry) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    next(error);
  }
}

export async function deleteEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    next(error);
  }
}
