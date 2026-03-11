// import { Flex, Paper, Stack, ActionIcon } from '@mantine/core';
// import { IconArrowLeft } from '@tabler/icons-react';
// import { observer } from 'mobx-react-lite';
// import { useState, useEffect } from 'react';
// import { ProviderSelection } from './ProviderSelection';
// import { EmailForm } from './EmailForm';
// import { OtpVerification } from './OtpVerification';
// import { signInWithOAuth, requestOtp, verifyOtp } from './authHelpers';
// import { STYLES } from 'public/src/consts/styling';
// // import shareContextStore from 'public/src/stores/shareContextStore';
// import './auth.module.css';

// enum AuthStep {
//   PROVIDER_SELECTION = 'provider_selection',
//   EMAIL_INPUT = 'email_input',
//   OTP_VERIFICATION = 'otp_verification',
// }

// const SignUpOrLogin = observer(() => {
//   const [authStep, setAuthStep] = useState<AuthStep>(
//     AuthStep.PROVIDER_SELECTION
//   );
//   const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
//   const [email, setEmail] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [otpCode, setOtpCode] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isResending, setIsResending] = useState(false);

//   const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
//     setSelectedProvider(provider === 'google' ? 'Google' : 'Apple');
//     const { error } = await signInWithOAuth(provider);
//     if (error) {
//       setError(error.message || 'Failed to sign in');
//     }
//   };

//   const handleEmailSubmit = async () => {
//     setError('');
//     setIsLoading(true);

//     const { error: otpError } = await requestOtp(email);

//     if (otpError) {
//       setError(otpError.message || 'Failed to send code');
//     } else {
//       setAuthStep(AuthStep.OTP_VERIFICATION);
//     }

//     setIsLoading(false);
//   };

//   const handleOtpVerify = async () => {
//     setError('');
//     setIsLoading(true);

//     const { error: verifyError } = await verifyOtp(email, otpCode, fullName);

//     if (verifyError) {
//       setError(verifyError.message || 'Invalid code');
//       setOtpCode('');
//     } else {
//       // Session is now established! Redirect to callback handler
//       window.location.href = '/auth/callback';
//     }

//     setIsLoading(false);
//   };

//   const handleResendCode = async () => {
//     setError('');
//     setIsResending(true);

//     const { error: otpError } = await requestOtp(email);

//     if (otpError) {
//       setError(otpError.message || 'Failed to resend code');
//     }

//     setIsResending(false);
//   };

//   const handleBack = () => {
//     setError('');
//     if (authStep === AuthStep.OTP_VERIFICATION) {
//       setAuthStep(AuthStep.EMAIL_INPUT);
//       setOtpCode('');
//     } else if (authStep === AuthStep.EMAIL_INPUT) {
//       setAuthStep(AuthStep.PROVIDER_SELECTION);
//       setEmail('');
//       setFullName('');
//     }
//   };

//   // Auto-submit when 6 digits are entered
//   useEffect(() => {
//     if (otpCode.length === 6 && !isLoading) {
//       handleOtpVerify();
//     }
//   }, [otpCode]);

//   // If there is a shareId, a workflow is being shared, so we don't want too much padding/shadow
//   const paddingTop = shareContextStore.context?.shareId ? '0' : 'lg';
//   const shadow = shareContextStore.context?.shareId ? 'none' : 'xs';

//   return (
//     <Flex justify='center' align='center' h='100%' w='100%'>
//       <Paper
//         shadow={shadow}
//         pt={paddingTop}
//         p='lg'
//         radius='md'
//         w='100%'
//         maw={400}
//       >
//         <Stack>
//           {authStep !== AuthStep.PROVIDER_SELECTION && (
//             <ActionIcon
//               variant='subtle'
//               onClick={handleBack}
//               style={{ alignSelf: 'flex-start' }}
//               color={STYLES.COLORS.APP_THEME.SHADE_1}
//             >
//               <IconArrowLeft size={18} />
//             </ActionIcon>
//           )}

//           {authStep === AuthStep.PROVIDER_SELECTION && (
//             <ProviderSelection
//               onSelectOAuth={handleOAuthSignIn}
//               onSelectEmail={() => setAuthStep(AuthStep.EMAIL_INPUT)}
//               isLoading={isLoading}
//               selectedProvider={selectedProvider}
//             />
//           )}

//           {authStep === AuthStep.EMAIL_INPUT && (
//             <EmailForm
//               email={email}
//               fullName={fullName}
//               error={error}
//               isLoading={isLoading}
//               onEmailChange={setEmail}
//               onNameChange={setFullName}
//               onSubmit={handleEmailSubmit}
//             />
//           )}

//           {authStep === AuthStep.OTP_VERIFICATION && (
//             <OtpVerification
//               email={email}
//               otpCode={otpCode}
//               error={error}
//               isLoading={isLoading}
//               isResending={isResending}
//               onOtpChange={setOtpCode}
//               onVerify={handleOtpVerify}
//               onResend={handleResendCode}
//             />
//           )}
//         </Stack>
//       </Paper>
//     </Flex>
//   );
// });

// export default SignUpOrLogin;
