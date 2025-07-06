export async function authFetch(url, options = {}, onLogout) {
  const token = localStorage.getItem('token');
  const baseURL = 'http://localhost:3000'; // Update this to match your backend port
  const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
  const headers = { ...options.headers, Authorization: token ? `Bearer ${token}` : undefined };
  const res = await fetch(fullURL, { ...options, headers });
  if (res.status === 401) {
    if (onLogout) onLogout();
    throw new Error('Session expired. Please log in again.');
  }
  return res;
} 