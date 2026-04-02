/**
 * Admin Audit Log Service
 * 
 * Handles audit log fetching and filtering
 * Real API endpoint: GET /api/admin/audit-log
 */

import { DEMO_MODE, API_BASE_URL, createAuthHeaders, handleApiError } from './config';

export interface AuditLog {
  id: number;
  admin_id: number;
  action_type: string;
  target_type: string;
  target_id: number;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
}

export interface AuditLogResponse {
  audit_logs: AuditLog[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

// Mock data
const mockActionTypes = [
  'approve_engineer', 'reject_engineer', 'block_user', 'unblock_user',
  'delete_user', 'create_admin', 'resolve_dispute', 'area_create',
  'area_update', 'area_delete', 'permission_update'
];

const generateMockAuditLogs = (page: number = 1, perPage: number = 20): AuditLog[] => {
  const adminNames = ['Ahmad Saqer', 'Hana Rawoof', 'Ali Khalil'];
  const actions = mockActionTypes;
  const targetTypes = ['engineer', 'user', 'area', 'dispute'];
  const logs: AuditLog[] = [];
  
  const startId = (page - 1) * perPage + 1;
  for (let i = 0; i < perPage && i < 50; i++) {
    const id = startId + i;
    logs.push({
      id,
      admin_id: (id % 3) + 1,
      action_type: actions[id % actions.length],
      target_type: targetTypes[id % targetTypes.length],
      target_id: Math.floor(id / 2),
      details: { reason: 'Policy violation', status: 'resolved' },
      ip_address: `192.168.1.${(id % 255) + 1}`,
      user_agent: 'Mozilla/5.0',
      created_at: new Date(Date.now() - id * 3600000).toISOString(),
      admin_name: adminNames[id % adminNames.length],
      admin_email: `admin${(id % 3) + 1}@falco.local`
    });
  }
  
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

class AdminAuditService {
  async getActionTypes(): Promise<{ action_types: string[] }> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 150));
      return { action_types: mockActionTypes };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/audit-log/actions`, {
        headers: createAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch action types');
      return response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getLogs(params?: {
    page?: number;
    per_page?: number;
    action_type?: string;
    target_type?: string;
  }): Promise<AuditLogResponse> {
    const page = params?.page || 1;
    const perPage = params?.per_page || 20;

    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let logs = generateMockAuditLogs(page, perPage);
      
      // Filter by action type
      if (params?.action_type) {
        logs = logs.filter(l => l.action_type === params.action_type);
      }
      
      // Filter by target type
      if (params?.target_type) {
        logs = logs.filter(l => l.target_type === params.target_type);
      }
      
      return {
        audit_logs: logs,
        pagination: {
          page,
          per_page: perPage,
          total: 156,
          pages: Math.ceil(156 / perPage)
        }
      };
    }

    try {
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', String(page));
      if (perPage) searchParams.append('per_page', String(perPage));
      if (params?.action_type) searchParams.append('action_type', params.action_type);
      if (params?.target_type) searchParams.append('target_type', params.target_type);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/audit-log?${searchParams}`,
        { headers: createAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const adminAuditService = new AdminAuditService();
