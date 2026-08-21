import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ allowedRole }: { allowedRole?: 'student' | 'educator' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-on-background">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their respective home
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/educator'} replace />;
  }

  return <Outlet />;
};
