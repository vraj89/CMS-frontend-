import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuByRole } from '../utils/format';

export default function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, booting } = useAuth();
  const { pathname } = useLocation();

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-2 w-2 animate-ping rounded-full bg-brand-600" /> Loading workspace…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: pathname }} replace />;

  if (roles && !roles.includes(user.role)) {
    const fallback = menuByRole[user.role]?.[0] || 'dashboard';
    return <Navigate to={`/${fallback}`} replace />;
  }

  return <Outlet />;
}
