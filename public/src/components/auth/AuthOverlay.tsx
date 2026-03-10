import { Modal, Text, Stack, Divider } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { ShareContext } from '../../stores/shareContextStore';
import { InviteContext } from '../../stores/inviteContextStore';
import SignUpOrLogin from './SignUpOrLogin';
import { STYLES } from '../../consts/styling';

interface AuthOverlayProps {
  shareContext?: ShareContext;
  inviteContext?: InviteContext;
  opened: boolean;
  onClose?: () => void;
}

const AuthOverlay = observer(
  ({ shareContext, inviteContext, opened, onClose }: AuthOverlayProps) => {
    // Determine which context to display
    let contextMessage = '';
    let hasWorkflowName = false;

    if (shareContext) {
      contextMessage = shareContext.workflowName
        ? ` was shared with you - sign in to try it out!`
        : 'An app was shared with you — sign in to access it';
      hasWorkflowName = !!shareContext.workflowName;
    } else if (inviteContext) {
      contextMessage = "You've been invited to the beta - sign in to get access!";
    }

    return (
      <Modal
        opened={opened}
        onClose={onClose || (() => {})}
        centered
        radius={'md'}
        shadow='md'
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 3,
        }}
        styles={{
          content: {
            backgroundColor: 'var(--app-bg-dark)',
          },
          header: {
            backgroundColor: 'var(--app-bg-dark)',
          },
        }}
      >
        <Stack gap='lg'>
          <Text ta='center' size='md' fw={500}>
            {shareContext && hasWorkflowName && (
              <>
                <span>The </span>
                <b style={{ color: STYLES.COLORS.APP_THEME.SHADE_1 }}>
                  {shareContext.workflowName}
                </b>
                <span> app </span>
              </>
            )}
            {contextMessage}
          </Text>
          <Divider />
          <SignUpOrLogin />
        </Stack>
      </Modal>
    );
  }
);

export default AuthOverlay;
