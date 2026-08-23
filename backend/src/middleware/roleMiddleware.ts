import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access control middleware.
 * Expects requireAuth to have already been run, so req.user is populated.
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required before checking roles.'
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};
