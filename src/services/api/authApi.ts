import { API_CONFIG } from '../../config/apiConfig';

/** Normalized user shape for both SSO and non-SSO API responses */
export interface NormalizedUser {
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

/**
 * Normalize user from API so dropdown works for both SSO and non-SSO.
 * SSO /api/auth/user may use different field names (e.g. preferred_username, display_name).
 */
export function normalizeUser(raw: any): NormalizedUser {
    if (!raw || typeof raw !== 'object') {
        return {
            id: 0,
            name: 'User',
            email: '',
        };
    }
    const name =
        raw.name ??
        raw.display_name ??
        raw.full_name ??
        ([raw.given_name, raw.family_name].filter(Boolean).join(' ') || 'User');
    const email = raw.email ?? raw.email_address ?? '';
    const username =
        raw.username ??
        raw.preferred_username ??
        raw.user_name ??
        (email ? email.split('@')[0] : undefined);
    const image = raw.image ?? raw.avatar ?? raw.avatar_url ?? raw.picture ?? raw.photo_url ?? null;

    let role = raw.role;
    if (role && typeof role === 'string') {
        role = { id: 0, name: role, slug: role.toLowerCase().replace(/\s+/g, '-'), level: 0 };
    }
    if (role && typeof role === 'object' && !role.slug) {
        role = {
            id: role.id ?? 0,
            name: role.name ?? 'User',
            slug: (role.slug ?? role.name ?? 'user').toString().toLowerCase().replace(/\s+/g, '-'),
            level: role.level ?? 0,
        };
    }

    return {
        id: raw.id ?? 0,
        name,
        email,
        username: username || undefined,
        image: image || undefined,
        role: role || undefined,
        department: raw.department || undefined,
    };
}

export const authApi = {
    /**
     * Verify token with backend.
     * Returns normalized user so UI works for both SSO and non-SSO.
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
            // Normalize user for both SSO and non-SSO response shapes
            if (data.user) {
                data.user = normalizeUser(data.user);
            }
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
