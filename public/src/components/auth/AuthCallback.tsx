// import { useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../../lib/supabase';
// import appStore from 'public/src/stores/appStore';
// import userStore from '../../stores/userStore';
// import { getUserData } from 'public/src/clients/app-client';
// import { handlePendingShare } from 'public/src/services/shareService';
// import shareContextStore from '../../stores/shareContextStore';
// import { handlePendingInvite } from 'public/src/services/inviteService';
// import inviteContextStore from '../../stores/inviteContextStore';
// import { checkBetaAccess } from 'public/src/clients/backoffice-client';
// import LogoLoader from '../shared/LogoLoader';

// const AuthCallback = () => {
//   const navigate = useNavigate();
//   const hasRun = useRef(false);

//   useEffect(() => {
//     // Prevent double execution in React Strict Mode
//     if (hasRun.current) return;
//     hasRun.current = true;

//     const handleAuthCallback = async () => {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error || !session) {
//         console.error('Error during auth callback:', error);
//         navigate('/oops/signin');
//         return;
//       }

//       await appStore.loadSession();

//       try {
//         const userData = await getUserData();
//         userStore.setUser(userData);
//         userStore.setIsLoadingUser(false);

//         await handlePendingShare();
//         shareContextStore.clear();

//         const inviteResult = await handlePendingInvite();

//         if (inviteResult.success || inviteResult.permanent) {
//           inviteContextStore.clear();
//         }

//         if (inviteResult.success) {
//           userStore.setHasBetaAccess(await checkBetaAccess());
//         }

//         navigate('/grunts');
//       } catch (err: any) {
//         console.error('Error syncing user:', err.message);
//         navigate('/oops/signin');
//       }
//     };

//     handleAuthCallback();
//   }, [navigate]);

//   return <LogoLoader />;
// };

// export default AuthCallback;
