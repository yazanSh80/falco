/**
 * FalcoElectrec API Client
 * Handles all API communication with the Flask backend
 */

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Token storage keys
const TOKEN_KEY = 'falco_access_token';
const LEGACY_TOKEN_KEYS = ['access_token', 'token'];
const USER_KEY = 'falco_user';

/**
 * Get stored access token
 */
export function getToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token')
  );
}

/**
 * Store access token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.setItem(key, token));
}

/**
 * Remove stored token and user
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(USER_KEY);
}

/**
 * Get stored user
 */
export function getStoredUser(): any | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Store user data
 */
export function setStoredUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Base fetch wrapper with authentication
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    // Handle 401 - clear auth but DON'T force redirect
    // Let the calling code decide how to handle session expiry
    if (response.status === 401) {
      clearAuth();
      throw new ApiError('Session expired', 401, 'session_expired');
    }
    
    throw new ApiError(
      data.message || data.error || 'An error occurred',
      response.status,
      data.code
    );
  }
  
  return data;
}

// ==================== Auth API ====================

export const authApi = {
  async login(email: string, password: string) {
    const data = await apiFetch<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    setToken(data.access_token);
    setStoredUser(data.user);
    
    return data;
  },
  
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'engineer';
    phone?: string;
    city?: string;
    area?: string;
    specialization?: string;
    years_exp?: number;
  }) {
    const data = await apiFetch<{
      message: string;
      user: any;
      access_token?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.access_token) {
      setToken(data.access_token);
      setStoredUser(data.user);
    }
    
    return data;
  },
  
  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearAuth();
    }
  },
  
  async getMe() {
    return apiFetch<{ user: any }>('/auth/me');
  },
  
  async updateProfile(data: any) {
    return apiFetch<{ message: string; user: any }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ==================== Services API ====================

export const servicesApi = {
  async getFeatures(includeServices = false) {
    return apiFetch<{ features: any[] }>(
      `/services/features?include_services=${includeServices}`
    );
  },
  
  async getFeature(featureId: string) {
    return apiFetch<{ feature: any }>(`/services/features/${featureId}`);
  },
  
  async getServices(featureId?: string) {
    const params = featureId ? `?feature_id=${featureId}` : '';
    return apiFetch<{ services: any[] }>(`/services${params}`);
  },
  
  async getService(serviceId: string) {
    return apiFetch<{ service: any }>(`/services/${serviceId}`);
  },
  
  async getPriceList() {
    return apiFetch<{ price_list: any[] }>('/services/price-list');
  },
};

// ==================== Requests API ====================

export const requestsApi = {
  async create(data: {
    service_id?: string;
    type: 'quick' | 'late';
    request_intent?: 'book_service' | 'inspection' | 'project_special';
    category?: string;
    description: string;
    location_text: string;
    location_lat?: number;
    location_lng?: number;
  }) {
    return apiFetch<{ message: string; request: any }>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getAll(params?: { status?: string; view?: 'assigned' | 'available' }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.view) searchParams.append('view', params.view);
    const query = searchParams.toString();
    return apiFetch<{ requests: any[] }>(`/requests${query ? `?${query}` : ''}`);
  },
  
  async getById(id: number) {
    return apiFetch<{ request: any }>(`/requests/${id}`);
  },
  
  async accept(id: number) {
    return apiFetch<{ message: string; request: any }>(`/requests/${id}/accept`, {
      method: 'POST',
    });
  },
  
  async complete(id: number) {
    return apiFetch<{ message: string; request: any }>(`/requests/${id}/complete`, {
      method: 'POST',
    });
  },
  
  async cancel(id: number) {
    return apiFetch<{ message: string; request: any }>(`/requests/${id}`, {
      method: 'DELETE',
    });
  },
  
  async resend(id: number) {
    return apiFetch<{ message: string; request: any }>(`/requests/${id}/resend`, {
      method: 'POST',
    });
  },
};

// ==================== Reviews API ====================

export const reviewsApi = {
  async create(data: { request_id: number; rating: number; text?: string }) {
    return apiFetch<{ message: string; review: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getByUser(userId?: number, type?: 'received' | 'given') {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    if (type) params.append('type', type);
    const query = params.toString();
    return apiFetch<{ reviews: any[] }>(`/reviews${query ? `?${query}` : ''}`);
  },
};

// ==================== Blocks API ====================

export const blocksApi = {
  async create(blockedId: number, reason?: string) {
    return apiFetch<{ message: string; block: any }>('/blocks', {
      method: 'POST',
      body: JSON.stringify({ blocked_id: blockedId, reason }),
    });
  },
  
  async getAll() {
    return apiFetch<{ blocks: any[] }>('/blocks');
  },
  
  async remove(blockId: number) {
    return apiFetch<{ message: string }>(`/blocks/${blockId}`, {
      method: 'DELETE',
    });
  },
  
  async unblockUser(userId: number) {
    return apiFetch<{ message: string }>(`/blocks/user/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Notifications API ====================

export const notificationsApi = {
  async getAll(unreadOnly = false, limit?: number) {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread', 'true');
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return apiFetch<{ notifications: any[]; unread_count: number }>(
      `/notifications${query ? `?${query}` : ''}`
    );
  },
  
  async markRead(id: number) {
    return apiFetch<{ message: string; notification: any }>(
      `/notifications/${id}/read`,
      { method: 'POST' }
    );
  },
  
  async markAllRead() {
    return apiFetch<{ message: string }>('/notifications/read-all', {
      method: 'POST',
    });
  },
  
  async getUnreadCount() {
    return apiFetch<{ unread_count: number }>('/notifications/unread-count');
  },
};

// ==================== Finance API ====================

export const financeApi = {
  async getCustomerFinance() {
    return apiFetch<{ transactions: any[]; summary: any }>('/finance/customer');
  },
  
  async getEngineerFinance() {
    return apiFetch<{ transactions: any[]; summary: any }>('/finance/engineer');
  },
  
  async getAdminSummary() {
    return apiFetch<{
      summary: any;
      recent_transactions: any[];
      top_engineers: any[];
    }>('/finance/admin/summary');
  },
};

// ==================== Engineer API ====================

export const engineerApi = {
  async getProfile() {
    return apiFetch<{ user: any; profile: any; portfolio: any[] }>(
      '/engineer/profile'
    );
  },
  
  async updateProfile(data: any) {
    return apiFetch<{ message: string; profile: any; user: any }>(
      '/engineer/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },
  
  async getPortfolio() {
    return apiFetch<{ portfolio: any[] }>('/engineer/portfolio');
  },
  
  async addPortfolioItem(data: {
    title: string;
    description?: string;
    location?: string;
    image_url?: string;
  }) {
    return apiFetch<{ message: string; item: any }>('/engineer/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async deletePortfolioItem(id: number) {
    return apiFetch<{ message: string }>(`/engineer/portfolio/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getSubscription() {
    return apiFetch<{ subscription: any }>('/engineer/subscription');
  },
  
  async getPublicProfile(engineerId: number) {
    return apiFetch<{ engineer: any; portfolio: any[]; reviews: any[] }>(
      `/engineer/public/${engineerId}`
    );
  },
};

// ==================== Uploads API ====================

export const uploadsApi = {
  async upload(file: File, type: 'cv' | 'certificate' | 'portfolio' | 'photo') {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Upload failed', response.status);
    }
    
    return data as { message: string; url: string; filename: string };
  },
};

// ==================== Admin API ====================

export const adminApi = {
  async getPendingEngineers() {
    return apiFetch<{ pending_engineers: any[]; count: number }>(
      '/admin/engineers/pending'
    );
  },
  
  async acceptEngineer(engineerId: number) {
    return apiFetch<{ message: string; engineer: any }>(
      `/admin/engineers/${engineerId}/accept`,
      { method: 'POST' }
    );
  },
  
  async rejectEngineer(engineerId: number, reason?: string) {
    return apiFetch<{ message: string }>(
      `/admin/engineers/${engineerId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },
  
  async getUsers(params?: { role?: string; status?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    const query = searchParams.toString();
    return apiFetch<{ users: any[]; count: number }>(
      `/admin/users${query ? `?${query}` : ''}`
    );
  },
  
  async deleteUser(userId: number) {
    return apiFetch<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
  
  async blockUser(userId: number) {
    return apiFetch<{ message: string; user: any }>(
      `/admin/users/${userId}/block`,
      { method: 'POST' }
    );
  },
  
  async unblockUser(userId: number) {
    return apiFetch<{ message: string; user: any }>(
      `/admin/users/${userId}/unblock`,
      { method: 'POST' }
    );
  },
  
  async createAdmin(data: { name: string; email: string; password: string }) {
    return apiFetch<{ message: string; admin: any }>('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getAllReviews(params?: { min_rating?: number; max_rating?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.min_rating)
      searchParams.append('min_rating', params.min_rating.toString());
    if (params?.max_rating)
      searchParams.append('max_rating', params.max_rating.toString());
    const query = searchParams.toString();
    return apiFetch<{ reviews: any[]; count: number }>(
      `/admin/reviews${query ? `?${query}` : ''}`
    );
  },
  
  async getStats() {
    return apiFetch<{
      users: any;
      requests: any;
      reviews: any;
      finance: any;
    }>('/admin/stats');
  },
  
  // Area management
  async getAreas(includeInactive = false, includeStats = true) {
    const params = new URLSearchParams();
    params.append('include_inactive', includeInactive.toString());
    params.append('include_stats', includeStats.toString());
    return apiFetch<{ areas: any[]; count: number }>(`/admin/areas?${params}`);
  },
  
  async createArea(data: { name: string; name_ar?: string; description?: string; is_active?: boolean }) {
    return apiFetch<{ message: string; area: any }>('/admin/areas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updateArea(areaId: number, data: { name?: string; name_ar?: string; description?: string; is_active?: boolean }) {
    return apiFetch<{ message: string; area: any }>(`/admin/areas/${areaId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  async deleteArea(areaId: number) {
    return apiFetch<{ message: string }>(`/admin/areas/${areaId}`, {
      method: 'DELETE',
    });
  },
  
  // Reports
  async getReportsSummary() {
    return apiFetch<any>('/admin/reports/summary');
  },
  
  async getEngineersReport(params?: { sort_by?: string; sort_order?: string; area?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);
    if (params?.area) searchParams.append('area', params.area);
    if (params?.page) searchParams.append('page', params.page.toString());
    const query = searchParams.toString();
    return apiFetch<{ engineers: any[]; pagination: any }>(`/admin/reports/engineers${query ? `?${query}` : ''}`);
  },
  
  async getFinanceReport(days = 30) {
    return apiFetch<any>(`/admin/reports/finance?days=${days}`);
  },
  
  async getRequestsReport(params?: { status?: string; engineer_id?: number; customer_id?: number; date_from?: string; date_to?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.engineer_id) searchParams.append('engineer_id', params.engineer_id.toString());
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id.toString());
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.page) searchParams.append('page', params.page.toString());
    const query = searchParams.toString();
    return apiFetch<{ requests: any[]; pagination: any }>(`/admin/reports/requests${query ? `?${query}` : ''}`);
  },
  
  async getAreasReport() {
    return apiFetch<{ areas: any[]; count: number }>('/admin/reports/areas');
  },
  
  // Engineer permissions
  async updateEngineerPermissions(engineerId: number, data: {
    area?: string;
    is_available?: boolean;
    extend_subscription_days?: number;
    reset_subscription?: boolean;
  }) {
    return apiFetch<{ message: string; changes: string[]; engineer: any }>(`/admin/engineers/${engineerId}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  // Audit log
  async getAuditLog(params?: { action_type?: string; admin_id?: number; target_type?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.action_type) searchParams.append('action_type', params.action_type);
    if (params?.admin_id) searchParams.append('admin_id', params.admin_id.toString());
    if (params?.target_type) searchParams.append('target_type', params.target_type);
    if (params?.page) searchParams.append('page', params.page.toString());
    const query = searchParams.toString();
    return apiFetch<{ audit_logs: any[]; pagination: any }>(`/admin/audit-log${query ? `?${query}` : ''}`);
  },
  
  async getAuditActionTypes() {
    return apiFetch<{ action_types: string[] }>('/admin/audit-log/action-types');
  },

  // CSV Export
  async exportEngineersCSV() {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/export/engineers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    return blob;
  },

  async exportFinanceCSV(days = 30) {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/export/finance?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    return blob;
  },

  async exportRequestsCSV(params?: { days?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.append('days', params.days.toString());
    if (params?.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/export/requests${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    return blob;
  },

  async exportUsersCSV(role?: string) {
    const token = getToken();
    const url = role 
      ? `${API_URL}/admin/export/users?role=${role}`
      : `${API_URL}/admin/export/users`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    return blob;
  },

  // ==================== Super Admin - Full Database Visibility ====================
  
  async getEngineersFullData(params?: {
    search?: string;
    status?: string;
    subscription_status?: string;
    area?: string;
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.subscription_status) searchParams.append('subscription_status', params.subscription_status);
    if (params?.area) searchParams.append('area', params.area);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ engineers: any[]; pagination: any }>(`/admin/data/engineers/full${query ? `?${query}` : ''}`);
  },

  async getCustomersFullData(params?: {
    search?: string;
    status?: string;
    area?: string;
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.area) searchParams.append('area', params.area);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ customers: any[]; pagination: any }>(`/admin/data/customers/full${query ? `?${query}` : ''}`);
  },

  async getRequestsFullData(params?: {
    status?: string;
    type?: string;
    customer_id?: number;
    engineer_id?: number;
    date_from?: string;
    date_to?: string;
    sla_breached?: boolean;
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id.toString());
    if (params?.engineer_id) searchParams.append('engineer_id', params.engineer_id.toString());
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.sla_breached) searchParams.append('sla_breached', 'true');
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ requests: any[]; pagination: any }>(`/admin/data/requests/full${query ? `?${query}` : ''}`);
  },

  async getTransactionsFullData(params?: {
    customer_id?: number;
    engineer_id?: number;
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id.toString());
    if (params?.engineer_id) searchParams.append('engineer_id', params.engineer_id.toString());
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.min_amount) searchParams.append('min_amount', params.min_amount.toString());
    if (params?.max_amount) searchParams.append('max_amount', params.max_amount.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ transactions: any[]; pagination: any }>(`/admin/data/transactions/full${query ? `?${query}` : ''}`);
  },

  async getReviewsFullData(params?: {
    reviewer_id?: number;
    reviewee_id?: number;
    min_rating?: number;
    max_rating?: number;
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.reviewer_id) searchParams.append('reviewer_id', params.reviewer_id.toString());
    if (params?.reviewee_id) searchParams.append('reviewee_id', params.reviewee_id.toString());
    if (params?.min_rating) searchParams.append('min_rating', params.min_rating.toString());
    if (params?.max_rating) searchParams.append('max_rating', params.max_rating.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ reviews: any[]; pagination: any }>(`/admin/data/reviews/full${query ? `?${query}` : ''}`);
  },

  async getAllBlocks(params?: { page?: number; per_page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ blocks: any[]; pagination: any }>(`/admin/data/blocks${query ? `?${query}` : ''}`);
  },

  async getAllNotifications(params?: { user_id?: number; type?: string; page?: number; per_page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.append('user_id', params.user_id.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return apiFetch<{ notifications: any[]; pagination: any }>(`/admin/data/notifications${query ? `?${query}` : ''}`);
  },

  // ==================== Super Admin - User Access Control ====================

  async forceLogoutUser(userId: number) {
    return apiFetch<{ message: string; user_id: number }>(`/admin/users/${userId}/force-logout`, {
      method: 'POST',
    });
  },

  async disableUserLogin(userId: number) {
    return apiFetch<{ message: string; user: any }>(`/admin/users/${userId}/disable-login`, {
      method: 'POST',
    });
  },

  async resetEngineerSubscription(engineerId: number, days = 30) {
    return apiFetch<{ message: string; engineer: any }>(`/admin/engineers/${engineerId}/reset-subscription`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },

  async adminCancelRequest(requestId: number, reason?: string) {
    return apiFetch<{ message: string; request: any }>(`/admin/requests/${requestId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // ==================== Super Admin - Live Monitoring ====================

  async getLiveDashboard() {
    return apiFetch<{
      timestamp: string;
      active: {
        active_requests: number;
        pending_engineer_approvals: number;
        blocked_users: number;
        open_disputes: number;
      };
      today: {
        transactions: number;
        revenue: number;
        commission: number;
        new_users: number;
        requests: number;
      };
      totals: {
        total_users: number;
        total_customers: number;
        total_engineers: number;
        total_requests: number;
        total_revenue: number;
      };
      latest_requests: any[];
      latest_reviews: any[];
      latest_admin_actions: any[];
    }>('/admin/live/dashboard');
  },

  // SLA Monitoring
  async getSLADashboard() {
    return apiFetch<{
      summary: {
        active_requests: number;
        on_track: number;
        at_risk: number;
        breached: number;
        total_completed: number;
        response_breach_rate: number;
        completion_breach_rate: number;
      };
      at_risk_requests: any[];
      breached_requests: any[];
      on_track_requests: any[];
    }>('/admin/sla/dashboard');
  },

  async checkSLABreaches() {
    return apiFetch<{ message: string; breaches_found: number }>('/admin/sla/check-breaches', {
      method: 'POST',
    });
  },
};

// ==================== Recommendations API ====================

export interface RecommendedEngineer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  specialization: string;
  years_exp: number;
  bio: string;
  rating_avg: number;
  rating_count: number;
  jobs_completed: number;
  is_available: boolean;
  active_jobs: number;
  score: number;
  score_breakdown: {
    rating: { value: number; normalized: number; weighted: number; weight: string };
    jobs_completed: { value: number; normalized: number; weighted: number; weight: string };
    availability: { value: boolean; normalized: number; weighted: number; weight: string };
  };
  badges: Array<{
    type: string;
    label: string;
    icon: string;
    color: string;
  }>;
}

export const recommendationsApi = {
  async getRecommendedEngineers(params?: { service_id?: string; area?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.service_id) searchParams.append('service_id', params.service_id);
    if (params?.area) searchParams.append('area', params.area);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    return apiFetch<{ 
      engineers: RecommendedEngineer[]; 
      total_available: number;
      showing: number;
      filters: { area: string | null; service_id: string | null };
    }>(`/recommendations/engineers${query ? `?${query}` : ''}`);
  },

  async getSmartSuggestions(description: string) {
    return apiFetch<{
      suggested_service: {
        category: string;
        service_id: string;
        matched_keywords: string[];
        score: number;
      } | null;
      confidence: 'low' | 'medium' | 'high';
      all_matches: Array<{
        category: string;
        service_id: string;
        score: number;
        matched_keywords: string[];
      }>;
      urgency: {
        level: 'low' | 'medium' | 'high';
        score: number;
        reasons: string[];
      };
      recommended_type: 'quick' | 'late';
    }>('/recommendations/suggestions', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },
};

// ==================== Disputes API ====================

export interface Dispute {
  id: number;
  request_id: number;
  created_by: number;
  against_user_id: number;
  category: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
  resolution_action: string | null;
  resolution_notes: string | null;
  refund_amount: number | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: { id: number; name: string; email: string; role: string };
  against?: { id: number; name: string; email: string; role: string };
  resolved_by_user?: { id: number; name: string } | null;
  request?: {
    id: number;
    request_number: string;
    status: string;
    completed_at: string | null;
    service?: { id: string; name: string } | null;
  };
  audit_logs?: Array<{
    id: number;
    action: string;
    old_status: string | null;
    new_status: string | null;
    performer_name: string;
    details: string | null;
    created_at: string;
  }>;
}

export const disputesApi = {
  async create(data: {
    request_id: number;
    category: string;
    description: string;
  }) {
    return apiFetch<{ message: string; dispute: Dispute }>('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyDisputes(status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiFetch<{ disputes: Dispute[] }>(`/disputes${params}`);
  },

  async getDispute(id: number) {
    return apiFetch<{ dispute: Dispute }>(`/disputes/${id}`);
  },

  async canDispute(requestId: number) {
    return apiFetch<{ 
      can_dispute: boolean; 
      reason?: string; 
      days_remaining?: number;
      dispute_id?: number;
    }>(`/disputes/can-dispute/${requestId}`);
  },

  // Admin endpoints
  async getAllDisputes(params?: { status?: string; category?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.page) searchParams.append('page', params.page.toString());
    const query = searchParams.toString();
    return apiFetch<{ 
      disputes: Dispute[]; 
      pagination: { page: number; per_page: number; total: number; pages: number; has_next: boolean; has_prev: boolean };
    }>(`/admin/disputes${query ? `?${query}` : ''}`);
  },

  async getDisputeDetails(id: number) {
    return apiFetch<{ dispute: Dispute }>(`/admin/disputes/${id}`);
  },

  async updateStatus(id: number, status: string, notes?: string) {
    return apiFetch<{ message: string; dispute: Dispute }>(`/admin/disputes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  async resolve(id: number, data: {
    action: string;
    notes?: string;
    refund_amount?: number;
  }) {
    return apiFetch<{ message: string; dispute: Dispute; actions_taken: string[] }>(`/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async reject(id: number, notes?: string) {
    return apiFetch<{ message: string; dispute: Dispute }>(`/admin/disputes/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },
};

// ==================== Health Check ====================

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  auth: authApi,
  services: servicesApi,
  requests: requestsApi,
  reviews: reviewsApi,
  blocks: blocksApi,
  notifications: notificationsApi,
  finance: financeApi,
  engineer: engineerApi,
  uploads: uploadsApi,
  admin: adminApi,
  recommendations: recommendationsApi,
  disputes: disputesApi,
  checkHealth,
};
