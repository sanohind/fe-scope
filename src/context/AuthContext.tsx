import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, normalizeUser } from '../services/api/authApi';
import { API_CONFIG } from '../config/apiConfig';
import { userManager } from '../auth/oidcConfig';
import { User as OidcUser } from 'oidc-client-ts';

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  image?: string | null;
  role?: {
    id: number;
    name: string;
    slug: string;
    level: number;
  };
  department?: {
    id: number;
    name: string;
    code: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token?: string) => Promise<void>; // SSO login (OIDC or JWT token)
  loginLocal: (username: string, password: string) => Promise<void>; // Local login
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;

  const login = async (newToken?: string) => {
    setIsLoading(true);
    
    // Check if OIDC is enabled (use VITE_ENABLE_SSO from .env)
    const oidcEnabled = import.meta.env.VITE_ENABLE_SSO === 'true';
    
    // If no token provided and OIDC is enabled, initiate OIDC flow
    if (!newToken && oidcEnabled) {
      try {
        await userManager.signinRedirect();
        return; // Will redirect to Sphere
      } catch (err) {
        console.error('OIDC login failed:', err);
        setIsLoading(false);
        throw err;
      }
    }
    
    // Legacy JWT token login
    if (newToken) {
      console.log('🔐 Login called with token:', newToken.substring(0, 20) + '...');
      setToken(newToken);
      localStorage.setItem('token', newToken);
      console.log('✅ Token saved to localStorage');

      try {
        console.log('📡 Fetching user data from API...');
        const response = await authApi.verifyToken(newToken);
        console.log('📥 Login - /auth/user API response:', response);
        if (response.success && response.user) {
          console.log('✅ Login - Setting user from API:', response.user);
          setUser(response.user);
        } else {
          console.log('⚠️ Login - No user data in response:', response);
        }
      } catch (error) {
        console.warn('❌ Login - Could not fetch user data:', error);
        throw error;
      } finally {
        setIsLoading(false);
        console.log('🏁 Login process complete');
      }
    } else {
      setIsLoading(false);
    }
  };

  const loginLocal = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/local-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.token && data.user) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(normalizeUser(data.user));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Local login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');

      // Check if OIDC is enabled
      const oidcEnabled = import.meta.env.VITE_ENABLE_SSO === 'true';
      
      if (oidcEnabled) {
        // Trigger OIDC logout
        await userManager.signoutRedirect();
      } else {
        // Fallback for legacy logout
        window.location.replace('/');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback
      window.location.replace('/');
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user?.role) {
      console.log('hasRole: No user or role found', { user, roles });
      return false;
    }
    
    const userRoleSlug = user.role.slug;
    const departmentCode = user.department?.code;
    
    // Direct role match
    if (roles.includes(userRoleSlug)) {
      return true;
    }
    
    // Check department-specific roles
    if (roles.includes('admin-warehouse') && userRoleSlug === 'admin' && departmentCode === 'WH') {
      return true;
    }
    if (roles.includes('operator-warehouse') && userRoleSlug === 'operator' && departmentCode === 'WH') {
      return true;
    }
    
    console.log('hasRole check:', { 
      userRole: userRoleSlug,
      department: departmentCode,
      requiredRoles: roles, 
      hasAccess: false
    });
    return false;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Build public path check
        const currentPath = window.location.hash
          ? window.location.hash.replace('#', '') || '/'
          : window.location.pathname;
        const publicRoutes = ['/signin', '/signup', '/sso/callback', '/callback'];
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        // Skip auth initialization for public routes
        if (isPublicRoute) {
            setIsLoading(false);
            return;
        }

        // Check if SSO is enabled via env (.env: VITE_ENABLE_SSO=true|false)
        const ssoEnabled = import.meta.env.VITE_ENABLE_SSO === 'true';
        const oidcEnabled = import.meta.env.VITE_ENABLE_SSO === 'true';

        if (!ssoEnabled) {
            console.log('SSO is disabled (Mock Mode). Setting up mock superadmin...');
            setToken('non-sso-mode');
            localStorage.setItem('token', 'non-sso-mode');

            // Set mock superadmin user for full access
            setUser({
                id: 1,
                name: 'Super Admin (Non Auth)',
                email: 'superadmin@besphere.com',
                username: 'superadmin',
                role: {
                    id: 1,
                    name: 'Superadmin',
                    slug: 'superadmin',
                    level: 1
                },
                department: {
                    id: 1,
                    name: 'Warehouse',
                    code: 'WH'
                }
            });

            setIsLoading(false);
            return;
        }

        // Check OIDC user if OIDC is enabled
        if (oidcEnabled) {
          // Check OIDC user - retry logic for race conditions
          let oidcUser = await userManager.getUser();
          
          // If user not found, wait a bit and retry (in case of race condition after redirect)
          if (!oidcUser || oidcUser.expired) {
            console.log("OIDC user not found on first try, retrying...");
            await new Promise(resolve => setTimeout(resolve, 200));
            oidcUser = await userManager.getUser();
          }
          
          if (oidcUser && !oidcUser.expired) {
            console.log("OIDC User found:", oidcUser);
            setToken(oidcUser.access_token);
            localStorage.setItem('token', oidcUser.access_token);
            
            // Fetch full profile from API if needed
            try {
               const response = await authApi.verifyToken(oidcUser.access_token);
               if (response.success && response.user) {
                  setUser(response.user);
               }
            } catch (e) {
                console.warn("Failed to fetch API profile:", e);
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to legacy JWT token
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          setToken(storedToken);
          
          try {
            const response = await authApi.verifyToken(storedToken);
            console.log('/auth/user API response:', response);
            if (response.success && response.user) {
              console.log('Setting user from API:', response.user);
              setUser(response.user);
            } else {
              console.log('No user data in response:', response);
              setToken(null);
              localStorage.removeItem('token');
            }
          } catch (error: any) {
            if (error?.status === 401) {
              setToken(null);
              localStorage.removeItem('token');
            } else {
              console.warn('Could not validate token with backend:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Events for OIDC
    const onUserLoaded = async (loadedUser: OidcUser) => {
        console.log('OIDC User loaded event', loadedUser);
        setToken(loadedUser.access_token);
        localStorage.setItem('token', loadedUser.access_token);
        try {
            const response = await authApi.verifyToken(loadedUser.access_token);
            if (response.success && response.user) {
                setUser(response.user);
            }
        } catch (e) {
            console.warn("Failed to fetch user profile after user loaded:", e);
        }
    };

    const onAccessTokenExpired = () => {
        console.log('Access token expired event');
        // Let silent renew handle it, or logout if failed
    };

    // Listen for custom event from SSOCallback
    const onCustomUserLoaded = async (event: CustomEvent) => {
        console.log('Custom OIDC user loaded event', event.detail);
        const userData = event.detail?.user;
        if (userData && userData.access_token) {
            setToken(userData.access_token);
            localStorage.setItem('token', userData.access_token);
            try {
                const response = await authApi.verifyToken(userData.access_token);
                if (response.success && response.user) {
                    setUser(response.user);
                }
            } catch (e) {
                console.warn("Failed to fetch user profile after custom user loaded:", e);
            }
        }
    };

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addAccessTokenExpired(onAccessTokenExpired);
    window.addEventListener('oidc-user-loaded', onCustomUserLoaded as unknown as EventListener);

    initializeAuth();

    return () => {
        userManager.events.removeUserLoaded(onUserLoaded);
        userManager.events.removeAccessTokenExpired(onAccessTokenExpired);
        window.removeEventListener('oidc-user-loaded', onCustomUserLoaded as unknown as EventListener);
    };
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    loginLocal,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
