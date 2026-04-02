# Admin API Contracts

> FalcoElectrec Admin Console - API Documentation  
> Version: 2.0.0  
> Last Updated: January 2025

This document defines the API contracts between the **Frontend Admin Console** and the **Flask Backend**. All endpoints are prefixed with `/api/admin` and require authentication with an `admin` or `super_admin` role JWT token.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard Endpoints](#dashboard-endpoints)
3. [Reports Endpoints](#reports-endpoints)
4. [Audit Log Endpoints](#audit-log-endpoints)
5. [SLA Monitoring Endpoints](#sla-monitoring-endpoints)
6. [Service Areas Endpoints](#service-areas-endpoints)
7. [Database Viewer Endpoints](#database-viewer-endpoints)
8. [Common Types](#common-types)
9. [Error Handling](#error-handling)

---

## Authentication

All admin API endpoints require a valid JWT token with admin or super_admin role.

### Headers Required

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Payload Structure

```typescript
interface JWTPayload {
  sub: string;           // User ID
  role: 'admin' | 'super_admin';
  exp: number;           // Expiration timestamp
  iat: number;           // Issued at timestamp
}
```

---

## Dashboard Endpoints

### GET /api/admin/health

Returns system health status and component availability.

**Response: `200 OK`**
```typescript
interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  backend: 'connected' | 'disconnected' | 'timeout';
  database: 'healthy' | 'slow' | 'error';
  cache: 'active' | 'inactive' | 'error';
  lastCheck: string;     // ISO 8601 timestamp
  latency: number;       // milliseconds
  uptime: string;        // formatted duration
}
```

**Example:**
```json
{
  "status": "healthy",
  "backend": "connected",
  "database": "healthy",
  "cache": "active",
  "lastCheck": "2025-01-15T10:30:00Z",
  "latency": 45,
  "uptime": "15 days, 3 hours"
}
```

---

### GET /api/admin/dashboard/stats

Returns comprehensive dashboard statistics.

**Response: `200 OK`**
```typescript
interface DashboardStatsResponse {
  overview: {
    total_users: number;
    total_engineers: number;
    total_customers: number;
    total_requests: number;
    pending_requests: number;
    active_requests: number;
    completed_requests: number;
    total_revenue: number;
    avg_rating: number;
  };
  
  role_distribution: {
    admins: number;
    engineers: number;
    customers: number;
  };
  
  risk_indicators: RiskIndicator[];
  
  platform_confidence: {
    score: number;         // 0-100
    factors: {
      name: string;
      weight: number;
      score: number;
      status: 'excellent' | 'good' | 'warning' | 'critical';
    }[];
    trend: 'up' | 'down' | 'stable';
    lastCalculated: string;
  };
  
  recent_activity: RecentActivity[];
}

interface RiskIndicator {
  id: string;
  label: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  threshold: number;
  description: string;
  trend: 'improving' | 'stable' | 'worsening';
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  severity: 'critical' | 'warning' | 'info';
  performedBy: string | null;
}
```

---

## Reports Endpoints

### GET /api/admin/reports/summary

Returns aggregated report data with trends and insights.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | Time period: `today`, `week`, `month`, `year`. Default: `month` |
| `compare` | boolean | No | Include comparison with previous period. Default: `false` |

**Response: `200 OK`**
```typescript
interface ReportsSummaryResponse {
  stats: StatItem[];
  trends: TrendData[];
  insights: InsightCard[];
  export_metadata: ExportMetadata;
}

interface StatItem {
  id: string;
  label: string;
  value: number;
  change?: number;        // percentage change from previous period
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: TrendData;
}

interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
  values: number[];       // historical values for chart
}

interface InsightCard {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'action';
  metric: string;
  trend: TrendData;
  priority: 'high' | 'medium' | 'low';
}

interface ExportMetadata {
  exportedBy: string;
  exportedAt: string;     // ISO 8601
  mode: 'Demo' | 'Live';
  period: string;
  filters?: Record<string, any>;
}
```

---

### GET /api/admin/reports/export

Exports report data in various formats.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | Export format: `csv`, `json`, `pdf` |
| `period` | string | No | Time period filter |
| `type` | string | No | Report type: `requests`, `revenue`, `users` |

**Response: `200 OK`** (varies by format)

For `csv`: Returns `text/csv` content  
For `json`: Returns JSON data  
For `pdf`: Returns `application/pdf` binary

---

## Audit Log Endpoints

### GET /api/admin/audit-logs

Returns paginated audit logs with filtering options.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number. Default: 1 |
| `per_page` | number | No | Items per page. Default: 20, Max: 100 |
| `severity` | string | No | Filter by severity: `critical`, `warning`, `info` |
| `action_type` | string | No | Filter by action type |
| `user_id` | number | No | Filter by user ID |
| `start_date` | string | No | Start date (ISO 8601) |
| `end_date` | string | No | End date (ISO 8601) |

**Response: `200 OK`**
```typescript
interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: PaginationInfo;
  filters_applied: Record<string, any>;
}

interface AuditLogEntry {
  id: number;
  action: string;
  action_type: string;
  severity: 'critical' | 'warning' | 'info';
  performed_by: {
    id: number;
    name: string;
    role: string;
  };
  target_user?: {
    id: number;
    name: string;
    role: string;
  };
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;     // ISO 8601
  admin_signature?: string;
}

interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
```

**Example:**
```json
{
  "logs": [
    {
      "id": 1234,
      "action": "User status changed to blocked",
      "action_type": "user_block",
      "severity": "critical",
      "performed_by": {
        "id": 1,
        "name": "Admin User",
        "role": "admin"
      },
      "target_user": {
        "id": 45,
        "name": "John Doe",
        "role": "customer"
      },
      "details": {
        "reason": "Policy violation",
        "previous_status": "active"
      },
      "ip_address": "192.168.1.1",
      "created_at": "2025-01-15T10:30:00Z",
      "admin_signature": "admin#1@10:30"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1547,
    "pages": 78,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## SLA Monitoring Endpoints

### GET /api/admin/sla/overview

Returns SLA metrics overview with gauges and breach data.

**Response: `200 OK`**
```typescript
interface SLAOverviewResponse {
  metrics: {
    response_rate: number;      // percentage
    completion_rate: number;    // percentage
    breach_rate: number;        // percentage
    avg_response_time: number;  // minutes
    avg_completion_time: number; // hours
  };
  
  thresholds: {
    response_time: number;      // minutes
    completion_time: number;    // hours
    breach_warning: number;     // percentage threshold
    breach_critical: number;    // percentage threshold
  };
  
  at_risk_requests: SLARequest[];
  
  recommendations: SLARecommendation[];
}

interface SLARequest {
  id: number;
  request_number: string;
  customer_name: string;
  engineer_name?: string;
  category: string;
  status: string;
  created_at: string;
  response_deadline: string;
  completion_deadline: string;
  time_remaining: number;       // minutes
  urgency: 'critical' | 'high' | 'medium' | 'low';
  sla_status: 'on_track' | 'at_risk' | 'breached';
}

interface SLARecommendation {
  id: string;
  type: 'warning' | 'suggestion' | 'action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    url: string;
  };
}
```

---

### GET /api/admin/sla/requests

Returns paginated list of requests with SLA status.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number. Default: 1 |
| `per_page` | number | No | Items per page. Default: 20 |
| `status` | string | No | Filter: `at_risk`, `breached`, `on_track` |
| `urgency` | string | No | Filter: `critical`, `high`, `medium`, `low` |

**Response: `200 OK`**
```typescript
interface SLARequestsResponse {
  requests: SLARequest[];
  pagination: PaginationInfo;
  summary: {
    total: number;
    at_risk: number;
    breached: number;
    on_track: number;
  };
}
```

---

## Service Areas Endpoints

### GET /api/admin/areas

Returns all service areas with health scores.

**Response: `200 OK`**
```typescript
interface AreasResponse {
  areas: ServiceArea[];
  summary: {
    total_areas: number;
    total_coverage: number;
    avg_health_score: number;
    critical_areas: number;
  };
}

interface ServiceArea {
  id: number;
  name: string;
  city: string;
  coverage: number;           // percentage
  engineers_count: number;
  active_requests: number;
  completed_requests: number;
  capacity_percent: number;   // percentage
  status: 'active' | 'limited' | 'unavailable';
  health_score: AreaHealthScore;
  created_at: string;
  updated_at: string;
}

interface AreaHealthScore {
  score: number;              // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  trend: 'improving' | 'stable' | 'declining';
  factors: {
    coverage: number;
    capacity: number;
    response_time: number;
    satisfaction: number;
  };
}
```

---

### POST /api/admin/areas

Create a new service area.

**Request Body:**
```typescript
interface CreateAreaRequest {
  name: string;
  city: string;
  coverage: number;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
    radius: number;
  };
}
```

**Response: `201 Created`**
```typescript
interface CreateAreaResponse {
  message: string;
  area: ServiceArea;
}
```

---

### PATCH /api/admin/areas/:id

Update an existing service area.

**Request Body:**
```typescript
interface UpdateAreaRequest {
  name?: string;
  city?: string;
  coverage?: number;
  status?: 'active' | 'limited' | 'unavailable';
  description?: string;
}
```

**Response: `200 OK`**
```typescript
interface UpdateAreaResponse {
  message: string;
  area: ServiceArea;
}
```

---

### DELETE /api/admin/areas/:id

Delete a service area (soft delete).

**Response: `200 OK`**
```json
{
  "message": "Area deleted successfully"
}
```

---

## Database Viewer Endpoints

> ⚠️ **Super Admin Only** - These endpoints require `super_admin` role.

### GET /api/admin/db/:table

Query database table with pagination and search.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name: `users`, `engineers`, `requests`, `transactions`, `reviews`, `blocks`, `notifications` |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number. Default: 1 |
| `per_page` | number | No | Items per page. Default: 20, Max: 100 |
| `q` | string | No | Search query |
| `sort` | string | No | Sort column |
| `order` | string | No | Sort order: `asc`, `desc`. Default: `asc` |

**Response: `200 OK`**
```typescript
interface DBQueryResponse {
  rows: DBTableRow[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
  table: string;
  columns: DBColumnInfo[];
}

type DBTableRow = Record<string, any>;

interface DBColumnInfo {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'status';
  sortable: boolean;
}
```

---

### GET /api/admin/db/:table/:id

Get detailed information for a specific row.

**Response: `200 OK`**
```typescript
interface DBRowDetailResponse {
  row: DBTableRow;
  relations: {
    [key: string]: DBTableRow[];
  };
  metadata: {
    table: string;
    primary_key: string;
    last_modified: string;
  };
}
```

---

### GET /api/admin/db/:table/export

Export table data as CSV.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Filter query |
| `columns` | string | No | Comma-separated column names |

**Response: `200 OK`**
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="users_export_2025-01-15.csv"
```

---

## Common Types

### Pagination Request

```typescript
interface PaginationRequest {
  page?: number;      // Default: 1
  per_page?: number;  // Default: 20, Max: 100
}
```

### Pagination Response

```typescript
interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
```

### User Reference

```typescript
interface UserRef {
  id: number;
  name: string;
  email?: string;
  role: 'customer' | 'engineer' | 'admin' | 'super_admin';
}
```

### Timestamp Fields

All timestamps are returned in ISO 8601 format:
```
2025-01-15T10:30:00Z
```

---

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

### Example Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Super admin access required",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**422 Validation Error:**
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": {
    "name": "Name is required",
    "coverage": "Coverage must be between 0 and 100"
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit |
|---------------|-------|
| Read operations | 100 requests/minute |
| Write operations | 20 requests/minute |
| Export operations | 10 requests/minute |

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

---

## Demo Mode Behavior

When `DEMO_MODE=true`:

1. All endpoints return realistic mock data
2. No actual database connections required
3. Simulated network latency (100-500ms)
4. Write operations are simulated (no persistence)
5. Export files contain demo data with watermarks

Frontend service layer handles demo mode transparently - same API calls work in both modes.

---

## Changelog

### v2.0.0 (January 2025)
- Added System Health endpoint
- Added Role Distribution data
- Added Risk Indicators
- Added Platform Confidence Score
- Enhanced Audit Logs with severity levels
- Added SLA Monitoring with recommendations
- Added Service Areas health scores
- Added Database Viewer for super admins
- Full demo mode support

### v1.0.0 (Initial Release)
- Basic CRUD operations
- User management
- Request management
- Reports and statistics
