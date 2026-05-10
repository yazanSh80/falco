/**
 * FalcoElectrec API Types
 * Centralized type definitions for API responses and requests
 */

// ==================== User Types ====================

export type UserRole = 'customer' | 'engineer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  area?: string;
  avatar?: string;
  created_at: string;
  updated_at?: string;
}

export interface EngineerProfile extends User {
  role: 'engineer';
  specialization: string;
  years_exp: number;
  bio?: string;
  rating: number;
  total_jobs: number;
  status: 'pending' | 'accepted' | 'rejected';
  subscription_status: 'active' | 'expired';
  subscription_expires?: string;
  cv_url?: string;
  certificate_url?: string;
}

export interface CustomerProfile extends User {
  role: 'customer';
}

export interface AdminProfile extends User {
  role: 'admin';
}

// ==================== Auth Types ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'engineer';
  phone?: string;
  city?: string;
  area?: string;
  specialization?: string;
  years_exp?: number;
}

export interface RegisterResponse {
  message: string;
  user: User;
  access_token?: string;
}

// ==================== Service Types ====================

export interface Feature {
  id: string;
  name: string;
  name_ar?: string;
  icon: string;
  description?: string;
  services_count?: number;
}

export interface Service {
  id: string;
  feature_id: string;
  name: string;
  name_ar?: string;
  description?: string;
  base_price: number;
  domain?: string;
  service_kind?: string;
  pricing_mode?: string;
  complexity?: string;
  requires_visit?: boolean;
  is_core?: boolean;
  unit?: string;
  is_active: boolean;
}

export interface PriceListItem {
  feature: string;
  services: {
    id?: string;
    name: string;
    price: number;
    domain?: string;
    service_kind?: string;
    pricing_mode?: string;
    complexity?: string;
    requires_visit?: boolean;
    is_core?: boolean;
    unit?: string;
  }[];
}

// ==================== Request Types ====================

export type RequestType = 'quick' | 'late';
export type RequestIntent = 'book_service' | 'inspection' | 'project_special';
export type RequestStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'routed'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  type: RequestType;
  urgency: RequestType;
  request_intent: RequestIntent;
  status: RequestStatus;
  customer_id: string;
  customer_name: string;
  engineer_id?: string;
  engineer_name?: string;
  service_id?: string | null;
  service_name?: string | null;
  feature_id?: string | null;
  feature_name?: string | null;
  description?: string;
  location: string;
  city: string;
  area: string;
  price: number;
  scheduled_date?: string;
  scheduled_time?: string;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface CreateRequestPayload {
  type: RequestType;
  request_intent?: RequestIntent;
  service_id?: string;
  description?: string;
  location: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

// ==================== Review Types ====================

export interface Review {
  id: string;
  request_id: string;
  customer_id: string;
  customer_name: string;
  engineer_id: string;
  engineer_name: string;
  rating: number;
  comment?: string;
  service_name: string;
  created_at: string;
}

export interface CreateReviewPayload {
  request_id: string;
  rating: number;
  comment?: string;
}

// ==================== Transaction Types ====================

export interface Transaction {
  id: string;
  request_id: string;
  customer_id: string;
  customer_name: string;
  engineer_id: string;
  engineer_name: string;
  service_name: string;
  amount: number;
  commission: number;
  net_amount: number;
  type: 'payment' | 'commission' | 'subscription';
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

export interface FinanceSummary {
  total_earnings: number;
  total_commission: number;
  net_earnings: number;
  pending_amount: number;
  transaction_count: number;
}

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  user_id: string;
  type: 'request' | 'review' | 'payment' | 'system' | 'subscription';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ==================== Block Types ====================

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked_name: string;
  blocked_email: string;
  blocked_role: UserRole;
  reason?: string;
  created_at: string;
}

// ==================== Portfolio Types ====================

export interface PortfolioItem {
  id: string;
  engineer_id: string;
  title: string;
  description?: string;
  location?: string;
  image_url?: string;
  created_at: string;
}

// ==================== Admin Types ====================

export interface PendingEngineer extends EngineerProfile {
  status: 'pending';
  cv_url?: string;
  certificate_url?: string;
}

export interface PlatformStats {
  total_users: number;
  total_customers: number;
  total_engineers: number;
  total_admins: number;
  pending_engineers: number;
  total_requests: number;
  completed_requests: number;
  total_revenue: number;
  total_commission: number;
}

export interface AdminActionLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: 'user' | 'request' | 'review' | 'system';
  target_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// ==================== Dispute Types ====================

export interface Dispute {
  id: string;
  request_id: string;
  initiated_by: string;
  initiator_name: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ==================== Error Types ====================

export interface ApiErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
