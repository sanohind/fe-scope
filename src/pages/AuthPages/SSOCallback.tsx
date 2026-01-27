import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';

export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle URL cleanup for Sphere redirect quirks
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
    
    // Case 2: /sso/callback?token=...#/supplier-contacts (hash in URL after query)
    if (pathname === '/sso/callback' && hash && !hash.startsWith('#/sso/callback')) {
      const redirectPath = hash.replace('#', '');
      if (redirectPath && redirectPath !== '/sso/callback') {
        sessionStorage.setItem('sso_redirect_path', redirectPath);
      }
      const cleanSearch = search.split('#')[0];
      window.location.replace('#' + pathname + cleanSearch);
      return;
    }
    
    // Case 3: #/sso/callback?token=...#/supplier-contacts (hash contains both)
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
           // If no token in searchParams, check if we are in a state where useEffect above is redirecting
           // We can just wait or show error if reasonable time passed.
           // For now, if clean URL logic is working, we might get token in next render or via hash params parsing if needed.
           // But useSearchParams should work with HashRouter if ?token= is after #/route?token=.
           // If it is before #, useSearchParams might not catch it in HashRouter depending on config.
           // Let's rely on standard searchParams for now.
           
           // Fallback: check window.location.href for token if searchParams is empty (sometimes happens with hybrid routing)
           const url = new URL(window.location.href);
           const tokenFromUrl = url.searchParams.get('token');
           if (!tokenFromUrl) {
               setError('No token provided');
               setLoading(false);
               return;
           }
           // Use found token
           // continue...
           return; 
        }

        // Verify token with backend
        const response = await authApi.verifyToken(token);
        
        if (response.success) {
          // Store token and user
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Redirect
          const redirectPath = sessionStorage.getItem('sso_redirect_path');
          sessionStorage.removeItem('sso_redirect_path');
          navigate(redirectPath || '/');
        } else {
          throw new Error('Verification failed');
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'SSO callback failed');
        setLoading(false);
      }
    };
    
    // Only run if we are in the correct route/hash state to avoid running during redirect ops
    if (window.location.hash.includes('/sso/callback')) {
        handleSSOCallback();
    }
  }, [searchParams, navigate]);

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
           <div className="text-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Verifying access...</p>
           </div>
        </div>
     );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
           <h3 className="mb-2 text-xl font-bold text-red-500">Authentication Failed</h3>
           <p className="text-gray-600 dark:text-gray-400">{error}</p>
           <button 
             onClick={() => navigate('/signin')}
             className="mt-6 rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
           >
             Back to Login
           </button>
        </div>
      </div>
    );
  }

  return null;
}
