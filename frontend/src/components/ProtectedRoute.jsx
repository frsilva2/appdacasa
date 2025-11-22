import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(allowedTypes)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
