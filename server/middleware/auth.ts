import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import Workflow from '../models/workflow';

export const ADMIN_EMAIL = 'jonathanfarache@gmail.com';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const requireWorkflowOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workflowId = parseInt(req.params.id, 10);

    if (isNaN(workflowId)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }

    const workflow = await Workflow.findByPk(workflowId);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user?.id) {
      return res
        .status(403)
        .json({ error: 'Forbidden: You do not own this workflow' });
    }

    next();
  } catch (error: any) {
    console.error('Workflow ownership check error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
