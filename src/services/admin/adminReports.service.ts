/**
 * Admin Reports Service
 * 
 * Handles all reporting functionality including:
 * - Overview statistics
 * - Engineer reports
 * - Finance data
 * - Area reports
 * - CSV exports
 * 
 * Works in demo mode (mock data) and real API mode
 */

import { DEMO_MODE, API_BASE_URL, createAuthHeaders, handleApiError } from './config';

export interface ReportStats {
  total_users: number;
  total_engineers: number;
  total_customers: number;
  total_admins: number;
  active_users: number;
  verified_engineers: number;
  subscribed_engineers: number;
  total_requests: number;
  pending_requests: number;
  active_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  total_reviews: number;
  average_rating: number;
  open_disputes: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_payouts: number;
  platform_fees: number;
}

export interface EngineerReport {
  id: number;
  name: string;
  email: string;
  specialty: string;
  total_jobs: number;
  completed_jobs: number;
  average_rating: number;
  total_earnings: number;
  completion_rate: number;
}

export interface AreaReport {
  id: number;
  name: string;
  engineer_count: number;
  customer_count: number;
  request_count: number;
  is_active: boolean;
}

// Mock data generators
const generateMockReportStats = (): ReportStats => ({
  total_users: 1247,
  total_engineers: 523,
  total_customers: 724,
  total_admins: 3,
  active_users: 892,
  verified_engineers: 487,
  subscribed_engineers: 245,
  total_requests: 3847,
  pending_requests: 156,
  active_requests: 287,
  completed_requests: 3204,
  cancelled_requests: 200,
  total_reviews: 2985,
  average_rating: 4.7,
  open_disputes: 12,
  total_revenue: 125450,
  monthly_revenue: 18920,
  pending_payouts: 7850,
  platform_fees: 5970
});

const generateMockEngineerReports = (): EngineerReport[] => [
  { id: 1, name: 'Mohammed Atallah', email: 'mohammed@eng.com', specialty: 'Electrical Wiring', total_jobs: 127, completed_jobs: 125, average_rating: 4.9, total_earnings: 8950, completion_rate: 98.4 },
  { id: 2, name: 'Fatima Al-Rashid', email: 'fatima@eng.com', specialty: 'Solar Systems', total_jobs: 94, completed_jobs: 92, average_rating: 4.8, total_earnings: 7240, completion_rate: 97.9 },
  { id: 3, name: 'Khalil Nasser', email: 'khalil@eng.com', specialty: 'Industrial', total_jobs: 156, completed_jobs: 150, average_rating: 4.6, total_earnings: 11850, completion_rate: 96.2 },
  { id: 4, name: 'Aisha Mohammed', email: 'aisha@eng.com', specialty: 'Maintenance', total_jobs: 203, completed_jobs: 198, average_rating: 4.7, total_earnings: 12450, completion_rate: 97.5 },
  { id: 5, name: 'Omar Hassan', email: 'omar@eng.com', specialty: 'Installation', total_jobs: 87, completed_jobs: 85, average_rating: 4.5, total_earnings: 5620, completion_rate: 97.7 }
];

const generateMockAreaReports = (): AreaReport[] => [
  { id: 1, name: 'Ramallah - City Center', engineer_count: 45, customer_count: 187, request_count: 342, is_active: true },
  { id: 2, name: 'Bethlehem - Old City', engineer_count: 38, customer_count: 156, request_count: 278, is_active: true },
  { id: 3, name: 'Nablus - Downtown', engineer_count: 52, customer_count: 203, request_count: 421, is_active: true },
  { id: 4, name: 'Jenin - Industrial Zone', engineer_count: 28, customer_count: 94, request_count: 156, is_active: true },
  { id: 5, name: 'Tulkarm - Residential', engineer_count: 35, customer_count: 128, request_count: 245, is_active: true },
  { id: 6, name: 'Qalqilya - Downtown', engineer_count: 22, customer_count: 87, request_count: 112, is_active: false }
];

