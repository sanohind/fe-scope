// Debug script - paste this in browser console (F12)

console.log('=== SCOPE Auth Debug ===');
console.log('1. Environment Variables:');
console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('   VITE_ENABLE_SSO:', import.meta.env.VITE_ENABLE_SSO);
console.log('   VITE_SPHERE_SSO_URL:', import.meta.env.VITE_SPHERE_SSO_URL);

console.log('\n2. API Config:');
console.log('   BASE_URL:', window.API_CONFIG?.BASE_URL || 'Not available');
console.log('   ENABLE_SSO:', window.API_CONFIG?.ENABLE_SSO || 'Not available');

console.log('\n3. LocalStorage:');
console.log('   token:', localStorage.getItem('token'));
console.log('   user:', localStorage.getItem('user'));

console.log('\n4. SessionStorage:');
console.log('   redirect_path:', sessionStorage.getItem('redirect_path'));

console.log('\n=== End Debug ===');
