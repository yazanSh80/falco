/**
 * Admin Database Viewer Service
 * 
 * Provides read-only access to database tables for super admins.
 * Supports search, sort, pagination, and export.
 * 
 * API Endpoints:
 * - GET /api/admin/db/:table?page=&q=&sort=&order=
 */

import { DEMO_MODE, API_BASE_URL } from '../../config/appMode';
import { simulateDelay } from '../httpClient';
import type { DBTableName, DBTableConfig, DBQueryParams, DBQueryResult, DBTableRow } from '../../types/admin';

const getAuthToken = (): string | null =>
  localStorage.getItem('falco_access_token') ||
  localStorage.getItem('access_token') ||
  localStorage.getItem('token');

// Table configurations
export const TABLE_CONFIGS: Record<DBTableName, DBTableConfig> = {
  users: {
    name: 'users',
    label: 'All Users',
    icon: 'Users',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'name', label: 'Name', type: 'string', sortable: true },
      { key: 'email', label: 'Email', type: 'string', sortable: true },
      { key: 'phone', label: 'Phone', type: 'string', sortable: false },
      { key: 'role', label: 'Role', type: 'string', sortable: true },
      { key: 'status', label: 'Status', type: 'status', sortable: true },
      { key: 'city', label: 'City', type: 'string', sortable: true },
      { key: 'created_at', label: 'Created', type: 'date', sortable: true }
    ]
  },
  engineers: {
    name: 'engineers',
    label: 'Engineers',
    icon: 'Briefcase',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'name', label: 'Name', type: 'string', sortable: true },
      { key: 'email', label: 'Email', type: 'string', sortable: true },
      { key: 'specialization', label: 'Specialization', type: 'string', sortable: true },
      { key: 'rating', label: 'Rating', type: 'number', sortable: true },
      { key: 'total_jobs', label: 'Jobs', type: 'number', sortable: true },
      { key: 'subscription_status', label: 'Subscription', type: 'status', sortable: true },
      { key: 'status', label: 'Status', type: 'status', sortable: true }
    ]
  },
  requests: {
    name: 'requests',
    label: 'Service Requests',
    icon: 'FileText',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: '#', type: 'number', sortable: true },
      { key: 'request_number', label: 'Request #', type: 'string', sortable: true },
      { key: 'customer_name', label: 'Customer', type: 'string', sortable: true },
      { key: 'engineer_name', label: 'Engineer', type: 'string', sortable: true },
      { key: 'category', label: 'Category', type: 'string', sortable: true },
      { key: 'status', label: 'Status', type: 'status', sortable: true },
      { key: 'price', label: 'Price', type: 'number', sortable: true },
      { key: 'created_at', label: 'Created', type: 'date', sortable: true }
    ]
  },
  transactions: {
    name: 'transactions',
    label: 'Transactions',
    icon: 'DollarSign',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'request_id', label: 'Request', type: 'number', sortable: true },
      { key: 'customer_name', label: 'Customer', type: 'string', sortable: true },
      { key: 'engineer_name', label: 'Engineer', type: 'string', sortable: true },
      { key: 'gross_amount', label: 'Gross', type: 'number', sortable: true },
      { key: 'commission', label: 'Commission', type: 'number', sortable: true },
      { key: 'net_amount', label: 'Net', type: 'number', sortable: true },
      { key: 'created_at', label: 'Date', type: 'date', sortable: true }
    ]
  },
  reviews: {
    name: 'reviews',
    label: 'Reviews',
    icon: 'Star',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'rating', label: 'Rating', type: 'number', sortable: true },
      { key: 'reviewer_name', label: 'Reviewer', type: 'string', sortable: true },
      { key: 'reviewee_name', label: 'Reviewee', type: 'string', sortable: true },
      { key: 'request_id', label: 'Request', type: 'number', sortable: true },
      { key: 'comment', label: 'Comment', type: 'string', sortable: false },
      { key: 'created_at', label: 'Date', type: 'date', sortable: true }
    ]
  },
  blocks: {
    name: 'blocks',
    label: 'Blocks',
    icon: 'Ban',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'blocker_name', label: 'Blocker', type: 'string', sortable: true },
      { key: 'blocked_name', label: 'Blocked', type: 'string', sortable: true },
      { key: 'reason', label: 'Reason', type: 'string', sortable: false },
      { key: 'created_at', label: 'Date', type: 'date', sortable: true }
    ]
  },
  notifications: {
    name: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'user_name', label: 'User', type: 'string', sortable: true },
      { key: 'type', label: 'Type', type: 'string', sortable: true },
      { key: 'title', label: 'Title', type: 'string', sortable: false },
      { key: 'is_read', label: 'Read', type: 'boolean', sortable: true },
      { key: 'created_at', label: 'Date', type: 'date', sortable: true }
    ]
  },
  contracts: {
    name: 'contracts',
    label: 'Deal Contracts',
    icon: 'FileText',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true },
      { key: 'contract_number', label: 'Contract #', type: 'string', sortable: true },
      { key: 'request_id', label: 'Request #', type: 'string', sortable: true },
      { key: 'customer_name', label: 'Customer', type: 'string', sortable: true },
      { key: 'engineer_name', label: 'Engineer', type: 'string', sortable: true },
      { key: 'grand_total', label: 'Total', type: 'number', sortable: true },
      { key: 'currency', label: 'Currency', type: 'string', sortable: true },
      { key: 'status', label: 'Status', type: 'status', sortable: true },
      { key: 'created_at', label: 'Date', type: 'date', sortable: true }
    ]
  }
};

