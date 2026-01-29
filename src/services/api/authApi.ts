import { API_CONFIG } from '../../config/apiConfig';

export const authApi = {
    /**
     * Verify token with backend
     */
    verifyToken: async (token: string) => {
        try {
            // Use different endpoint based on SSO setting
            const endpoint = API_CONFIG.ENABLE_SSO 
                ? `${API_CONFIG.BASE_URL}/api/auth/user`  // SSO endpoint (JWT)
                : `${API_CONFIG.BASE_URL}/api/local-auth/me`;  // Local auth endpoint (Sanctum)

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    
                    if (API_CONFIG.ENABLE_SSO) {
                        // SSO Mode: Redirect to Sphere SSO
                        const appOrigin = window.location.origin;
                        const callback = `${appOrigin}/#/sso/callback`;
                        const redirectUrl = `${API_CONFIG.SPHERE_SSO_URL}?redirect=${encodeURIComponent(callback)}`;
                        window.location.replace(redirectUrl);
                    } else {
                        // Local Auth Mode: Redirect to signin
                        window.location.replace('/#/signin');
                    }
                    
                    throw new Error('Unauthorized - redirecting to login');
                }

                const errorData = await response.json().catch(() => ({}));
                throw {
                    message: errorData.message || 'Token verification failed',
                    status: response.status,
                };
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            if (error.message === 'Unauthorized - redirecting to login') {
                throw error;
            }
            throw {
                message: error.message || 'Token verification failed',
                status: error.status || 500,
            };
        }
    },
};

export default authApi;
