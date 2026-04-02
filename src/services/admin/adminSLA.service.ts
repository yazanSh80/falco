/**
 * Admin SLA Monitoring Service
 * 
 * Handles SLA tracking and breach detection
 * Real API endpoints:
 * - GET /api/admin/sla/dashboard
 * - POST /api/admin/sla/check-breaches
 */

import { DEMO_MODE, API_BASE_URL, createAuthHeaders, handleApiError } from './config';

export interface SLARequest {
  id: number;
  request_number: string;
  type: string;
  status: string;
  location_text: string;
  created_at: string;
  accepted_at: string | null;
  customer?: { id: number; name: string; email: string };
  engineer?: { id: number; name: string; email: string };
  sla?: {
    response_deadline: string | null;
    completion_deadline: string | null;
    response_breached: boolean;
    completion_breached: boolean;
    response_time_hours: number | null;
    completion_time_hours: number | null;
    status: string;
  };
}

export interface SLASummary {
  active_requests: number;
  on_track: number;
  at_risk: number;
  breached: number;
  total_completed: number;
  response_breach_rate: number;
  completion_breach_rate: number;
}

export interface SLADashboard {
  summary: SLASummary;
  at_risk_requests: SLARequest[];
  breached_requests: SLARequest[];
}

// Mock data generators
const generateMockSLARequest = (id: number, breached: boolean = false): SLARequest => {
  const types = ['Wiring', 'Solar', 'Maintenance', 'Installation'];
  const statuses = ['active', 'pending', 'in_progress'];
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 3600000);
  
  return {
    id,
    request_number: `R-${String(id).padStart(5, '0')}`,
    type: types[id % types.length],
    status: statuses[id % statuses.length],
    location_text: `Area ${(id % 10) + 1}`,
    created_at: createdAt.toISOString(),
    accepted_at: new Date(createdAt.getTime() + 3600000).toISOString(),
    customer: {
      id: id,
      name: `Customer ${id}`,
      email: `customer${id}@test.com`
    },
    engineer: {
      id: (id % 20) + 1,
      name: `Engineer ${(id % 20) + 1}`,
      email: `engineer${(id % 20) + 1}@eng.com`
    },
    sla: {
      response_deadline: new Date(createdAt.getTime() + 4 * 3600000).toISOString(),
      completion_deadline: new Date(createdAt.getTime() + 48 * 3600000).toISOString(),
      response_breached: breached,
      completion_breached: false,
      response_time_hours: breached ? 6 : 2,
      completion_time_hours: breached ? null : 12,
      status: breached ? 'response_breached' : 'on_track'
    }
  };
};

class AdminSLAService {
  async getDashboard(): Promise<SLADashboard> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const breachedRequests = [
        generateMockSLARequest(101, true),
        generateMockSLARequest(102, true),
        generateMockSLARequest(103, true)
      ];
      
      const atRiskRequests = [
        generateMockSLARequest(201, false),
        generateMockSLARequest(202, false),
        generateMockSLARequest(203, false),
        generateMockSLARequest(204, false),
        generateMockSLARequest(205, false)
      ];
      
      return {
        summary: {
          active_requests: 45,
          on_track: 38,
          at_risk: 5,
          breached: 3,
          total_completed: 287,
          response_breach_rate: 6.67,
          completion_breach_rate: 2.34
        },
        at_risk_requests: atRiskRequests,
        breached_requests: breachedRequests
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sla/dashboard`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch SLA dashboard');
      return response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async checkBreaches(): Promise<{ breaches_found: number; updated_count: number }> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { breaches_found: 3, updated_count: 12 };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sla/check-breaches`, {
        method: 'POST',
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to check breaches');
      return response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getRequestDetails(requestId: number): Promise<SLARequest> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return generateMockSLARequest(requestId);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/sla/requests/${requestId}`,
        { headers: createAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch request details');
      return response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const adminSLAService = new AdminSLAService();
