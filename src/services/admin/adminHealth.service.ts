/**
 * Admin Health Service
 * 
 * Monitors system health and status.
 * Used for the System Health card on admin dashboard.
 * 
 * API Endpoint: GET /api/admin/health
 */

import { DEMO_MODE, API_BASE_URL } from '../../config/appMode';
import { simulateDelay, handleApiError } from '../httpClient';
import type { SystemHealth, SystemStatus, BackendStatus } from '../../types/admin';

// Mock health data generator
const generateMockHealth = (): SystemHealth => ({
  status: 'online' as SystemStatus,
  backend: (DEMO_MODE ? 'demo' : 'connected') as BackendStatus,
  lastSync: new Date().toISOString(),
  uptime: 99.98,
  version: '1.0.0',
  checks: {
    database: true,
    cache: true,
    storage: true
  }
});

class AdminHealthService {
  /**
   * Get system health status
   */
  async getHealth(): Promise<SystemHealth> {
    if (DEMO_MODE) {
      await simulateDelay(200);
      return generateMockHealth();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/health`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });
      
      if (!response.ok) {
        // If health check fails, return degraded status
        return {
          ...generateMockHealth(),
          status: 'degraded',
          backend: 'demo',
          checks: {
            database: response.status !== 500,
            cache: true,
            storage: true
          }
        };
      }
      
      return response.json();
    } catch (error) {
      // Network error - return offline status
      return {
        ...generateMockHealth(),
        status: 'offline',
        backend: 'demo',
        checks: {
          database: false,
          cache: false,
          storage: false
        }
      };
    }
  }

  /**
   * Get health status label for display
   */
  getStatusLabel(status: SystemStatus): string {
    switch (status) {
      case 'online': return 'System Online';
      case 'degraded': return 'Degraded Performance';
      case 'offline': return 'System Offline';
      default: return 'Unknown';
    }
  }

  /**
   * Get health status color
   */
  getStatusColor(status: SystemStatus): string {
    switch (status) {
      case 'online': return 'success';
      case 'degraded': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  }

  /**
   * Check if backend is connected
   */
  async checkBackendConnection(): Promise<boolean> {
    if (DEMO_MODE) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/health`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const adminHealthService = new AdminHealthService();
