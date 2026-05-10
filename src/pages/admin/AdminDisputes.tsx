import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { disputesApi, Dispute } from '../../api/client';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { 
  AlertTriangle, Loader2, CheckCircle, X, Eye, Clock, 
  User, FileText, RefreshCw, Ban, AlertCircle, DollarSign,
  ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';

// Dispute categories for display
const DISPUTE_CATEGORIES: Record<string, string> = {
  quality: 'Poor Quality',
  incomplete: 'Incomplete Work',
  overcharge: 'Overcharged',
  delay: 'Excessive Delay',
  behavior: 'Unprofessional',
  damage: 'Property Damage',
  other: 'Other',
};

// Resolution actions
const RESOLUTION_ACTIONS = [
  { value: 'no_action', label: 'No Action Needed', icon: CheckCircle },
  { value: 'partial_refund', label: 'Partial Refund', icon: DollarSign },
  { value: 'full_refund', label: 'Full Refund', icon: DollarSign },
  { value: 'warn_engineer', label: 'Warn Engineer', icon: AlertCircle },
  { value: 'warn_customer', label: 'Warn Customer', icon: AlertCircle },
  { value: 'block_engineer', label: 'Block Engineer', icon: Ban },
  { value: 'block_customer', label: 'Block Customer', icon: Ban },
];

// Status badge variants
const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  open: 'warning',
  in_review: 'info',
  resolved: 'success',
  rejected: 'error',
};

interface ResolutionModalProps {
  dispute: Dispute;
  onClose: () => void;
  onResolved: () => void;
}

function ResolutionModal({ dispute, onClose, onResolved }: ResolutionModalProps) {
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResolve = async () => {
    if (!action) {
      setError('Please select an action');
      return;
    }

    if ((action === 'partial_refund') && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      setError('Please enter a valid refund amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await disputesApi.resolve(dispute.id, {
        action,
        notes,
        refund_amount: action === 'partial_refund' ? parseFloat(refundAmount) : undefined,
      });
      onResolved();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError('');

    try {
      await disputesApi.reject(dispute.id, notes);
      onResolved();
    } catch (err: any) {
      setError(err.message || 'Failed to reject dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="font-semibold text-lg">Resolve Dispute #{dispute.id}</h3>
            <p className="text-sm text-slate-500">Request: {dispute.request?.request_number || `#${dispute.request_id}`}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Details */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Filed by</p>
              <p className="font-medium">{dispute.creator?.name} ({dispute.creator?.role})</p>
            </div>
            <div>
              <p className="text-slate-500">Against</p>
              <p className="font-medium">{dispute.against?.name} ({dispute.against?.role})</p>
            </div>
            <div>
              <p className="text-slate-500">Category</p>
              <p className="font-medium">{DISPUTE_CATEGORIES[dispute.category] || dispute.category}</p>
            </div>
            <div>
              <p className="text-slate-500">Filed on</p>
              <p className="font-medium">{new Date(dispute.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-slate-500 text-sm">Description</p>
            <p className="text-sm mt-1 p-2 bg-white rounded border">{dispute.description}</p>
          </div>
        </div>

        {/* Audit Log */}
        {dispute.audit_logs && dispute.audit_logs.length > 0 && (
          <div className="p-4 border-b border-slate-100">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Activity Log</h4>
            <div className="space-y-2">
              {dispute.audit_logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Clock className="w-3 h-3 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                    <span className="mx-1">—</span>
                    <span className="font-medium">{log.action}</span>
                    {log.performer_name && <span className="text-slate-500"> by {log.performer_name}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Resolution Action *</label>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTION_ACTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAction(opt.value)}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    action === opt.value 
                      ? 'border-brand bg-brand/5 text-brand' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {action === 'partial_refund' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Refund Amount (NIS) *</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
            <Textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add resolution notes (visible to both parties)..."
            />
          </div>

          {error && (
            <div className="p-3 bg-error/10 text-error text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleResolve} disabled={loading || !action}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Resolve Dispute
            </Button>
            <Button variant="outline" onClick={handleReject} disabled={loading} className="text-error border-error hover:bg-error/5">
              <X className="w-4 h-4 mr-2" />
              Reject Dispute
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDisputes() {
  const { isApiAvailable } = useData();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter, categoryFilter, pagination.page]);

  const loadDisputes = async () => {
    if (!isApiAvailable) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await disputesApi.getAllDisputes({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page: pagination.page,
      });
      setDisputes(result.disputes);
      setPagination(prev => ({
        ...prev,
        pages: result.pagination.pages,
        total: result.pagination.total,
      }));
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDispute = async (dispute: Dispute) => {
    try {
      const result = await disputesApi.getDisputeDetails(dispute.id);
      setSelectedDispute(result.dispute);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load dispute details:', err);
    }
  };

  const handleMarkInReview = async (dispute: Dispute) => {
    try {
      await disputesApi.updateStatus(dispute.id, 'in_review');
      loadDisputes();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleResolved = () => {
    setShowModal(false);
    setSelectedDispute(null);
    loadDisputes();
  };

  // Stats
  const openCount = disputes.filter(d => d.status === 'open').length;
  const inReviewCount = disputes.filter(d => d.status === 'in_review').length;

  return (
    <AppShell title="Disputes Management" subtitle="Review and resolve customer complaints">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={loadDisputes}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Open Disputes"
            value={openCount}
            subtitle="Awaiting review"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
          <WowKPICard
            title="In Review"
            value={inReviewCount}
            subtitle="Being processed"
            icon={<Eye className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Resolved"
            value={disputes.filter(d => d.status === 'resolved').length}
            subtitle="Successfully closed"
            icon={<CheckCircle className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Total"
            value={pagination.total}
            subtitle="All disputes"
            icon={<FileText className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
        </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-40"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-40"
          >
            <option value="">All Categories</option>
            {Object.entries(DISPUTE_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Disputes Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-2">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-2">No disputes found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">ID</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Request</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Filed By</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Against</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Category</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disputes.map(dispute => (
                    <tr key={dispute.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">#{dispute.id}</td>
                      <td className="px-4 py-3 text-sm">{dispute.request?.request_number || `#${dispute.request_id}`}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                            {dispute.creator?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{dispute.creator?.name}</p>
                            <p className="text-xs text-slate-500">{dispute.creator?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                            {dispute.against?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{dispute.against?.name}</p>
                            <p className="text-xs text-slate-500">{dispute.against?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{DISPUTE_CATEGORIES[dispute.category] || dispute.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[dispute.status] || 'default'}>
                          {dispute.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(dispute.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {dispute.status === 'open' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkInReview(dispute)}
                              title="Mark as In Review"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {(dispute.status === 'open' || dispute.status === 'in_review') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDispute(dispute)}
                            >
                              Resolve
                            </Button>
                          )}
                          {(dispute.status === 'resolved' || dispute.status === 'rejected') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDispute(dispute)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Resolution Modal */}
      {showModal && selectedDispute && (
        <ResolutionModal
          dispute={selectedDispute}
          onClose={() => { setShowModal(false); setSelectedDispute(null); }}
          onResolved={handleResolved}
        />
      )}
      </div>
    </AppShell>
  );
}
