/**
 * Admin Database Explorer
 * Advanced data viewer with search, filters, and detailed views
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { adminDbViewerService, DEMO_MODE } from '../../services/admin';
import type { DBTableName } from '../../types/admin';
import {
  Database, Users, Briefcase, FileText, DollarSign, Star, Bell, Ban,
  Search, ChevronLeft, ChevronRight, RefreshCw, Eye, Download, Filter,
  X, SlidersHorizontal, Calendar, ArrowUpDown, ArrowUp, ArrowDown,
  Copy, CheckCircle, AlertCircle, Clock, Hash, Mail, Phone, MapPin,
  CreditCard, TrendingUp, Shield, MoreHorizontal, Loader2
} from 'lucide-react';

// Types
interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
  value: string;
  value2?: string; // for 'between' operator
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface TableConfig {
  id: DBTableName;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  color: string;
  searchableFields: string[];
  filterableFields: { field: string; label: string; type: 'text' | 'select' | 'date' | 'number'; options?: string[] }[];
  columns: { field: string; label: string; width?: string; sortable?: boolean }[];
}

// Table configurations
const TABLE_CONFIGS: TableConfig[] = [
  {
    id: 'users',
    label: 'Users',
    labelAr: 'المستخدمين',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-blue-500',
    searchableFields: ['name', 'email', 'phone', 'city'],
    filterableFields: [
      { field: 'role', label: 'Role', type: 'select', options: ['customer', 'engineer', 'admin'] },
      { field: 'status', label: 'Status', type: 'select', options: ['active', 'pending', 'blocked'] },
      { field: 'city', label: 'City', type: 'text' },
    ],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'name', label: 'Name', sortable: true },
      { field: 'email', label: 'Email', sortable: true },
      { field: 'phone', label: 'Phone' },
      { field: 'role', label: 'Role', sortable: true },
      { field: 'status', label: 'Status', sortable: true },
      { field: 'city', label: 'City' },
      { field: 'created_at', label: 'Created', sortable: true },
    ]
  },
  {
    id: 'engineers',
    label: 'Engineers',
    labelAr: 'المهندسين',
    icon: <Briefcase className="w-4 h-4" />,
    color: 'bg-green-500',
    searchableFields: ['name', 'email', 'specialization'],
    filterableFields: [
      { field: 'status', label: 'Status', type: 'select', options: ['active', 'pending', 'blocked'] },
      { field: 'subscription_status', label: 'Subscription', type: 'select', options: ['active', 'trial', 'expired', 'none'] },
      { field: 'rating_min', label: 'Min Rating', type: 'number' },
    ],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'name', label: 'Name', sortable: true },
      { field: 'email', label: 'Email' },
      { field: 'specialization', label: 'Specialization' },
      { field: 'rating', label: 'Rating', sortable: true },
      { field: 'completed_jobs', label: 'Jobs', sortable: true },
      { field: 'subscription_status', label: 'Subscription' },
      { field: 'status', label: 'Status' },
    ]
  },
  {
    id: 'requests',
    label: 'Requests',
    labelAr: 'الطلبات',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-orange-500',
    searchableFields: ['request_number', 'customer_name', 'engineer_name', 'description'],
    filterableFields: [
      { field: 'status', label: 'Status', type: 'select', options: ['open', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'] },
      { field: 'category', label: 'Category', type: 'text' },
      { field: 'date_from', label: 'From Date', type: 'date' },
      { field: 'date_to', label: 'To Date', type: 'date' },
    ],
    columns: [
      { field: 'request_number', label: '#', width: '100px', sortable: true },
      { field: 'customer', label: 'Customer' },
      { field: 'engineer', label: 'Engineer' },
      { field: 'category', label: 'Category' },
      { field: 'status', label: 'Status', sortable: true },
      { field: 'price', label: 'Price', sortable: true },
      { field: 'created_at', label: 'Created', sortable: true },
    ]
  },
  {
    id: 'transactions',
    label: 'Transactions',
    labelAr: 'المعاملات المالية',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'bg-emerald-500',
    searchableFields: ['request_number', 'customer_name', 'engineer_name'],
    filterableFields: [
      { field: 'status', label: 'Status', type: 'select', options: ['completed', 'pending', 'refunded'] },
      { field: 'amount_min', label: 'Min Amount', type: 'number' },
      { field: 'amount_max', label: 'Max Amount', type: 'number' },
    ],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'request_number', label: 'Request' },
      { field: 'customer', label: 'Customer' },
      { field: 'engineer', label: 'Engineer' },
      { field: 'gross_amount', label: 'Gross', sortable: true },
      { field: 'commission', label: 'Commission' },
      { field: 'net_amount', label: 'Net', sortable: true },
      { field: 'created_at', label: 'Date', sortable: true },
    ]
  },
  {
    id: 'contracts',
    label: 'Contracts',
    labelAr: 'العقود',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-purple-500',
    searchableFields: ['contract_number', 'customer_name', 'engineer_name'],
    filterableFields: [
      { field: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'cancelled'] },
    ],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'contract_number', label: 'Contract #' },
      { field: 'customer', label: 'Customer' },
      { field: 'engineer', label: 'Engineer' },
      { field: 'status', label: 'Status' },
      { field: 'total_value', label: 'Value', sortable: true },
      { field: 'created_at', label: 'Date', sortable: true },
    ]
  },
  {
    id: 'reviews',
    label: 'Reviews',
    labelAr: 'التقييمات',
    icon: <Star className="w-4 h-4" />,
    color: 'bg-yellow-500',
    searchableFields: ['reviewer_name', 'reviewee_name', 'text'],
    filterableFields: [
      { field: 'rating_min', label: 'Min Rating', type: 'number' },
      { field: 'rating_max', label: 'Max Rating', type: 'number' },
    ],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'rating', label: 'Rating', sortable: true },
      { field: 'reviewer', label: 'Reviewer' },
      { field: 'reviewee', label: 'Reviewee' },
      { field: 'request_number', label: 'Request' },
      { field: 'text', label: 'Review' },
      { field: 'created_at', label: 'Date', sortable: true },
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    labelAr: 'الإشعارات',
    icon: <Bell className="w-4 h-4" />,
    color: 'bg-indigo-500',
    searchableFields: ['title', 'message', 'user_name'],
    filterableFields: [
      { field: 'type', label: 'Type', type: 'text' },
      { field: 'is_read', label: 'Read Status', type: 'select', options: ['true', 'false'] },
    ],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'user', label: 'User' },
      { field: 'type', label: 'Type' },
      { field: 'title', label: 'Title' },
      { field: 'is_read', label: 'Read' },
      { field: 'created_at', label: 'Date', sortable: true },
    ]
  },
  {
    id: 'blocks',
    label: 'Blocks',
    labelAr: 'الحظر',
    icon: <Ban className="w-4 h-4" />,
    color: 'bg-red-500',
    searchableFields: ['blocker_name', 'blocked_name', 'reason'],
    filterableFields: [],
    columns: [
      { field: 'id', label: 'ID', width: '60px', sortable: true },
      { field: 'blocker', label: 'Blocker' },
      { field: 'blocked', label: 'Blocked' },
      { field: 'reason', label: 'Reason' },
      { field: 'created_at', label: 'Date', sortable: true },
    ]
  },
];

export default function AdminDatabaseExplorer() {
  // State
  const [activeTable, setActiveTable] = useState<DBTableName>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort
  const [sort, setSort] = useState<SortConfig>({ field: 'id', direction: 'desc' });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 25,
    total: 0,
    pages: 1,
  });
  
  // Detail Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Get current table config
  const tableConfig = useMemo(() => 
    TABLE_CONFIGS.find(t => t.id === activeTable) || TABLE_CONFIGS[0],
    [activeTable]
  );

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTable, pagination.page, sort]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminDbViewerService.queryTable({
        table: activeTable,
        page: pagination.page,
        perPage: pagination.perPage,
        search: searchQuery || undefined,
        sortBy: sort.field,
        sortOrder: sort.direction,
      });
      
      setData(result.rows || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || result.rows?.length || 0,
        pages: result.pages || Math.ceil((result.total || 0) / prev.perPage),
      }));
    } catch (err: any) {
      if (!DEMO_MODE) {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData();
  };

  // Handle sort
  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      const csvContent = await adminDbViewerService.exportTableCSV(activeTable);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTable}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Get cell value
  const getCellValue = (item: any, field: string) => {
    switch (field) {
      case 'customer':
        return item.customer?.name || item.customer_name || '-';
      case 'engineer':
        return item.engineer?.name || item.engineer_name || '-';
      case 'reviewer':
        return item.reviewer?.name || '-';
      case 'reviewee':
        return item.reviewee?.name || '-';
      case 'blocker':
        return item.blocker?.name || '-';
      case 'blocked':
        return item.blocked?.name || '-';
      case 'user':
        return item.user?.name || '-';
      case 'rating':
        if (activeTable === 'engineers') {
          return item.profile?.rating_avg?.toFixed(1) || '0.0';
        }
        return item.rating || '-';
      case 'specialization':
        return item.profile?.specialization || '-';
      case 'subscription_status':
        return item.profile?.subscription_status || 'none';
      case 'completed_jobs':
        return item.stats?.completed_jobs || 0;
      case 'price':
        return `₪${item.price_at_request || item.price || 0}`;
      case 'gross_amount':
        return `₪${(item.gross_amount || 0).toFixed(2)}`;
      case 'commission':
        return `₪${(item.commission_amount || 0).toFixed(2)}`;
      case 'net_amount':
        return `₪${(item.net_amount || 0).toFixed(2)}`;
      case 'total_value':
        return `₪${(item.total_value || 0).toFixed(2)}`;
      case 'created_at': {
        const date = item.created_at || item.timestamps?.created_at;
        return date ? new Date(date).toLocaleDateString() : '-';
      }
      case 'request_number':
        return item.request_number || item.request?.request_number || '-';
      case 'is_read':
        return item.is_read ? 'Yes' : 'No';
      case 'text':
        return item.text?.substring(0, 50) + (item.text?.length > 50 ? '...' : '') || '-';
      default:
        return item[field] ?? '-';
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline' | 'gold'> = {
      active: 'success',
      completed: 'success',
      resolved: 'success',
      pending: 'warning',
      open: 'warning',
      in_progress: 'info',
      accepted: 'info',
      blocked: 'error',
      cancelled: 'error',
      disputed: 'error',
      admin: 'gold',
      engineer: 'info',
      customer: 'outline',
      trial: 'warning',
      expired: 'error',
    };
    return (
      <Badge variant={variants[status] || 'outline'} size="sm">
        {status}
      </Badge>
    );
  };

  // Render cell
  const renderCell = (item: any, field: string) => {
    const value = getCellValue(item, field);
    
    // Special rendering for certain fields
    if (field === 'status' || field === 'role' || field === 'subscription_status') {
      return renderStatusBadge(value);
    }
    
    if (field === 'rating' && activeTable === 'reviews') {
      return (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
          ))}
        </div>
      );
    }
    
    if (field === 'rating' && activeTable === 'engineers') {
      return (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{value}</span>
        </div>
      );
    }
    
    if (field === 'is_read') {
      return item.is_read ? (
        <Badge variant="success" size="sm">Read</Badge>
      ) : (
        <Badge variant="warning" size="sm">Unread</Badge>
      );
    }
    
    return <span className="text-sm">{value}</span>;
  };

  // Detail Modal Content
  const renderDetailContent = () => {
    if (!selectedItem) return null;
    
    const renderValue = (key: string, value: any, depth = 0): React.ReactNode => {
      if (value === null || value === undefined) return <span className="text-neutral-400">null</span>;
      if (typeof value === 'boolean') return <Badge variant={value ? 'success' : 'error'} size="sm">{value ? 'Yes' : 'No'}</Badge>;
      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-neutral-200 dark:border-[#35383d]' : ''}`}>
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="py-1">
                <span className="text-neutral-500 dark:text-[#7a7d82] text-xs font-medium">{k}:</span>
                <div className="mt-0.5">{renderValue(k, v, depth + 1)}</div>
              </div>
            ))}
          </div>
        );
      }
      if (Array.isArray(value)) {
        return (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div key={index} className="text-sm">{renderValue(String(index), item, depth + 1)}</div>
            ))}
          </div>
        );
      }
      // Check if it's a date string
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return <span className="text-sm">{new Date(value).toLocaleString()}</span>;
      }
      return <span className="text-sm text-neutral-900 dark:text-white">{String(value)}</span>;
    };

    return (
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {Object.entries(selectedItem).map(([key, value]) => (
          <div key={key} className="border-b border-neutral-100 dark:border-[#35383d] pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-brand dark:text-brand-light">{key}</span>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(value, null, 2))}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-[#252628] rounded"
                title="Copy value"
              >
                <Copy className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
            {renderValue(key, value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppShell title="Database Explorer" subtitle="استكشاف وبحث متقدم في قاعدة البيانات">
      <DemoModeBadge />
      
      <div className="space-y-6">
        {/* Table Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-neutral-100 dark:bg-[#1b1c20] rounded-xl">
          {TABLE_CONFIGS.map(table => (
            <button
              key={table.id}
              onClick={() => {
                setActiveTable(table.id);
                setPagination(prev => ({ ...prev, page: 1 }));
                setSearchQuery('');
                setFilters([]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTable === table.id
                  ? 'bg-white dark:bg-[#252628] text-brand dark:text-brand-light shadow-sm'
                  : 'text-neutral-600 dark:text-[#7a7d82] hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#252628]/50'
              }`}
            >
              <span className={`p-1 rounded ${table.color} text-white`}>
                {table.icon}
              </span>
              <span>{table.label}</span>
              <span className="text-xs text-neutral-400 dark:text-[#65666b]">
                ({table.labelAr})
              </span>
            </button>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <Card className="p-4 dark:bg-[#1b1c20] dark:border-[#35383d]">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px] max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-[#65666b]" />
                <Input
                  type="text"
                  placeholder={`Search in ${tableConfig.searchableFields.join(', ')}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      loadData();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-[#252628] rounded"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                )}
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-brand/10 border-brand' : ''}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {filters.length > 0 && (
                  <Badge variant="info" size="sm" className="ml-1">{filters.length}</Badge>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && tableConfig.filterableFields.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-[#35383d]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tableConfig.filterableFields.map(filterField => (
                  <div key={filterField.field}>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-[#7a7d82] mb-1">
                      {filterField.label}
                    </label>
                    {filterField.type === 'select' ? (
                      <Select
                        value={filters.find(f => f.field === filterField.field)?.value || ''}
                        onChange={(e) => {
                          const newFilters = filters.filter(f => f.field !== filterField.field);
                          if (e.target.value) {
                            newFilters.push({ field: filterField.field, operator: 'equals', value: e.target.value });
                          }
                          setFilters(newFilters);
                        }}
                      >
                        <option value="">All</option>
                        {filterField.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={filterField.type}
                        placeholder={filterField.label}
                        value={filters.find(f => f.field === filterField.field)?.value || ''}
                        onChange={(e) => {
                          const newFilters = filters.filter(f => f.field !== filterField.field);
                          if (e.target.value) {
                            newFilters.push({ field: filterField.field, operator: 'contains', value: e.target.value });
                          }
                          setFilters(newFilters);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              {filters.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-[#7a7d82]">Active filters:</span>
                  {filters.map((filter, index) => (
                    <Badge key={index} variant="info" size="sm" className="gap-1">
                      {filter.field}: {filter.value}
                      <button onClick={() => setFilters(filters.filter((_, i) => i !== index))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <button
                    onClick={() => setFilters([])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Stats Bar */}
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-[#c0c4cd]">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-neutral-900 dark:text-white">{pagination.total}</strong> total records
            </span>
            <span>•</span>
            <span>
              Showing <strong className="text-neutral-900 dark:text-white">{(pagination.page - 1) * pagination.perPage + 1}</strong> 
              {' - '}
              <strong className="text-neutral-900 dark:text-white">{Math.min(pagination.page * pagination.perPage, pagination.total)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <Select
              value={String(pagination.perPage)}
              onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
              className="w-20"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <Card className="overflow-hidden dark:bg-[#1b1c20] dark:border-[#35383d]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-[#7a7d82]">
              <Database className="w-12 h-12 mb-3 opacity-50" />
              <p>No data found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try adjusting your search query</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#252628] border-b border-neutral-200 dark:border-[#35383d]">
                    {tableConfig.columns.map(col => (
                      <th
                        key={col.field}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#7a7d82] ${col.sortable ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#2a2b2f]' : ''}`}
                        style={{ width: col.width }}
                        onClick={() => col.sortable && handleSort(col.field)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && (
                            <span className="text-neutral-300 dark:text-[#454850]">
                              {sort.field === col.field ? (
                                sort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#7a7d82]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#252628]">
                  {data.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-neutral-50 dark:hover:bg-[#252628] transition-colors"
                    >
                      {tableConfig.columns.map(col => (
                        <td key={col.field} className="px-4 py-3 text-neutral-900 dark:text-white">
                          {renderCell(item, col.field)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-brand text-white'
                      : 'hover:bg-neutral-100 dark:hover:bg-[#252628] text-neutral-600 dark:text-[#c0c4cd]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.pages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
        }}
        title={`${tableConfig.label} Details`}
        size="lg"
      >
        {renderDetailContent()}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-[#35383d] flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(selectedItem, null, 2));
            }}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy JSON
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedItem(null);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
