/**
 * Admin System Data Viewer
 * Provides read-only access to all database tables
 * Super Admin feature for full system visibility
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { adminDbViewerService, TABLE_CONFIGS, DEMO_MODE } from '../../services/admin';
import type { DBTableName } from '../../types/admin';
import {
  Database,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Star,
  Bell,
  Ban,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Download,
  Filter,
  Table as TableIcon,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react';

type TableType = DBTableName;

interface TabConfig {
  id: TableType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const TABS: TabConfig[] = [
  { id: 'users', label: 'All Users', icon: <Users className="w-4 h-4" />, color: 'bg-blue-500' },
  { id: 'engineers', label: 'Engineers', icon: <Briefcase className="w-4 h-4" />, color: 'bg-green-500' },
  { id: 'requests', label: 'Requests', icon: <FileText className="w-4 h-4" />, color: 'bg-orange-500' },
  { id: 'transactions', label: 'Transactions', icon: <DollarSign className="w-4 h-4" />, color: 'bg-emerald-500' },
  { id: 'contracts', label: 'Contracts', icon: <FileText className="w-4 h-4" />, color: 'bg-purple-500' },
  { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" />, color: 'bg-yellow-500' },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, color: 'bg-indigo-500' },
  { id: 'blocks', label: 'Blocks', icon: <Ban className="w-4 h-4" />, color: 'bg-red-500' },
];

export default function AdminDataViewer() {
  const [activeTab, setActiveTab] = useState<TableType>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1,
  });
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminDbViewerService.queryTable({
        table: activeTab,
        page: pagination.page,
        perPage: pagination.per_page,
        search: search || undefined
      });
      
      setData(result.rows || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || result.rows?.length || 0,
        pages: result.pages || 1
      }));
    } catch (err: any) {
      if (!DEMO_MODE) {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await adminDbViewerService.exportTableCSV(activeTab);
      
      // Create and download blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-purple-100 text-purple-800',
      accepted: 'bg-indigo-100 text-indigo-800',
      open: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'users':
        return ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'City', 'Created'];
      case 'engineers':
        return ['ID', 'Name', 'Email', 'Specialization', 'Rating', 'Jobs', 'Subscription', 'Status'];
      case 'requests':
        return ['#', 'Customer', 'Engineer', 'Category', 'Status', 'Price', 'SLA', 'Created'];
      case 'transactions':
        return ['ID', 'Request', 'Customer', 'Engineer', 'Gross', 'Commission', 'Net', 'Date'];
      case 'reviews':
        return ['ID', 'Rating', 'Reviewer', 'Reviewee', 'Request', 'Text', 'Date'];
      case 'notifications':
        return ['ID', 'User', 'Type', 'Title', 'Read', 'Date'];
      case 'blocks':
        return ['ID', 'Blocker', 'Blocked', 'Reason', 'Date'];
      default:
        return [];
    }
  };

  const renderTableRow = (item: any, index: number) => {
    const cellClass = 'px-4 py-3 text-sm';

    switch (activeTab) {
      case 'users':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={cellClass}>{item.id}</td>
            <td className={`${cellClass} font-medium`}>{item.name}</td>
            <td className={cellClass}>{item.email}</td>
            <td className={cellClass}>{item.phone || '-'}</td>
            <td className={cellClass}>
              <Badge variant={item.role === 'admin' ? 'gold' : item.role === 'engineer' ? 'info' : 'outline'}>
                {item.role}
              </Badge>
            </td>
            <td className={cellClass}>{getStatusBadge(item.status)}</td>
            <td className={cellClass}>{item.city || '-'}</td>
            <td className={cellClass}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      case 'engineers':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={cellClass}>{item.id}</td>
            <td className={`${cellClass} font-medium`}>{item.name}</td>
            <td className={cellClass}>{item.email}</td>
            <td className={cellClass}>{item.profile?.specialization || '-'}</td>
            <td className={cellClass}>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {item.profile?.rating_avg?.toFixed(1) || '0.0'}
                <span className="text-gray-400">({item.profile?.rating_count || 0})</span>
              </div>
            </td>
            <td className={cellClass}>{item.stats?.completed_jobs || 0}</td>
            <td className={cellClass}>{getStatusBadge(item.profile?.subscription_status || 'none')}</td>
            <td className={cellClass}>{getStatusBadge(item.status)}</td>
          </tr>
        );
      case 'requests':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={`${cellClass} font-mono`}>{item.request_number}</td>
            <td className={cellClass}>{item.customer?.name || '-'}</td>
            <td className={cellClass}>{item.engineer?.name || '-'}</td>
            <td className={cellClass}>{item.category}</td>
            <td className={cellClass}>{getStatusBadge(item.status)}</td>
            <td className={cellClass}>₪{item.price_at_request || 0}</td>
            <td className={cellClass}>
              {item.sla?.response_breached || item.sla?.completion_breached ? (
                <Badge variant="error">Breached</Badge>
              ) : item.sla?.status === 'at_risk' ? (
                <Badge variant="warning">At Risk</Badge>
              ) : (
                <Badge variant="success">OK</Badge>
              )}
            </td>
            <td className={cellClass}>{item.timestamps?.created_at ? new Date(item.timestamps.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      case 'transactions':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={cellClass}>{item.id}</td>
            <td className={`${cellClass} font-mono`}>{item.request?.request_number || item.request_id}</td>
            <td className={cellClass}>{item.customer?.name || '-'}</td>
            <td className={cellClass}>{item.engineer?.name || '-'}</td>
            <td className={cellClass}>₪{item.gross_amount?.toFixed(2)}</td>
            <td className={cellClass}>₪{item.commission_amount?.toFixed(2)}</td>
            <td className={`${cellClass} font-medium text-green-600`}>₪{item.net_amount?.toFixed(2)}</td>
            <td className={cellClass}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      case 'reviews':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={cellClass}>{item.id}</td>
            <td className={cellClass}>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </td>
            <td className={cellClass}>{item.reviewer?.name || '-'}</td>
            <td className={cellClass}>{item.reviewee?.name || '-'}</td>
            <td className={`${cellClass} font-mono`}>{item.request?.request_number || '-'}</td>
            <td className={`${cellClass} max-w-xs truncate`}>{item.text}</td>
            <td className={cellClass}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      case 'notifications':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={cellClass}>{item.id}</td>
            <td className={cellClass}>{item.user?.name || '-'}</td>
            <td className={cellClass}>
              <Badge variant="outline">{item.type}</Badge>
            </td>
            <td className={`${cellClass} max-w-xs truncate`}>{item.title}</td>
            <td className={cellClass}>
              {item.is_read ? (
                <Badge className="bg-green-100 text-green-800">Read</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Unread</Badge>
              )}
            </td>
            <td className={cellClass}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      case 'blocks':
        return (
          <tr key={item.id} className="hover:bg-gray-50 border-b">
            <td className={cellClass}>{item.id}</td>
            <td className={cellClass}>
              <div>
                <div className="font-medium">{item.blocker?.name || '-'}</div>
                <div className="text-xs text-gray-500">{item.blocker?.role}</div>
              </div>
            </td>
            <td className={cellClass}>
              <div>
                <div className="font-medium">{item.blocked?.name || '-'}</div>
                <div className="text-xs text-gray-500">{item.blocked?.role}</div>
              </div>
            </td>
            <td className={`${cellClass} max-w-xs truncate`}>{item.reason || '-'}</td>
            <td className={cellClass}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell title="System Data Viewer" subtitle="Read-only access to all database tables">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-3">
          <DemoModeBadge />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Records"
            value={pagination.total}
            subtitle={`In ${activeTab} table`}
            icon={<Database className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Tables Available"
            value={TABS.length}
            subtitle="Database tables"
            icon={<TableIcon className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Current Page"
            value={pagination.page}
            subtitle={`of ${pagination.pages} pages`}
            icon={<Eye className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Per Page"
            value={pagination.per_page}
            subtitle="Records shown"
            icon={<Filter className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
        </div>

      {/* Super Admin Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-900">Super Admin Access</h3>
          <p className="text-sm text-blue-700">
            This is a read-only view of the database. All data access is logged for security auditing.
            {DEMO_MODE && ' Currently viewing mock data in demonstration mode.'}
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">Read-Only Mode</h3>
          <p className="text-sm text-amber-700">
            This view provides read-only access to database records. To modify data, use the appropriate
            management pages (Users, Engineers, Requests, etc.) which enforce proper validation and audit logging.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPagination(prev => ({ ...prev, page: 1 }));
              setSearch('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? `${tab.color} text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
            <div className="text-sm text-gray-500">
              Showing {data.length} of {pagination.total} records
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-gray-500" />
            <CardTitle className="text-lg capitalize">{activeTab} Table</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={loadData} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Database className="w-12 h-12 mb-4 text-gray-300" />
              <p>No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {renderTableHeaders().map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => renderTableRow(item, index))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      </div>
    </AppShell>
  );
}
