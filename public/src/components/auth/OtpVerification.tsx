import { Button, Text, Center } from '@mantine/core';
import OtpInput from './OtpInput';
import { STYLES } from 'public/src/consts/styling';

interface OtpVerificationProps {
  email: string;
  otpCode: string;
  error?: string;
  isLoading?: boolean;
  isResending?: boolean;
  onOtpChange: (code: string) => void;
  onVerify: () => void;
  onResend: () => void;
}

export const OtpVerification = ({
  email,
  otpCode,
  error,
  isLoading,
  isResending,
  onOtpChange,
  onVerify,
  onResend,
}: OtpVerificationProps) => {
  return (
    <>
      <Text size='lg' fw={600} ta='center'>
        Enter verification code
      </Text>
      <Text size='sm' c='dimmed' ta='center'>
        We sent a code to {email}
      </Text>

      <Center>
        <OtpInput
          value={otpCode}
          onChange={onOtpChange}
          error={!!error}
          disabled={isLoading}
        />
      </Center>

      {error && (
        <Text c='red' size='sm' ta='center'>
          {error}
        </Text>
      )}

      <Button
        onClick={onVerify}
        loading={isLoading}
        disabled={otpCode.length !== 6}
        fullWidth
        size='md'
        variant='gradient'
        gradient={{
          from: STYLES.COLORS.APP_THEME.SHADE_6,
          to: STYLES.COLORS.APP_THEME.SHADE_1,
          deg: 135,
        }}
      >
        Verify Code
      </Button>

      <Text size='sm' ta='center' c='dimmed' component='span'>
        Didn't receive it?{' '}
        <Text
          component='button'
          variant='link'
          onClick={onResend}
          disabled={isResending}
          style={{
            cursor: isResending ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            color: 'inherit',
          }}
        >
          {isResending ? 'Sending...' : 'Resend code'}
        </Text>
        <Text size='xs' ta='center' c='dimmed'>
          Or check your spam folder
        </Text>
      </Text>
    </>
  );
};
