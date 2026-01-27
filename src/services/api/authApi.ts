import { API_CONFIG } from "../../config/apiConfig";

const BASE_URL = API_CONFIG.BASE_URL;

export const authApi = {
  verifyToken: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  },
};
