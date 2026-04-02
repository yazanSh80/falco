/**
 * Admin Types
 * 
 * Comprehensive TypeScript interfaces for admin functionality.
 * These types match the expected API response shapes.
 */

// ========================================================================
// System Health Types
// ========================================================================
export type SystemStatus = 'online' | 'degraded' | 'offline';
export type BackendStatus = 'connected' | 'demo';

export interface SystemHealth {
  status: SystemStatus;
  backend: BackendStatus;
  lastSync: string;
  uptime: number;
  version: string;
  checks: {
    database: boolean;
    cache: boolean;
    storage: boolean;
  };
}

// ========================================================================
// Analytics & Reports Types
// ========================================================================
export interface AdminAnalytics {
  totalUsers: number;
  totalEngineers: number;
  totalCustomers: number;
  totalAdmins: number;
  activeUsers: number;
  verifiedEngineers: number;
  subscribedEngineers: number;
  totalRequests: number;
  pendingRequests: number;
  activeRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  totalReviews: number;
  averageRating: number;
  openDisputes: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayouts: number;
  platformFees: number;
}

export interface RoleDistribution {
  customers: number;
  engineers: number;
  admins: number;
  total: number;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  metric?: number;
  trend?: TrendData;
  actionLabel?: string;
  actionUrl?: string;
}

export interface PeriodComparison {
  currentPeriod: string;
  previousPeriod: string;
  metrics: {
    users: TrendData;
    requests: TrendData;
    revenue: TrendData;
    rating: TrendData;
  };
}

// ========================================================================
// Risk Indicators Types
// ========================================================================
export interface RiskIndicator {
  id: string;
  label: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionUrl: string;
}

export interface PlatformConfidence {
  score: number; // 0-100
  factors: {
    slaCompliance: number;
    disputeRate: number;
    approvalBacklog: number;
    customerSatisfaction: number;
  };
  explanation: string;
}

// ========================================================================
// Audit Log Types
// ========================================================================
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEvent {
  id: number;
  adminId: number;
  adminName: string;
  adminEmail: string;
  actionType: string;
  targetType: string;
  targetId: number;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  severity: AuditSeverity;
  performedBy: string; // "Name (Role)"
}

export interface AuditFilters {
  actionType?: string;
  targetType?: string;
  severity?: AuditSeverity;
  startDate?: string;
  endDate?: string;
}

// ========================================================================
// SLA Types
// ========================================================================
export interface SLAMetric {
  totalActive: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  onTrackPercent: number;
  atRiskPercent: number;
  breachedPercent: number;
}

export interface SLARequest {
  id: number;
  requestNumber: string;
  type: string;
  status: string;
  locationText: string;
  createdAt: string;
  acceptedAt: string | null;
  customer: { id: number; name: string; email: string } | null;
  engineer: { id: number; name: string; email: string } | null;
  sla: {
    responseDeadline: string | null;
    completionDeadline: string | null;
    responseBreached: boolean;
    completionBreached: boolean;
    responseTimeHours: number | null;
    completionTimeHours: number | null;
    status: 'on_track' | 'at_risk' | 'response_breached' | 'completion_breached';
    timeRemaining: string | null;
  };
}

export interface SLARecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionType: string;
  affectedCount: number;
}

// ========================================================================
// Service Area Types
// ========================================================================
export interface AreaStats {
  engineerCount: number;
  customerCount: number;
  requestCount: number;
  completedRequests: number;
  averageRating: number;
}

export interface AreaHealthScore {
  score: number; // 0-100
  coverage: 'excellent' | 'good' | 'fair' | 'poor';
  engineersAvailable: number;
  engineersRequired: number;
  capacityPercent: number;
}

export interface ServiceArea {
  id: number;
  name: string;
  nameAr: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  stats: AreaStats | null;
  health: AreaHealthScore | null;
}

// ========================================================================
// Database Viewer Types
// ========================================================================
export type DBTableName = 'users' | 'engineers' | 'requests' | 'transactions' | 'reviews' | 'blocks' | 'notifications' | 'contracts';

export interface DBTableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'json' | 'status';
  sortable: boolean;
}

export interface DBTableRow {
  id: number;
  [key: string]: any;
}

export interface DBTableConfig {
  name: DBTableName;
  label: string;
  icon: string;
  columns: DBTableColumn[];
  primaryKey: string;
}

export interface DBQueryParams {
  table: DBTableName;
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DBQueryResult {
  rows: DBTableRow[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

// ========================================================================
// Recent Activity Types
// ========================================================================
export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  severity: AuditSeverity;
  performedBy: string | null;
}

// ========================================================================
// Export Metadata Types
// ========================================================================
export interface ExportMetadata {
  exportedBy: string;
  exportedAt: string;
  mode: 'Demo' | 'Live';
  period: string;
  filters?: Record<string, any>;
}
