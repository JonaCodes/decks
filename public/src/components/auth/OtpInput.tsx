import { PinInput } from '@mantine/core';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const OtpInput = ({ value, onChange, error, disabled }: OtpInputProps) => {
  return (
    <PinInput
      length={6}
      type='number'
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      size='lg'
      placeholder=''
      autoFocus
      oneTimeCode
    />
  );
};

export default OtpInput;
