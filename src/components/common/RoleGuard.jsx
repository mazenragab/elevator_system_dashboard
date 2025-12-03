import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Loading from '../ui/Loading';

const RoleGuard = ({ children, allowedRoles = ['MANAGER'] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // إذا مش عامل login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // إذا موش عنده الصلاحيات المطلوبة
  if (!allowedRoles.includes(user.userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleGuard;