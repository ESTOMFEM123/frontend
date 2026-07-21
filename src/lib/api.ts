const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-9bkz.onrender.com';
console.log('[API] VITE_API_URL=', import.meta.env.VITE_API_URL);
console.log('[API] Using API_BASE_URL=', API_BASE_URL);

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}/api${path}`;
  console.log('[API] Request', options.method || 'GET', url, 'token=', token ? 'yes' : 'no');

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('[API] Fetch failed:', error);
    throw new Error('Network request failed');
  }

  const data = await response.json().catch(() => ({}));
  console.log('[API] Response', response.status, data);

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  login: (payload: { email: string; password: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  getProfiles: () => request('/profiles'),
  getMyProfile: () => request('/profiles/me'),
  updateProfile: (payload: any) => request('/profiles/me', { method: 'PUT', body: JSON.stringify(payload) }),
  getSessions: () => request('/sessions'),
  createSession: (payload: any) => request('/sessions', { method: 'POST', body: JSON.stringify(payload) }),
  toggleSession: (id: string) => request(`/sessions/${id}/toggle`, { method: 'PUT' }),
  deleteSession: (id: string) => request(`/sessions/${id}`, { method: 'DELETE' }),
  markAttendance: (payload: any) => request('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),
  getAttendanceRecords: () => request('/attendance/all'),
  getMyAttendance: () => request('/attendance/me'),
};
