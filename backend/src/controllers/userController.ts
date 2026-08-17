import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Enquiry } from '../models/Enquiry';
import { toSafeUser, User } from '../models/User';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff']).default('staff'),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'staff']).optional(),
});

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map((u) => toSafeUser(u)) });
  } catch (error) {
    next(error);
  }
}

export async function listAssignableUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find({ role: 'staff' }).sort({ name: 1 }).select('name email role');
    res.json({ users: users.map((u) => toSafeUser(u)) });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      role: data.role,
    });

    res.status(201).json({ user: toSafeUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data = updateUserSchema.parse(req.body);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: data.email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.role !== undefined) user.role = data.role;
    if (data.password !== undefined) user.passwordHash = data.password;

    await user.save();

    res.json({ user: toSafeUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user?.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Enquiry.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });
    await user.deleteOne();

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}
