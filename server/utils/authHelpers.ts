import User from '../models/user';
import Account from '../models/account';
import { User as SupabaseUser } from '@supabase/supabase-js';
import sequelize from '../config/database';
import { Transaction } from 'sequelize';
import logger from 'logger';

const updateUserInfo = async (user: User, userInfo: any, t?: Transaction) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  if (!user.lastLogin || user.lastLogin.getTime() < tenMinutesAgo.getTime()) {
    await user.update(
      {
        email: userInfo.email,
        fullName: userInfo.fullName,
        avatarUrl: userInfo.avatarUrl,
        provider: userInfo.provider,
        extraData: {
          ...user.extraData,
          ...userInfo.extraData,
        },
        lastLogin: new Date(),
      },
      { transaction: t }
    );
  }
};

export async function syncUserFromSupabase(
  supabaseUser: SupabaseUser,
  provider?: string
): Promise<User> {
  const userInfo = {
    email: supabaseUser.email!,
    fullName: supabaseUser.user_metadata.full_name,
    avatarUrl: supabaseUser.user_metadata.avatar_url,
    provider: provider || supabaseUser.app_metadata.provider || 'email',
    extraData: {
      master_v1_agreed_at: new Date(),
      privacy_v1_agreed_at: new Date(),
    },
  };

  // Step 1: Optimistic Read (No Lock)
  const findUserFromDBStartTime = Date.now();
  const existingUser = await User.findOne({
    where: { supabaseId: supabaseUser.id },
  });
  logger.info(
    { duration: Date.now() - findUserFromDBStartTime },
    'Find user from DB in syncUserFromSupabase'
  );

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  if (existingUser && existingUser.lastLogin > tenMinutesAgo) {
    return existingUser;
  }

  // Step 2: The Lock
  // Use a transaction to ensure atomicity and prevent race conditions
  const syncTransactionStartTime = Date.now();
  logger.info({ startTime: syncTransactionStartTime }, 'Starting lock flow');
  const result = await sequelize.transaction(async (t) => {
    // Step 3: Re-check inside the lock
    let user = await User.findOne({
      where: { supabaseId: supabaseUser.id },
      transaction: t,
      lock: t.LOCK.UPDATE, // Lock the row if found
    });

    if (user) {
      await updateUserInfo(user, userInfo, t);
      logger.info(
        { duration: Date.now() - syncTransactionStartTime },
        'updateUserInfo in syncUserFromSupabase'
      );
      return user;
    }

    try {
      // Always create a new account for a new user for now, until we have actual accounts
      const newAccount = await Account.create(
        {
          name: userInfo.fullName || userInfo.email.split('@')[0],
          primaryContactEmail: userInfo.email,
          provider: userInfo.provider,
        },
        { transaction: t }
      );

      user = await User.create(
        {
          supabaseId: supabaseUser.id,
          email: userInfo.email,
          fullName: userInfo.fullName,
          avatarUrl: userInfo.avatarUrl,
          provider: userInfo.provider,
          extraData: userInfo.extraData,
          accountId: newAccount.id,
          lastLogin: new Date(),
        },
        { transaction: t }
      );

      logger.info(
        { duration: Date.now() - syncTransactionStartTime },
        'Create account and user in syncUserFromSupabase'
      );
      return user;
    } catch (error: any) {
      // Handle race condition: another request created the user first
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Retry: fetch the user that was just created by another request
        const existingUser = await User.findOne({
          where: { supabaseId: supabaseUser.id },
          transaction: t,
        });

        if (existingUser) {
          logger.info(
            { duration: Date.now() - syncTransactionStartTime },
            'Return existing user in syncUserFromSupabase'
          );
          return existingUser;
        }
      }

      throw error; // Re-throw if it's a different error
    }
  });

  logger.info(
    { duration: Date.now() - syncTransactionStartTime },
    'Return result in syncUserFromSupabase'
  );
  return result;
}
