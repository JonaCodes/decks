import { Button, TextInput, Text } from '@mantine/core';
import { isValidEmail } from './authHelpers';
import { STYLES } from 'public/src/consts/styling';

interface EmailFormProps {
  email: string;
  fullName: string;
  error?: string;
  isLoading?: boolean;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export const EmailForm = ({
  email,
  fullName,
  error,
  isLoading,
  onEmailChange,
  onNameChange,
  onSubmit,
}: EmailFormProps) => {
  const isValid = isValidEmail(email) && fullName.trim().length > 0;

  return (
    <>
      <TextInput
        autoFocus
        placeholder='Name'
        value={fullName}
        onChange={(e) => onNameChange(e.target.value)}
        size='md'
        disabled={isLoading}
        required
        name='name'
        autoComplete='name'
      />

      <TextInput
        placeholder='your@email.com'
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        size='md'
        disabled={isLoading}
        error={error}
        required
        name='email'
        autoComplete='email'
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isValid) {
            onSubmit();
          }
        }}
      />

      {error && (
        <Text c='red' size='sm'>
          {error}
        </Text>
      )}

      <Button
        onClick={onSubmit}
        loading={isLoading}
        disabled={!isValid}
        fullWidth
        size='md'
        variant='gradient'
        gradient={{
          from: STYLES.COLORS.APP_THEME.SHADE_6,
          to: STYLES.COLORS.APP_THEME.SHADE_1,
          deg: 135,
        }}
        c={isValid ? 'black' : 'dimmed'}
      >
        Enter Beta
      </Button>
    </>
  );
};
