/**
 * HTTP Client
 * 
 * Centralized HTTP client with:
 * - Base URL configuration
 * - Authentication header injection
 * - Standardized error handling
 * - Request/response interceptors
 */

import { API_BASE_URL, DEMO_MODE } from '../config/appMode';

// Get auth token from storage
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

// Standard headers
const createHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders
  };
};

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response handler
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData: any;

    try {
      errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Response body wasn't JSON
    }

    throw new ApiError(errorMessage, response.status, undefined, errorData);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
};

// HTTP methods
export const httpClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (DEMO_MODE) {
      throw new ApiError('API calls disabled in demo mode', 0, 'DEMO_MODE');
    }

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse<T>(response);
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    if (DEMO_MODE) {
      throw new ApiError('API calls disabled in demo mode', 0, 'DEMO_MODE');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });

    return handleResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    if (DEMO_MODE) {
      throw new ApiError('API calls disabled in demo mode', 0, 'DEMO_MODE');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });

    return handleResponse<T>(response);
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    if (DEMO_MODE) {
      throw new ApiError('API calls disabled in demo mode', 0, 'DEMO_MODE');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: createHeaders()
    });

    return handleResponse<T>(response);
  },

  /**
   * Download file as blob
   */
  async download(endpoint: string): Promise<Blob> {
    if (DEMO_MODE) {
      throw new ApiError('Downloads disabled in demo mode', 0, 'DEMO_MODE');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: createHeaders()
    });

    if (!response.ok) {
      throw new ApiError('Download failed', response.status);
    }

    return response.blob();
  }
};

/**
 * Helper to simulate API delay in demo mode
 */
export const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Error handler that extracts message
 */
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};
