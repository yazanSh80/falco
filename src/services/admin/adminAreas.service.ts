/**
 * Admin Areas Service
 * 
 * Manages service areas and their statistics
 * Real API endpoints:
 * - GET /api/admin/areas
 * - POST /api/admin/areas
 * - PATCH /api/admin/areas/:id
 * - DELETE /api/admin/areas/:id
 */

import { DEMO_MODE, API_BASE_URL, createAuthHeaders, handleApiError } from './config';

export interface Area {
  id: number;
  name: string;
  name_ar: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  stats?: {
    engineer_count: number;
    customer_count: number;
    request_count: number;
  };
}

export interface AreasResponse {
  areas: Area[];
  total: number;
}

// Mock data
const mockAreas: Area[] = [
  {
    id: 1,
    name: 'Ramallah - City Center',
    name_ar: 'رام الله - وسط المدينة',
    description: 'Central business district of Ramallah',
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
    stats: { engineer_count: 45, customer_count: 187, request_count: 342 }
  },
  {
    id: 2,
    name: 'Bethlehem - Old City',
    name_ar: 'بيت لحم - البلدة القديمة',
    description: 'Historic old city area',
    is_active: true,
    created_at: '2025-01-02T10:00:00Z',
    stats: { engineer_count: 38, customer_count: 156, request_count: 278 }
  },
  {
    id: 3,
    name: 'Nablus - Downtown',
    name_ar: 'نابلس - وسط البلد',
    description: 'Downtown Nablus commercial area',
    is_active: true,
    created_at: '2025-01-03T10:00:00Z',
    stats: { engineer_count: 52, customer_count: 203, request_count: 421 }
  },
  {
    id: 4,
    name: 'Jenin - Industrial Zone',
    name_ar: 'جنين - المنطقة الصناعية',
    description: 'Industrial and manufacturing area',
    is_active: true,
    created_at: '2025-01-04T10:00:00Z',
    stats: { engineer_count: 28, customer_count: 94, request_count: 156 }
  },
  {
    id: 5,
    name: 'Tulkarm - Residential',
    name_ar: 'طولكرم - سكني',
    description: 'Residential neighborhoods',
    is_active: true,
    created_at: '2025-01-05T10:00:00Z',
    stats: { engineer_count: 35, customer_count: 128, request_count: 245 }
  },
  {
    id: 6,
    name: 'Qalqilya - Downtown',
    name_ar: 'قلقيلية - وسط البلد',
    description: 'Downtown Qalqilya',
    is_active: false,
    created_at: '2025-01-06T10:00:00Z',
    stats: { engineer_count: 22, customer_count: 87, request_count: 112 }
  }
];

class AdminAreasService {
  async getAreas(includeInactive: boolean = false, withStats: boolean = true): Promise<AreasResponse> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let areas = mockAreas;
      
      if (!includeInactive) {
        areas = areas.filter(a => a.is_active);
      }
      
      if (!withStats) {
        areas = areas.map((area) => {
          const { stats: _stats, ...rest } = area;
          return rest;
        });
      }
      
      return {
        areas,
        total: areas.length
      };
    }

    try {
      const params = new URLSearchParams();
      if (includeInactive) params.append('include_inactive', 'true');
      params.append('include_stats', String(withStats));

      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas?${params}`,
        { headers: createAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch areas');
      const data = await response.json();
      return {
        areas: data.areas || [],
        total: data.total ?? data.count ?? 0
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAreaById(id: number): Promise<Area> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const area = mockAreas.find(a => a.id === id);
      if (!area) throw new Error('Area not found');
      return area;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas/${id}`,
        { headers: createAuthHeaders() }
      );
      if (!response.ok) throw new Error('Area not found');
      const data = await response.json();
      return data.area ?? data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createArea(data: {
    name: string;
    name_ar?: string;
    description?: string;
  }): Promise<Area> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newArea: Area = {
        id: Math.max(...mockAreas.map(a => a.id)) + 1,
        name: data.name,
        name_ar: data.name_ar || null,
        description: data.description || null,
        is_active: true,
        created_at: new Date().toISOString(),
        stats: { engineer_count: 0, customer_count: 0, request_count: 0 }
      };
      mockAreas.push(newArea);
      return newArea;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas`,
        {
          method: 'POST',
          headers: createAuthHeaders(),
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) throw new Error('Failed to create area');
      const responseData = await response.json();
      return responseData.area ?? responseData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateArea(
    id: number,
    data: {
      name?: string;
      name_ar?: string;
      description?: string;
      is_active?: boolean;
    }
  ): Promise<Area> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const area = mockAreas.find(a => a.id === id);
      if (!area) throw new Error('Area not found');
      
      const updated = { ...area, ...data };
      const index = mockAreas.indexOf(area);
      mockAreas[index] = updated;
      return updated;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas/${id}`,
        {
          method: 'PATCH',
          headers: createAuthHeaders(),
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) throw new Error('Failed to update area');
      const responseData = await response.json();
      return responseData.area ?? responseData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteArea(id: number): Promise<{ message: string }> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockAreas.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Area not found');
      mockAreas.splice(index, 1);
      return { message: 'Area deleted successfully' };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas/${id}`,
        {
          method: 'DELETE',
          headers: createAuthHeaders()
        }
      );
      if (!response.ok) throw new Error('Failed to delete area');
      return response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async toggleAreaStatus(id: number, isActive: boolean): Promise<Area> {
    return this.updateArea(id, { is_active: isActive });
  }
}

export const adminAreasService = new AdminAreasService();
