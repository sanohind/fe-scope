import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * SSO Callback Handler
 * Handles the redirect from Sphere SSO login
 */
export default function SSOCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      // Mark as processed immediately
      hasProcessed.current = true;

      // Get token from URL query params
      const token = searchParams.get('token');
      
      if (!token) {
        console.error('No token received from SSO');
        navigate('/signin', { 
          replace: true,
          state: { error: 'Authentication failed: No token received' }
        });
        return;
      }

      try {
        console.log('SSO Callback: Processing token...');
        
        // Login with the token
        await login(token);
        
        console.log('SSO Callback: Login successful, redirecting...');
        
        // Redirect to dashboard or intended page
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        
        navigate(redirectTo, { replace: true });
      } catch (error) {
        console.error('SSO login failed:', error);
        hasProcessed.current = false; // Allow retry
        navigate('/signin', { 
          replace: true,
          state: { error: 'Authentication failed' }
        });
      }
    };

    handleCallback();
  }, []); // Empty dependency array - only run once

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Authenticating with Sphere SSO...</p>
      </div>
    </div>
  );
}
