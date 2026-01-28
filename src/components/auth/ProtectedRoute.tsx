import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/apiConfig';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // If SSO is disabled, bypass all authentication checks
  if (!API_CONFIG.ENABLE_SSO) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to Sphere SSO
  if (!isAuthenticated) {
    // Store the current path for redirect after login
    sessionStorage.setItem('sso_redirect_path', location.pathname + location.search);
    
    const appOrigin = window.location.origin;
    const callback = `${appOrigin}/#/sso/callback`;
    const sphereSsoUrl = API_CONFIG.SPHERE_SSO_URL;
    window.location.href = `${sphereSsoUrl}?redirect=${encodeURIComponent(callback)}`;
    
    return null;
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasRole(requiredRoles)) {
      // User doesn't have required role, show access denied or redirect
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                Access Denied
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
}
