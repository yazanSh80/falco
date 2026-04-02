/**
 * Admin Services Configuration
 * 
 * Controls demo mode vs real API behavior globally
 * Set DEMO_MODE=false to use real backend API endpoints
 */

// Can be driven by environment variable VITE_DEMO_MODE
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// API base URL - will be used when DEMO_MODE=false
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

// Create headers with auth token
export const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API error handler
export const handleApiError = (error: any): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An error occurred';
};
