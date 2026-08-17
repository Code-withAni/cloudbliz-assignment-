const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export type UserRole = 'admin' | 'staff';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // non-JSON error body, keep the default message
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  login(data: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  me(token: string) {
    return request<{ user: AuthUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
