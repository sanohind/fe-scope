export const API_CONFIG = {
  // BASE_URL: "http://be-scope.ns1.sanoh.co.id",
  BASE_URL: "http://127.0.0.1:8005",
  SPHERE_SSO_URL: import.meta.env.VITE_SPHERE_SSO_URL || "http://127.0.0.1:8001/sso/login",
  ENABLE_SSO: import.meta.env.VITE_ENABLE_SSO === 'true', // Convert string to boolean
};

export default API_CONFIG;
