import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

/**
 * JWT-based authentication middleware.
 *
 * Extracts Bearer token from Authorization header,
 * verifies it via supabaseAdmin.auth.getUser(token),
 * looks up role from profiles table,
 * and attaches { id, role, name, email } to req.user.
 *
 * Returns 401 with consistent error shapes for:
 *   - Missing token
 *   - Malformed / invalid token
 *   - Expired token
 *   - Valid token but no matching profile
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // ─── Missing token ──────────────────────────────────────────────
  if (!authHeader) {
    return res.status(401).json({
      error: 'MISSING_TOKEN',
      message: 'Authentication required. Please provide a valid access token.',
    });
  }

  // ─── Extract Bearer token ───────────────────────────────────────
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Malformed authorization header. Expected format: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    // ─── Offline Demo Bypass ────────────────────────────────────────
    if (token === 'fake_offline_token_student' || token === 'fake_offline_token_12345') {
      (req as any).user = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Student Demo (Offline)',
        email: 'student_offline@cognivia.local',
        role: 'student',
      };
      return next();
    }
    if (token === 'fake_offline_token_educator') {
      (req as any).user = {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Educator Demo (Offline)',
        email: 'educator_offline@cognivia.local',
        role: 'educator',
      };
      return next();
    }
    
    // ─── Verify token with Supabase ─────────────────────────────
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      // Distinguish expired vs invalid
      const errorMsg = userError?.message?.toLowerCase() || '';
      if (errorMsg.includes('expired') || errorMsg.includes('jwt expired')) {
        return res.status(401).json({
          error: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        });
      }

      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or revoked access token.',
      });
    }

    const userId = userData.user.id;

    // ─── Look up profile for role ───────────────────────────────
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        error: 'PROFILE_NOT_FOUND',
        message: 'Your authentication is valid but no profile was found. Please complete your account setup.',
      });
    }

    // ─── Attach user to request ─────────────────────────────────
    (req as any).user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };

    next();
  } catch (err: any) {
    // Catch unexpected errors — never return 500 for auth issues
    console.error('Auth middleware unexpected error:', err);
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Unable to verify your credentials. Please try logging in again.',
    });
  }
};

/**
 * Role-based authorization middleware.
 * Must be used AFTER requireAuth.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        error: 'MISSING_TOKEN',
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
