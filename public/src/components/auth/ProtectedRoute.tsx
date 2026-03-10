import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SignUpOrLogin from './SignUpOrLogin';
import AuthOverlay from './AuthOverlay';
import { Flex, Title } from '@mantine/core';
import userStore from '../../stores/userStore';
import { observer } from 'mobx-react-lite';
import shareContextStore from '../../stores/shareContextStore';
import inviteContextStore from '../../stores/inviteContextStore';
import { handlePendingInvite } from '../../services/inviteService';
import { checkBetaAccess } from 'public/src/clients/backoffice-client';
import {
  WF_SHARE_URL_PARAM,
  BETA_INVITE_URL_PARAM,
} from '@shared/consts/general';

import LogoLoader from '../shared/LogoLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserId?: number;
}

// Simple page shell component showing "Your Grunts" title behind the auth overlay
const PageShell = () => (
  <Flex p='xl' direction='column'>
    <Title order={1} mb='xl' fw={400}>
      Your Grunt Apps
    </Title>
  </Flex>
);

const ProtectedRoute = observer(
  ({ children, requiredUserId }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get(WF_SHARE_URL_PARAM);
      const inviteId = params.get(BETA_INVITE_URL_PARAM);

      if (shareId) {
        shareContextStore.initializeFromShareId(shareId);
      }

      if (inviteId) {
        inviteContextStore.initializeFromInviteId(inviteId);
      }
    }, []);

    // For already-authenticated users landing on an invite link, accept it directly.
    // Not-logged-in users (new or existing) go through AuthCallback instead.
    useEffect(() => {
      if (
        isAuthenticated === true &&
        userStore.user &&
        !inviteContextStore.isLoading &&
        inviteContextStore.context
      ) {
        handlePendingInvite().then(async (result) => {
          if (result.success || result.permanent) {
            inviteContextStore.clear();
          }
          if (result.success) {
            userStore.setHasBetaAccess(await checkBetaAccess());
          }
        });
      }
    }, [
      isAuthenticated,
      userStore.user?.id,
      inviteContextStore.isLoading,
      inviteContextStore.context,
    ]);

    if (
      isAuthenticated === null ||
      userStore.isLoadingUser ||
      shareContextStore.isLoading ||
      inviteContextStore.isLoading
    ) {
      return <LogoLoader />;
    }

    if (!isAuthenticated || !userStore.user) {
      // If there's a pending share, show page shell with auth overlay
      if (shareContextStore.context) {
        return (
          <>
            <PageShell />
            <AuthOverlay
              shareContext={shareContextStore.context}
              inviteContext={inviteContextStore.context ?? undefined}
              opened={true}
            />
          </>
        );
      }
      // If there's a pending invite, show page shell with auth overlay
      if (inviteContextStore.context) {
        return (
          <>
            <PageShell />
            <AuthOverlay
              inviteContext={inviteContextStore.context}
              opened={true}
            />
          </>
        );
      }
      // No pending share or invite, show regular sign up/login
      return <SignUpOrLogin />;
    }

    if (requiredUserId && userStore.user.id !== requiredUserId) {
      window.location.href = '/oops/forbidden';
      return;
    }

    return <>{children}</>;
  }
);

export default ProtectedRoute;
