import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '../services/api/authApi';
import { API_CONFIG } from '../config/apiConfig';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: {
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
  login: (token: string) => Promise<void>; // SSO login
  loginLocal: (username: string, password: string) => Promise<void>; // Local login
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;

  const login = async (newToken: string) => {
    console.log('🔐 Login called with token:', newToken.substring(0, 20) + '...');
    setIsLoading(true);
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
        setUser(data.user);
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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    
    // Don't auto-redirect - let ProtectedRoute handle it
    // This prevents redirect loops
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

    initializeAuth();
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
