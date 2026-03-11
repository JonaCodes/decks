import React from 'react';
import { observer } from 'mobx-react-lite';
// import { useAuth } from '../../hooks/useAuth';
// import SignUpOrLogin from './SignUpOrLogin';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = observer(
  ({ children }) => {
    // const { isAuthenticated } = useAuth();

    // if (isAuthenticated === null) {
    //   return <div>Loading...</div>;
    // }

    // if (!isAuthenticated) {
    //   return <SignUpOrLogin />;
    // }

    return <>{children}</>;
  }
);

export default ProtectedRoute;
