// Quick script to clear auth data
// Open browser console and run this

console.log('Clearing auth data...');
localStorage.removeItem('token');
localStorage.removeItem('user');
sessionStorage.removeItem('redirect_path');
sessionStorage.removeItem('sso_redirect_path');
console.log('✅ Auth data cleared!');
console.log('Please refresh the page.');
