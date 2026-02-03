export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8002",
  SPHERE_SSO_URL: import.meta.env.VITE_SPHERE_SSO_URL || "http://127.0.0.1:8000/sso/login",
  ENABLE_SSO: import.meta.env.VITE_ENABLE_SSO === 'true', // Convert string to boolean
};

export default API_CONFIG;
