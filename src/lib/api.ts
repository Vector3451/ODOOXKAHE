// API utility for integrating with the Traveloop backend
const API_URL = 'http://localhost:5001/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || 'API Error');
  }

  return response.json();
}

export const authAPI = {
  login: (data: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchAPI('/auth/profile'),
};

export const tripAPI = {
  getAll: () => fetchAPI('/trips'),
  getById: (id: string) => fetchAPI(`/trips/${id}`),
  create: (data: any) => fetchAPI('/trips', { method: 'POST', body: JSON.stringify(data) }),
};

export const cityAPI = {
  getAll: (params?: any) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/cities${qs}`);
  },
};

export const communityAPI = {
  getPosts: () => fetchAPI('/community/posts'),
};
