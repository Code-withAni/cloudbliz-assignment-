import type { NextFunction, Request, Response } from 'express';
import { toSafeUser, User } from '../models/User';

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find().select('name email');
    res.json({ users: users.map((u) => toSafeUser(u)) });
  } catch (error) {
    next(error);
  }
}