class AdminReportsService {
  async getReportStats(): Promise<ReportStats> {
    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return generateMockReportStats();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/summary`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch report stats');
      const summary = await response.json();
      const users = summary.users || {};
      const requests = summary.requests || {};
      const reviews = summary.reviews || {};
      const finance = summary.finance || {};
      const disputes = summary.disputes || {};

      return {
        total_users: (users.total_customers || 0) + (users.total_engineers || 0) + (users.total_admins || 0),
        total_engineers: users.total_engineers || 0,
        total_customers: users.total_customers || 0,
        total_admins: users.total_admins || 0,
        active_users: (users.active_customers || 0) + (users.active_engineers || 0),
        verified_engineers: users.active_engineers || 0,
        subscribed_engineers: users.active_engineers || 0,
        total_requests: requests.total || 0,
        pending_requests: requests.pending || 0,
        active_requests: (requests.accepted || 0) + (requests.in_progress || 0),
        completed_requests: requests.completed || 0,
        cancelled_requests: requests.cancelled || 0,
        total_reviews: reviews.total || 0,
        average_rating: reviews.average_rating || 0,
        open_disputes: (disputes.open || 0) + (disputes.in_review || 0),
        total_revenue: finance.total_revenue || 0,
        monthly_revenue: finance.revenue_this_month || 0,
        pending_payouts: 0,
        platform_fees: finance.total_commission || 0
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEngineerReports(sortBy: string = 'total_jobs'): Promise<EngineerReport[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = generateMockEngineerReports();
      
      // Sort by requested field
      return data.sort((a: any, b: any) => {
        if (sortBy === 'completion_rate') return b.completion_rate - a.completion_rate;
        if (sortBy === 'average_rating') return b.average_rating - a.average_rating;
        if (sortBy === 'total_earnings') return b.total_earnings - a.total_earnings;
        return b.total_jobs - a.total_jobs;
      });
    }

    try {
      const params = new URLSearchParams({ sort_by: sortBy });
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/engineers?${params}`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch engineer reports');
      const data = await response.json();
      const engineers = data.engineers || data;
      return engineers.map((engineer: any) => {
        const completedJobs = engineer.jobs_completed || engineer.completed_jobs || 0;
        const activeJobs = engineer.active_jobs || 0;
        const totalJobs = engineer.total_jobs || completedJobs + activeJobs;
        return {
          id: engineer.id,
          name: engineer.name,
          email: engineer.email,
          specialty: engineer.specialization || engineer.specialty || '',
          total_jobs: totalJobs,
          completed_jobs: completedJobs,
          average_rating: engineer.rating_avg || engineer.average_rating || 0,
          total_earnings: engineer.total_earnings || 0,
          completion_rate: totalJobs ? Math.round((completedJobs / totalJobs) * 1000) / 10 : 0
        };
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAreaReports(): Promise<AreaReport[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return generateMockAreaReports();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/areas`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch area reports');
      const data = await response.json();
      return data.areas || data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportEngineersCSV(): Promise<Blob> {
    if (DEMO_MODE) {
      // Generate mock CSV
      const engineers = generateMockEngineerReports();
      const csv = [
        ['ID', 'Name', 'Email', 'Specialty', 'Total Jobs', 'Completed', 'Rating', 'Earnings', 'Completion Rate'],
        ...engineers.map(e => [e.id, e.name, e.email, e.specialty, e.total_jobs, e.completed_jobs, e.average_rating, e.total_earnings, `${e.completion_rate}%`])
      ].map(row => row.join(',')).join('\n');
      
      return new Blob([csv], { type: 'text/csv' });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/export/engineers`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to export');
      return response.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportFinanceCSV(days: number = 30): Promise<Blob> {
    if (DEMO_MODE) {
      const csv = [
        ['Date', 'Type', 'Amount', 'Description'],
        ['2025-12-24', 'Request Completed', '250', 'Wiring Service'],
        ['2025-12-23', 'Request Completed', '350', 'Solar Installation'],
        ['2025-12-22', 'Request Completed', '180', 'Maintenance'],
        ['2025-12-21', 'Request Completed', '420', 'Industrial Upgrade']
      ].map(row => row.join(',')).join('\n');
      
      return new Blob([csv], { type: 'text/csv' });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/export/finance?days=${days}`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to export');
      return response.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportRequestsCSV(options: { days?: number } = {}): Promise<Blob> {
    if (DEMO_MODE) {
      const csv = [
        ['ID', 'Type', 'Status', 'Customer', 'Engineer', 'Date', 'Amount'],
        ['R-001', 'Wiring', 'Completed', 'Ahmed Ali', 'Mohammed Atallah', '2025-12-24', '250'],
        ['R-002', 'Solar', 'Active', 'Fatima Khan', 'Khalil Nasser', '2025-12-23', '1200'],
        ['R-003', 'Maintenance', 'Completed', 'Omar Hassan', 'Aisha Mohammed', '2025-12-22', '180']
      ].map(row => row.join(',')).join('\n');
      
      return new Blob([csv], { type: 'text/csv' });
    }

    try {
      const params = new URLSearchParams(Object.entries(options).map(([k, v]) => [k, String(v)]));
      const response = await fetch(`${API_BASE_URL}/api/admin/export/requests?${params}`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to export');
      return response.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async exportUsersCSV(): Promise<Blob> {
    if (DEMO_MODE) {
      const csv = [
        ['ID', 'Name', 'Email', 'Role', 'Status', 'Created'],
        ['U-001', 'Ahmed Ali', 'ahmed@test.com', 'customer', 'active', '2025-01-15'],
        ['U-002', 'Fatima Khan', 'fatima@test.com', 'customer', 'active', '2025-01-20'],
        ['E-001', 'Mohammed Atallah', 'mohammed@eng.com', 'engineer', 'active', '2025-01-10']
      ].map(row => row.join(',')).join('\n');
      
      return new Blob([csv], { type: 'text/csv' });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/export/users`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to export');
      return response.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const adminReportsService = new AdminReportsService();
