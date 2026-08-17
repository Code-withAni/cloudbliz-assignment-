import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { toSafeUser, User, type UserRole } from '../models/User';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment');
}

function signToken(user: { id: string; role: UserRole }) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: data.password,
    });

    const safeUser = toSafeUser(user);
    res.status(201).json({ token: signToken(safeUser), user: safeUser });
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

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const safeUser = toSafeUser(user);
    res.json({ token: signToken(safeUser), user: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues });
    }
    next(error);
  }
}

export function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ user: req.user });
}
