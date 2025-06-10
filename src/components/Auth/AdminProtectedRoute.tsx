import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

/**
 * Protected route component that checks if the user is authenticated as an admin
 * If not, redirects to the admin login page with the current location as state
 */
const AdminProtectedRoute = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-blue" />
          <p className="mt-2 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not admin, redirect to admin login with the current location
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If admin, render the protected content
  return <Outlet />;
};

export default AdminProtectedRoute;
