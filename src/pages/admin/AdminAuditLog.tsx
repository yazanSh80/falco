import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { 
  ClipboardList, Search, Filter, Loader2, AlertCircle, 
  User, Shield, Calendar, Clock, ChevronLeft, ChevronRight,
  List, LayoutList, AlertTriangle, CheckCircle, XCircle, Info,
  Fingerprint, MapPin, Download, RefreshCw
} from 'lucide-react';
import { adminAuditService, type AuditLog, DEMO_MODE, getSeverityFromAction } from '../../services/admin';
import type { AuditSeverity } from '../../types/admin';

// Severity configuration - matches AuditSeverity type
const SEVERITY_CONFIG: Record<AuditSeverity, { color: string; icon: typeof XCircle; label: string }> = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'CRITICAL' },
  warning: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'WARNING' },
  info: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info, label: 'INFO' }
};

const ACTION_COLORS: Record<string, string> = {
  approve_engineer: 'success',
  reject_engineer: 'error',
  block_user: 'error',
  unblock_user: 'success',
  delete_user: 'error',
  create_admin: 'info',
  resolve_dispute: 'success',
  area_create: 'info',
  area_update: 'warning',
  area_delete: 'error',
  permission_update: 'warning'
};

const ACTION_LABELS: Record<string, string> = {
  approve_engineer: 'Approved Engineer',
  reject_engineer: 'Rejected Engineer',
  block_user: 'Blocked User',
  unblock_user: 'Unblocked User',
  delete_user: 'Deleted User',
  create_admin: 'Created Admin',
  resolve_dispute: 'Resolved Dispute',
  area_create: 'Created Area',
  area_update: 'Updated Area',
  area_delete: 'Deleted Area',
  permission_update: 'Updated Permissions'
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [page, setPage] = useState(1);
  
  // Enhanced: View mode and refresh
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Get severity for a log entry
  const getLogSeverity = (actionType: string): AuditSeverity => {
    return getSeverityFromAction(actionType);
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const fetchActionTypes = async () => {
    try {
      const data = await adminAuditService.getActionTypes();
      setActionTypes(data.action_types || []);
    } catch (err) {
      if (!DEMO_MODE) {
        console.error('Failed to load action types', err);
      }
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page };
      if (selectedAction) params.action_type = selectedAction;
      if (selectedTarget) params.target_type = selectedTarget;
      
      const data = await adminAuditService.getLogs(params);
      setLogs(data.audit_logs || []);
      setPagination(data.pagination);
    } catch (err: any) {
      if (!DEMO_MODE) {
        setError(err.message || 'Failed to load audit logs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionTypes();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, selectedTarget]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDetails = (details: Record<string, any> | null) => {
    if (!details) return null;
    
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="text-xs text-neutral-500">
        <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
      </div>
    ));
  };

  const targetTypes = ['user', 'engineer', 'area', 'dispute', 'request'];

  return (
    <AppShell title="Security Audit Log" subtitle="Track all administrative actions with full accountability">
      <div className="space-y-6 animate-fade-in">
        <DemoModeBadge />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-brand' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-white shadow-sm text-brand' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="info">
              <Shield className="w-3 h-3 mr-1" />
              Security Grade
            </Badge>
          </div>
        </div>

        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Logs"
            value={pagination?.total || logs.length}
            subtitle="Audit entries"
            icon={<ClipboardList className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Critical Actions"
            value={logs.filter(l => getLogSeverity(l.action_type) === 'critical').length}
            subtitle="High priority"
            icon={<XCircle className="w-5 h-5" />}
            accentColor="#ef4444"
          />
          <WowKPICard
            title="Warnings"
            value={logs.filter(l => getLogSeverity(l.action_type) === 'warning').length}
            subtitle="Medium priority"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
          <WowKPICard
            title="Info Actions"
            value={logs.filter(l => getLogSeverity(l.action_type) === 'info').length}
            subtitle="Informational"
            icon={<Info className="w-5 h-5" />}
            accentColor="#22c55e"
          />
        </div>

        {/* Last Refresh Indicator */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Clock className="w-3 h-3" />
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

      {/* Enhanced Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
            >
              <option value="">All Actions</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>
                  {ACTION_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Target Type</label>
            <select
              value={selectedTarget}
              onChange={(e) => { setSelectedTarget(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
            >
              <option value="">All Targets</option>
              {targetTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => { setSelectedSeverity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
            >
              <option value="">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="warning">🟡 Warning</option>
              <option value="info">🔵 Info</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => { setSelectedAction(''); setSelectedTarget(''); setSelectedSeverity(''); setPage(1); }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-neutral-900 font-medium">{error}</p>
          <Button onClick={fetchLogs} className="mt-4">Try Again</Button>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-6 text-center">
          <ClipboardList className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-900 font-medium">No audit logs found</p>
          <p className="text-neutral-500 text-sm mt-1">
            {selectedAction || selectedTarget ? 'Try adjusting your filters' : 'No admin actions have been logged yet'}
          </p>
        </Card>
      ) : (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {logs.filter(log => !selectedSeverity || getLogSeverity(log.action_type) === selectedSeverity).map((log) => {
                const severity = getLogSeverity(log.action_type);
                const SeverityIcon = SEVERITY_CONFIG[severity].icon;
                return (
                  <Card key={log.id} className={`p-4 border-l-4 ${severity === 'critical' ? 'border-l-red-500' : severity === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${SEVERITY_CONFIG[severity].color.split(' ')[0]}`}>
                        <SeverityIcon className={`w-5 h-5 ${SEVERITY_CONFIG[severity].color.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <Badge variant={ACTION_COLORS[log.action_type] as any || 'default'}>
                            {ACTION_LABELS[log.action_type] || log.action_type.replace(/_/g, ' ')}
                          </Badge>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${SEVERITY_CONFIG[severity].color}`}>
                            {SEVERITY_CONFIG[severity].label}
                          </span>
                          <Badge variant="outline">
                            {log.target_type}#{log.target_id}
                          </Badge>
                        </div>
                        <div className="flex items-center flex-wrap gap-3 text-sm text-neutral-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{log.admin_name || `Admin #${log.admin_id}`}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                          {log.ip_address && (
                            <div className="flex items-center gap-1 text-neutral-400">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">{log.ip_address}</span>
                            </div>
                          )}
                        </div>
                        {log.details && (
                          <div className="mt-2 p-2 bg-neutral-50 rounded-lg text-xs">
                            {formatDetails(log.details)}
                          </div>
                        )}
                        {/* Admin Signature */}
                        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-400">
                          <Fingerprint className="w-3 h-3" />
                          <span>Signed by: {log.admin_name || `Admin #${log.admin_id}`}</span>
                          <span>•</span>
                          <span>ID: {log.id}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200" />
              <div className="space-y-4">
                {logs.filter(log => !selectedSeverity || getLogSeverity(log.action_type) === selectedSeverity).map((log, index) => {
                  const severity = getLogSeverity(log.action_type);
                  const SeverityIcon = SEVERITY_CONFIG[severity].icon;
                  return (
                    <div key={log.id} className="relative flex items-start gap-4 pl-4">
                      <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center ${severity === 'critical' ? 'bg-red-500' : severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                        <SeverityIcon className="w-3 h-3 text-white" />
                      </div>
                      <Card className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={ACTION_COLORS[log.action_type] as any || 'default'} size="sm">
                              {ACTION_LABELS[log.action_type] || log.action_type.replace(/_/g, ' ')}
                            </Badge>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${SEVERITY_CONFIG[severity].color}`}>
                              {SEVERITY_CONFIG[severity].label}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500">{formatDate(log.created_at)}</span>
                        </div>
                        <p className="text-sm text-neutral-700">
                          <span className="font-medium">{log.admin_name || `Admin #${log.admin_id}`}</span>
                          {' performed action on '}
                          <span className="font-medium">{log.target_type}#{log.target_id}</span>
                        </p>
                        {log.details && (
                          <div className="mt-2 p-2 bg-neutral-50 rounded text-xs">
                            {formatDetails(log.details)}
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing {((page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-neutral-600">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </AppShell>
  );
}