// Mock data generators
const generateMockUsers = (count: number): DBTableRow[] => {
  const roles = ['customer', 'engineer', 'admin'];
  const statuses = ['active', 'pending', 'blocked'];
  const cities = ['Ramallah', 'Nablus', 'Bethlehem', 'Jenin', 'Tulkarm', 'Hebron'];
  const names = ['Ahmad Ali', 'Sara Mahmoud', 'Mohammed Khalil', 'Fatima Hassan', 'Omar Nasser', 'Hana Rawoof'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    email: `user${i + 1}@example.com`,
    phone: `+970 59 ${String(1000000 + i).slice(-7)}`,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    city: cities[i % cities.length],
    created_at: new Date(Date.now() - i * 86400000).toISOString()
  }));
};

const generateMockEngineers = (count: number): DBTableRow[] => {
  const specializations = ['Electrical Wiring', 'Solar Systems', 'Industrial', 'Maintenance', 'Installation'];
  const names = ['Mohammed Atallah', 'Khalil Nasser', 'Aisha Mohammed', 'Omar Hassan', 'Fatima Al-Rashid'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    email: `engineer${i + 1}@example.com`,
    specialization: specializations[i % specializations.length],
    rating: (4 + Math.random()).toFixed(1),
    total_jobs: Math.floor(50 + Math.random() * 200),
    subscription_status: i % 3 === 0 ? 'expired' : 'active',
    status: i % 4 === 0 ? 'pending' : 'accepted'
  }));
};

const generateMockRequests = (count: number): DBTableRow[] => {
  const categories = ['Wiring', 'Solar', 'Maintenance', 'Installation', 'Inspection'];
  const statuses = ['pending', 'active', 'in_progress', 'completed', 'cancelled'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    request_number: `R-${String(i + 1).padStart(5, '0')}`,
    customer_name: `Customer ${i + 1}`,
    engineer_name: i % 3 === 0 ? null : `Engineer ${(i % 5) + 1}`,
    category: categories[i % categories.length],
    status: statuses[i % statuses.length],
    price: Math.floor(100 + Math.random() * 500),
    created_at: new Date(Date.now() - i * 3600000).toISOString()
  }));
};

const generateMockTransactions = (count: number): DBTableRow[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    request_id: i + 1,
    customer_name: `Customer ${i + 1}`,
    engineer_name: `Engineer ${(i % 5) + 1}`,
    gross_amount: Math.floor(200 + Math.random() * 800),
    commission: Math.floor(20 + Math.random() * 80),
    net_amount: Math.floor(180 + Math.random() * 720),
    created_at: new Date(Date.now() - i * 86400000).toISOString()
  }));
};

const generateMockReviews = (count: number): DBTableRow[] => {
  const comments = [
    'Excellent work, very professional!',
    'Good service, would recommend.',
    'Fast and efficient.',
    'Quality work, satisfied with results.',
    'Great communication throughout.'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    rating: Math.floor(3 + Math.random() * 3),
    reviewer_name: `Customer ${i + 1}`,
    reviewee_name: `Engineer ${(i % 5) + 1}`,
    request_id: i + 1,
    comment: comments[i % comments.length],
    created_at: new Date(Date.now() - i * 86400000).toISOString()
  }));
};

const generateMockBlocks = (count: number): DBTableRow[] => {
  const reasons = ['Inappropriate behavior', 'Spam', 'Harassment', 'Policy violation', 'Other'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    blocker_name: `User ${i + 1}`,
    blocked_name: `User ${i + 10}`,
    reason: reasons[i % reasons.length],
    created_at: new Date(Date.now() - i * 86400000 * 7).toISOString()
  }));
};

const generateMockNotifications = (count: number): DBTableRow[] => {
  const types = ['request', 'payment', 'review', 'system', 'promotion'];
  const titles = [
    'New request received',
    'Payment confirmed',
    'New review posted',
    'System maintenance',
    'Special offer available'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    user_name: `User ${(i % 20) + 1}`,
    type: types[i % types.length],
    title: titles[i % titles.length],
    is_read: i % 3 !== 0,
    created_at: new Date(Date.now() - i * 3600000).toISOString()
  }));
};

