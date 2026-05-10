import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { 
  MapPin, Plus, Edit2, Trash2, Check, X, Loader2, AlertCircle, 
  Users, Briefcase, TrendingUp, Search, ToggleLeft, ToggleRight,
  Activity, Gauge, AlertTriangle, Info, Zap
} from 'lucide-react';
import { adminAreasService, type Area, DEMO_MODE, generateAreaHealthScore } from '../../services/admin';

// Health Score Badge Component
function HealthScoreBadge({ engineerCount, requestCount }: { engineerCount: number; requestCount: number }) {
  const healthData = generateAreaHealthScore(engineerCount, requestCount);
  
  const getStatusColor = () => {
    switch (healthData.coverage) {
      case 'excellent': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'good': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'fair': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
    }
  };
  
  const getStatusIcon = () => {
    switch (healthData.coverage) {
      case 'excellent': return <Check className="w-3 h-3" />;
      case 'good': return <TrendingUp className="w-3 h-3" />;
      case 'fair': return <AlertTriangle className="w-3 h-3" />;
      case 'poor': return <AlertCircle className="w-3 h-3" />;
    }
  };
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{healthData.score}/100</span>
    </div>
  );
}

// Capacity Indicator Component
function CapacityIndicator({ engineerCount, requestCount }: { engineerCount: number; requestCount: number }) {
  const healthData = generateAreaHealthScore(engineerCount, requestCount);
  const capacityPercent = healthData.capacityPercent;
  
  const getCapacityColor = () => {
    if (capacityPercent >= 80) return 'bg-emerald-500';
    if (capacityPercent >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const getSuggestion = () => {
    if (healthData.engineersRequired > healthData.engineersAvailable) {
      const needed = healthData.engineersRequired - healthData.engineersAvailable;
      return `Need ${needed} more engineer${needed > 1 ? 's' : ''}`;
    }
    return null;
  };
  
  const suggestion = getSuggestion();
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-neutral-500">Capacity</span>
        <span className={`font-medium ${capacityPercent >= 80 ? 'text-emerald-600' : capacityPercent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
          {capacityPercent}%
        </span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${getCapacityColor()}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }} />
      </div>
      {suggestion && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {suggestion}
        </p>
      )}
    </div>
  );
}

export default function AdminAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ name: '', name_ar: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAreasService.getAreas(showInactive, true);
      setAreas(data.areas);
    } catch (err: any) {
      if (!DEMO_MODE) {
        setError(err.message || 'Failed to load areas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [showInactive]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', name_ar: '', description: '' });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (area: Area) => {
    setModalMode('edit');
    setEditingArea(area);
    setFormData({
      name: area.name,
      name_ar: area.name_ar || '',
      description: area.description || ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Area name is required');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      if (modalMode === 'create') {
        await adminAreasService.createArea({
          name: formData.name.trim(),
          name_ar: formData.name_ar.trim() || undefined,
          description: formData.description.trim() || undefined
        });
      } else if (editingArea) {
        await adminAreasService.updateArea(editingArea.id, {
          name: formData.name.trim(),
          name_ar: formData.name_ar.trim() || undefined,
          description: formData.description.trim() || undefined
        });
      }

      setShowModal(false);
      fetchAreas();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save area');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (area: Area) => {
    try {
      await adminAreasService.toggleAreaStatus(area.id, !area.is_active);
      fetchAreas();
    } catch (err: any) {
      alert(err.message || 'Failed to update area');
    }
  };

  const handleDelete = async (areaId: number) => {
    try {
      setDeleteLoading(true);
      await adminAreasService.deleteArea(areaId);
      setDeleteConfirm(null);
      fetchAreas();
    } catch (err: any) {
      alert(err.message || 'Failed to delete area');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (area.name_ar && area.name_ar.includes(searchQuery))
  );

  const totalEngineers = areas.reduce((sum, a) => sum + (a.stats?.engineer_count || 0), 0);
  const totalCustomers = areas.reduce((sum, a) => sum + (a.stats?.customer_count || 0), 0);
  const activeAreas = areas.filter(a => a.is_active).length;

  return (
    <AppShell title="Service Areas" subtitle="Manage regions where engineers can operate">
      <div className="space-y-6 animate-fade-in">
        <DemoModeBadge />
        {/* Header */}
        <div className="flex justify-end">
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Area
          </Button>
        </div>

        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Areas"
            value={areas.length}
            subtitle="Service regions"
            icon={<MapPin className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Active Areas"
            value={activeAreas}
            subtitle="Currently operating"
            icon={<Check className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Engineers"
            value={totalEngineers}
            subtitle="Across all areas"
            icon={<Briefcase className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Customers"
            value={totalCustomers}
            subtitle="Registered users"
            icon={<Users className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
        </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showInactive ? 'primary' : 'outline'}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
            {showInactive ? 'Showing All' : 'Active Only'}
          </Button>
        </div>
      </Card>

      {/* Areas List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-neutral-900 font-medium">{error}</p>
          <Button onClick={fetchAreas} className="mt-4">Try Again</Button>
        </Card>
      ) : filteredAreas.length === 0 ? (
        <Card className="p-6 text-center">
          <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-900 font-medium">No areas found</p>
          <p className="text-neutral-500 text-sm mt-1">
            {searchQuery ? 'Try a different search term' : 'Create your first service area'}
          </p>
          {!searchQuery && (
            <Button onClick={openCreateModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Area
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map((area) => (
            <Card key={area.id} className={`p-5 ${!area.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  <h3 className="font-semibold text-neutral-900">{area.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <HealthScoreBadge 
                    engineerCount={area.stats?.engineer_count || 0} 
                    requestCount={area.stats?.request_count || 0} 
                  />
                  <Badge variant={area.is_active ? 'success' : 'default'} size="sm">
                    {area.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {area.name_ar && (
                <p className="text-neutral-600 text-sm mb-2" dir="rtl">{area.name_ar}</p>
              )}

              {area.description && (
                <p className="text-neutral-500 text-sm mb-3 line-clamp-2">{area.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="font-semibold text-neutral-900">{area.stats?.engineer_count || 0}</p>
                  <p className="text-xs text-neutral-500">Engineers</p>
                </div>
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="font-semibold text-neutral-900">{area.stats?.customer_count || 0}</p>
                  <p className="text-xs text-neutral-500">Customers</p>
                </div>
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="font-semibold text-neutral-900">{area.stats?.request_count || 0}</p>
                  <p className="text-xs text-neutral-500">Requests</p>
                </div>
              </div>

              {/* Capacity Indicator */}
              <CapacityIndicator 
                engineerCount={area.stats?.engineer_count || 0} 
                requestCount={area.stats?.request_count || 0} 
              />

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditModal(area)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(area)}
                >
                  {area.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
                {deleteConfirm === area.id ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(area.id)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(area.id)}
                    disabled={(area.stats?.engineer_count || 0) > 0 || (area.stats?.customer_count || 0) > 0}
                    title={(area.stats?.engineer_count || 0) > 0 || (area.stats?.customer_count || 0) > 0 
                      ? 'Cannot delete area with users' 
                      : 'Delete area'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <CardTitle className="text-xl mb-4">
              {modalMode === 'create' ? 'Add New Area' : 'Edit Area'}
            </CardTitle>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Area Name (English) *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Gaza City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Area Name (Arabic)
                </label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="مثال: مدينة غزة"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={formLoading}>
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : modalMode === 'create' ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {modalMode === 'create' ? 'Create Area' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      </div>
    </AppShell>
  );
}