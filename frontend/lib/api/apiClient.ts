const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1";

export interface ApiError {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("omniagent_token") : null;

  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorJson: ApiError;
    try {
      errorJson = await response.json();
    } catch {
      errorJson = { detail: response.statusText, status: response.status };
    }
    throw errorJson;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),

  delete: <T>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),
};
