import { Button, Text } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import { OAuthButton } from './OAuthButton';
import { STYLES } from 'public/src/consts/styling';
import shareContextStore from 'public/src/stores/shareContextStore';

interface ProviderSelectionProps {
  onSelectOAuth: (provider: 'google' | 'apple') => void;
  onSelectEmail: () => void;
  isLoading?: boolean;
  selectedProvider?: string | null;
}

export const ProviderSelection = ({
  onSelectOAuth,
  onSelectEmail,
  isLoading,
  selectedProvider,
}: ProviderSelectionProps) => {
  return (
    <>
      {/* If there is a shareId, a workflow is being shared, so we don't want too much text */}
      {!shareContextStore.context?.shareId && (
        <Text size='md' ta='center'>
          Eliminate your gruntwork. Not your privacy.
        </Text>
      )}

      <OAuthButton
        provider='Google'
        iconUrl='https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw'
        onClick={() => onSelectOAuth('google')}
        loading={isLoading && selectedProvider === 'Google'}
      />

      <Button
        variant='default'
        onClick={onSelectEmail}
        fullWidth
        leftSection={
          <IconMail
            stroke={1.5}
            size={24}
            color={STYLES.COLORS.APP_THEME.SHADE_1}
            style={{ marginLeft: '-14px' }}
          />
        }
      >
        Continue with email
      </Button>
      <Text c='dimmed' size='xs' ta='center' mt='xs'>
        By signing in, you agree to our{' '}
        <Text
          component='a'
          href='/terms/general'
          target='_blank'
          c='blue.3'
          td='underline'
        >
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text
          component='a'
          href='/terms/privacy'
          target='_blank'
          c='blue.3'
          td='underline'
        >
          Privacy Policy
        </Text>
      </Text>
    </>
  );
};
