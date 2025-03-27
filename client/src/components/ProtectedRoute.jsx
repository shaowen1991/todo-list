import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    const sessionRedirectUrl = encodeURIComponent(location.pathname);

    return (
      <Navigate to={`/login?sessionRedirect=${sessionRedirectUrl}`} replace />
    );
  }

  return children;
}
