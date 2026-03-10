import { supabase } from '../utils/general';
import User from '../models/user';
import { syncUserFromSupabase } from '../utils/authHelpers';
import logger from 'logger';

export class AuthService {
  // Used by the /me endpoint to ensure user exists locally
  static async syncAndGetUser(token: string) {
    const supaBaseGetUserStartTime = Date.now();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser(token);

    logger.info(
      { duration: Date.now() - supaBaseGetUserStartTime },
      'Supabase getUser in syncAndGetUser'
    );

    if (error) throw error;
    if (!authUser) return null;

    // Use the Sync + Lock logic here
    const user = await syncUserFromSupabase(authUser);

    return user;
  }

  // Used by Middleware for fast auth checks
  static async validateUser(token: string) {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error) throw error;
    if (!authUser) return null;

    // Strict Read-Only check. No syncing.
    const user = await User.findOne({
      where: { supabaseId: authUser.id },
    });

    return user;
  }
}
