import { API_CONFIG } from '../../config/apiConfig';

export const authApi = {
    /**
     * Verify token with backend
     */
    verifyToken: async (token: string) => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/test-auth`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid - redirect to Sphere SSO
                    localStorage.removeItem('token');
                    const appOrigin = window.location.origin;
                    const callback = `${appOrigin}/#/sso/callback`;
                    const redirectUrl = `${API_CONFIG.SPHERE_SSO_URL}?redirect=${encodeURIComponent(callback)}`;
                    window.location.replace(redirectUrl);
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
