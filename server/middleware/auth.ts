import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export const ADMIN_EMAIL = 'jonathanfarache@gmail.com';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.user = { id: 1 };
  next();
  return;
  // TODO: later
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: 'No token provided - middleware rejection' });
    }

    const user = await AuthService.validateUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error: any) {
    const isExpectedAuthFailure =
      error.__isAuthError &&
      (error.code === 'user_not_found' ||
        error.code === 'invalid_jwt' ||
        error.code === 'session_not_found' ||
        error.status === 403 ||
        error.status === 401);

    if (isExpectedAuthFailure) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    console.error('Auth middleware error (unexpected):', error.message, error);
    res.status(401).json({ error: error.message });
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};

export const optionalAuth = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next();
    }

    const user = await AuthService.validateUser(token);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};