const generateMockContracts = (count: number): DBTableRow[] => {
  const statuses = ['draft', 'pending', 'accepted', 'in_progress', 'completed'];
  const currencies = ['ILS', 'USD', 'JOD'];
  const customers = ['أحمد محمود', 'سارة حسن', 'عمر خالد', 'فاطمة محمد', 'خالد ناصر'];
  const engineers = ['محمد عطاالله', 'خليل ناصر', 'أحمد خليل', 'عمر حسن', 'علي محمود'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    contract_number: `CNT-${String(i + 1).padStart(4, '0')}-2024`,
    request_id: `R-${1000 + i}`,
    customer_name: customers[i % customers.length],
    engineer_name: engineers[i % engineers.length],
    grand_total: Math.floor(1000 + Math.random() * 5000),
    currency: currencies[i % currencies.length],
    status: statuses[i % statuses.length],
    paid_amount: Math.floor(500 + Math.random() * 2000),
    created_at: new Date(Date.now() - i * 86400000 * 3).toISOString()
  }));
};

// Data generator router
const generateMockData = (table: DBTableName, count: number): DBTableRow[] => {
  switch (table) {
    case 'users': return generateMockUsers(count);
    case 'engineers': return generateMockEngineers(count);
    case 'requests': return generateMockRequests(count);
    case 'transactions': return generateMockTransactions(count);
    case 'reviews': return generateMockReviews(count);
    case 'blocks': return generateMockBlocks(count);
    case 'notifications': return generateMockNotifications(count);
    case 'contracts': return generateMockContracts(count);
    default: return [];
  }
};

// Total counts per table (for demo)
const MOCK_TOTALS: Record<DBTableName, number> = {
  users: 1247,
  engineers: 523,
  requests: 3847,
  transactions: 2156,
  reviews: 2985,
  blocks: 45,
  notifications: 8934,
  contracts: 856
};

class AdminDbViewerService {
  /**
   * Query table data with pagination, search, and sort
   */
  async queryTable(params: DBQueryParams): Promise<DBQueryResult> {
    const { table, page, perPage, search, sortBy, sortOrder } = params;

    if (DEMO_MODE) {
      await simulateDelay(300);
      
      let allRows = generateMockData(table, Math.min(100, MOCK_TOTALS[table]));
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        allRows = allRows.filter(row => 
          Object.values(row).some(val => 
            String(val).toLowerCase().includes(searchLower)
          )
        );
      }
      
      // Apply sort
      if (sortBy) {
        allRows.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      // Calculate pagination
      const total = search ? allRows.length : MOCK_TOTALS[table];
      const pages = Math.ceil(total / perPage);
      const start = (page - 1) * perPage;
      const rows = allRows.slice(start, start + perPage);
      
      return { rows, total, page, perPage, pages };
    }

    try {
      const url = new URL(`${API_BASE_URL}/api/admin/db/${table}`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      if (search) url.searchParams.set('q', search);
      if (sortBy) url.searchParams.set('sort', sortBy);
      if (sortOrder) url.searchParams.set('order', sortOrder);

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken() || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Query failed');
    }
  }

  /**
   * Get single row details
   */
  async getRowDetails(table: DBTableName, id: number): Promise<DBTableRow> {
    if (DEMO_MODE) {
      await simulateDelay(200);
      const rows = generateMockData(table, 20);
      const row = rows.find(r => r.id === id);
      if (!row) throw new Error('Record not found');
      return row;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/db/${table}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken() || ''}`
        }
      });

      if (!response.ok) throw new Error('Record not found');
      return response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch record');
    }
  }

  /**
   * Export table to CSV
   */
  async exportTableCSV(table: DBTableName): Promise<Blob> {
    if (DEMO_MODE) {
      await simulateDelay(500);
      
      const rows = generateMockData(table, 50);
      const config = TABLE_CONFIGS[table];
      const headers = config.columns.map(c => c.label);
      const keys = config.columns.map(c => c.key);
      
      const csvContent = [
        // Metadata header
        `# Exported by: Admin User`,
        `# Date: ${new Date().toISOString()}`,
        `# Mode: Demo`,
        `# Table: ${config.label}`,
        '',
        // Data headers
        headers.join(','),
        // Data rows
        ...rows.map(row => 
          keys.map(key => {
            const val = row[key];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
            return String(val);
          }).join(',')
        )
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/db/${table}/export`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken() || ''}`
        }
      });

      if (!response.ok) throw new Error('Export failed');
      return response.blob();
    } catch (error: any) {
      throw new Error(error.message || 'Export failed');
    }
  }

  /**
   * Get table config
   */
  getTableConfig(table: DBTableName): DBTableConfig {
    return TABLE_CONFIGS[table];
  }

  /**
   * Get all available tables
   */
  getAvailableTables(): DBTableConfig[] {
    return Object.values(TABLE_CONFIGS);
  }
}

export const adminDbViewerService = new AdminDbViewerService();
