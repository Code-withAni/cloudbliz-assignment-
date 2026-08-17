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

function getToken(): string | null {
  try {
    return localStorage.getItem('cloudblitz.token');
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
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

export type EnquiryStatus = 'New' | 'In Progress' | 'Closed';

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  assignedTo: AssignedUser | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateEnquiryInput = {
  customerName: string;
  email: string;
  phone: string;
  message: string;
};

export type UpdateEnquiryInput = Partial<CreateEnquiryInput> & {
  status?: EnquiryStatus;
  assignedTo?: string | null;
};

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface EnquiryListParams {
  status?: EnquiryStatus;
  assignedTo?: string;
  search?: string;
}

export const enquiryApi = {
  list(params: EnquiryListParams = {}) {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.assignedTo) qs.set('assignedTo', params.assignedTo);
    if (params.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<{ enquiries: Enquiry[] }>(`/enquiries${query ? `?${query}` : ''}`);
  },
  get(id: string) {
    return request<{ enquiry: Enquiry }>(`/enquiries/${id}`);
  },
  create(data: CreateEnquiryInput) {
    return request<{ enquiry: Enquiry }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: UpdateEnquiryInput) {
    return request<{ enquiry: Enquiry }>(`/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  remove(id: string) {
    return request<{ message: string }>(`/enquiries/${id}`, {
      method: 'DELETE',
    });
  },
};

export const userApi = {
  list() {
    return request<{ users: UserSummary[] }>('/users');
  },
};
