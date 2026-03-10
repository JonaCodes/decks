import { Button, Image } from '@mantine/core';

interface OAuthButtonProps {
  provider: string;
  iconUrl: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const OAuthButton = ({
  provider,
  iconUrl,
  onClick,
  loading,
  disabled,
}: OAuthButtonProps) => {
  return (
    <Button
      variant='default'
      leftSection={<Image src={iconUrl} w={20} h={20} />}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      fullWidth
    >
      Continue with {provider}
    </Button>
  );
};
