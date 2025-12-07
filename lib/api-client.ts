/**
 * API Client for making authenticated requests to backend
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(response.status, data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => fetchAPI('/api/auth/me'),
};

// Contacts API
export const contactsAPI = {
  list: () => fetchAPI('/api/contacts'),

  create: (data: { name: string; email?: string; phone?: string; notes?: string }) =>
    fetchAPI('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Schedules API
export const schedulesAPI = {
  list: (params?: { status?: string; type?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/api/schedules${query}`);
  },

  get: (id: string) => fetchAPI(`/api/schedules/${id}`),

  create: (data: any) =>
    fetchAPI('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchAPI(`/api/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI(`/api/schedules/${id}`, {
      method: 'DELETE',
    }),
};

// Scheduler API
export const schedulerAPI = {
  trigger: () => fetchAPI('/api/scheduler', { method: 'POST' }),
};
