// API utility for integrating with the Traveloop backend
const API_URL = 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
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
      if (typeof window !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  search: (query: string) => fetchAPI(`/cities/search?q=${encodeURIComponent(query)}`),
};

export const communityAPI = {
  getPosts: () => fetchAPI('/community/posts'),
  createPost: (data: any) => fetchAPI('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
};

export const expenseAPI = {
  getForTrip: (tripId: string | number) => fetchAPI(`/trips/${tripId}/expenses`),
  create: (tripId: string | number, data: any) => fetchAPI(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
};

export const adminAPI = {
  getAnalytics: () => fetchAPI('/admin/analytics'),
};

export const aiAPI = {
  generate: (data: any) => fetchAPI('/ai/generate', { method: 'POST', body: JSON.stringify(data) }),
};

export const publicAPI = {
  getStats: () => fetchAPI('/stats'),
};
