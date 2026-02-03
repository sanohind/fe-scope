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
                    // Don't auto-redirect here - let ProtectedRoute handle it
                    // This prevents redirect loops
                    throw {
                        message: 'Unauthorized',
                        status: 401,
                    };
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
            throw {
                message: error.message || 'Token verification failed',
                status: error.status || 500,
            };
        }
    },
};

export default authApi;
