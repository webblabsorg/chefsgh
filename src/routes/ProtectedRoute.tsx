import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
