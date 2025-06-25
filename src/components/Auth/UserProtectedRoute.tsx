import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/authUtils';

/**
 * Protected route component that checks if the user is authenticated as a regular user
 * If not, redirects to the user login page with the current location as state
 */
const UserProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging to help diagnose the issue
  console.log('UserProtectedRoute auth state:', { user, loading, path: location.pathname });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-blue" />
          <p className="mt-2 text-gray-600">Verifying user access...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and not an admin
  // For complete separation between user and admin authentication, we only consider
  // a user to be authenticated if they have a user token and are not an admin
  const isUserAuthenticated = !!user && user.role !== 'admin';
  
  // Check if user is an admin - this is used to redirect admins to the admin dashboard
  // even if they have a user token
  const isAdmin = !!user && user.role === 'admin';

  // If not logged in as a regular user, redirect to login with the current location
  if (!isUserAuthenticated) {
    console.log('User not authenticated as regular user, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is an admin, redirect to admin dashboard
  if (isAdmin) {
    console.log('User is admin, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }

  // If regular user, render the protected content
  console.log('User authenticated as regular user, rendering protected content');
  return <Outlet />;
};

export default UserProtectedRoute;
