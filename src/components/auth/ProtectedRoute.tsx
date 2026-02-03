import { ReactNode } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/apiConfig';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

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

  // Check if we're on the SSO callback page
  const currentPath = location.pathname + location.hash;
  const isCallbackPage = currentPath.includes('/sso/callback');

  // If not authenticated, show login UI
  if (!isAuthenticated && !isCallbackPage) {
    // Additional check: if token exists in localStorage but not yet in state,
    // wait for AuthContext to initialize (prevents race condition)
    const hasStoredToken = localStorage.getItem('token');
    
    if (!hasStoredToken) {
      // Show manual login UI instead of auto-redirect
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md p-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Authentication Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to login to access SCOPE.
              </p>
              <button
                onClick={() => {
                  // Store the current path for redirect after login
                  sessionStorage.setItem('redirect_path', location.pathname + location.search);
                  
                  const appOrigin = window.location.origin;
                  const callback = `${appOrigin}/#/sso/callback`;
                  const sphereSsoUrl = API_CONFIG.SPHERE_SSO_URL;
                  console.log('Redirecting to SSO:', `${sphereSsoUrl}?redirect=${encodeURIComponent(callback)}`);
                  window.location.href = `${sphereSsoUrl}?redirect=${encodeURIComponent(callback)}`;
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login with Sphere SSO
              </button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Current path: {currentPath}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Token exists but state not updated yet - show loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Authenticating...</p>
          <p className="mt-2 text-sm text-gray-500">Token found, validating...</p>
        </div>
      </div>
    );
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
