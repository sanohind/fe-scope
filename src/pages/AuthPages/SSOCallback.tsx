import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/apiConfig';

export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compatibility fallback for URL cleanup
  useEffect(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    // Case 1: /sso/callback?token=... (without hash) - redirect to hash version
    if (pathname === '/sso/callback' && !hash) {
      const cleanSearch = search.split('#')[0];
      
      if (search.includes('#')) {
        const hashPart = search.split('#')[1];
        if (hashPart && hashPart.startsWith('/')) {
          sessionStorage.setItem('sso_redirect_path', hashPart);
        }
      }
      
      window.location.replace('#' + pathname + cleanSearch);
      return;
    }
    
    // Case 2: /sso/callback?token=...#/some-path
    if (pathname === '/sso/callback' && hash && !hash.startsWith('#/sso/callback')) {
      const redirectPath = hash.replace('#', '');
      if (redirectPath && redirectPath !== '/sso/callback') {
        sessionStorage.setItem('sso_redirect_path', redirectPath);
      }
      const cleanSearch = search.split('#')[0];
      window.location.replace('#' + pathname + cleanSearch);
      return;
    }
    
    // Case 3: #/sso/callback?token=...#/some-path
    if (hash && hash.includes('/sso/callback') && hash.includes('?')) {
      const hashParts = hash.split('#').filter(p => p);
      const callbackPart = hashParts.find(part => part.includes('/sso/callback'));
      const otherPart = hashParts.find(part => !part.includes('/sso/callback') && part.startsWith('/'));
      
      if (callbackPart && otherPart) {
        sessionStorage.setItem('sso_redirect_path', otherPart);
        const cleanHash = '#' + callbackPart.split('#')[0];
        if (window.location.hash !== cleanHash) {
          window.location.replace(cleanHash);
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleSSOCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No token provided');
          setLoading(false);
          return;
        }

        // Set token and fetch user
        await login(token);
        
        // Check for redirect path
        const redirectPath = sessionStorage.getItem('sso_redirect_path');
        if (redirectPath) {
          sessionStorage.removeItem('sso_redirect_path');
          navigate(redirectPath);
        } else {
          navigate('/');
        }

      } catch (err: any) {
        const errorMsg = err.message || 'SSO callback failed';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    handleSSOCallback();
  }, [searchParams, navigate, login]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Authentication Failed
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {error}
            </p>
            <button
              onClick={() => {
                const appOrigin = window.location.origin;
                const callback = `${appOrigin}/#/sso/callback`;
                window.location.href = `${API_CONFIG.SPHERE_SSO_URL}?redirect=${encodeURIComponent(callback)}`;
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
