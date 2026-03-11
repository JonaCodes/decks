import { observer } from 'mobx-react-lite';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
// import AuthCallback from './components/auth/AuthCallback';
// import SignUpOrLogin from './components/auth/SignUpOrLogin';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import PresentationModePage from './pages/PresentationModePage';

const App = observer(() => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/presentations/:id'
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/presentations/:id/present'
        element={
          <ProtectedRoute>
            <PresentationModePage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/templates/new'
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/templates/:id/edit'
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      {/* <Route path='/auth/callback' element={<AuthCallback />} />
      <Route path='/login' element={<SignUpOrLogin />} /> */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
});

export default App;
