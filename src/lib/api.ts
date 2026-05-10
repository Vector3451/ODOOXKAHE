// API utility for integrating with the Traveloop Flask backend
// Set VITE_API_URL in .env to change the backend host (see .env.example)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || error.error || 'API Error');
  }

  return response.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login:         (data: any) => fetchAPI('/auth/login',   { method: 'POST', body: JSON.stringify(data) }),
  register:      (data: any) => fetchAPI('/auth/register',{ method: 'POST', body: JSON.stringify(data) }),
  /** Returns { user: User } */
  getProfile:    ()          => fetchAPI('/auth/profile'),
  updateProfile: (data: any) => fetchAPI('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  logout:        ()          => fetchAPI('/auth/logout',  { method: 'POST' }),
};

// ── Trips ────────────────────────────────────────────────────────────────
// Backend returns: { id, title, destinations, startDate, endDate, totalBudget, status, coverImage }
export const tripAPI = {
  /** Returns { trips: Trip[], total: number } */
  getAll:  ()            => fetchAPI('/trips/'),
  /** Returns { trip: Trip } */
  getById: (id: string)  => fetchAPI(`/trips/${id}`),
  /** Returns { trip: Trip } */
  create:  (data: any)   => fetchAPI('/trips/', { method: 'POST', body: JSON.stringify(data) }),
  /** Returns { trip: Trip } */
  update:  (id: string, data: any) => fetchAPI(`/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete:  (id: string)  => fetchAPI(`/trips/${id}`, { method: 'DELETE' }),
};

// ── Expenses ──────────────────────────────────────────────────────────────
export const expenseAPI = {
  getForTrip: (tripId: string | number) =>
    fetchAPI(`/trips/${tripId}/expenses`),
  create: (tripId: string | number, data: any) =>
    fetchAPI(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Cities ────────────────────────────────────────────────────────────────
export const cityAPI = {
  getAll: (params?: any) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/cities${qs}`);
  },
  search: (query: string) =>
    fetchAPI(`/cities/search?q=${encodeURIComponent(query)}`),
};

// ── Community ─────────────────────────────────────────────────────────────
export const communityAPI = {
  getPosts:   ()          => fetchAPI('/community/posts'),
  createPost: (data: any) => fetchAPI('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => fetchAPI('/admin/analytics'),
};

// ── AI Planner ────────────────────────────────────────────────────────────
export const aiAPI = {
  generate: (data: any) => fetchAPI('/ai/generate', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Public Stats ──────────────────────────────────────────────────────────
export const publicAPI = {
  getStats: () => fetchAPI('/stats'),
};
