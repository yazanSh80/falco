/**
 * Admin Dashboard - Decision-Driven Control Center
 */
import { useState, useEffect } from 'react';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { KPICard } from '../../components/ui/kpi-card';
import { WowKPICard, WowActionCard } from '../../components/ui';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { 
  UserPlus, UserCheck, Trash2, MessageSquare, DollarSign, LogOut, Users, Shield, 
  TrendingUp, Clock, ArrowRight, Activity, MapPin, BarChart3, AlertTriangle, 
  ClipboardList, Timer, Database, Eye, CheckCircle, XCircle, Wifi, WifiOff,
  PieChart, Gauge, RefreshCw, Info, AlertCircle, Server
} from 'lucide-react';
import { useData } from '../../state/DataContext';
import {
  adminHealthService,
  generateRoleDistribution,
  generateRiskIndicators,
  generatePlatformConfidence,
  generateRecentActivity,
  DEMO_MODE
} from '../../services/admin';
import type { SystemHealth, RoleDistribution, RiskIndicator, PlatformConfidence, RecentActivity } from '../../types/admin';

// System Health Card Component
function SystemHealthCard({ health }: { health: SystemHealth | null }) {
  const getStatusIcon = () => {
    if (!health) return <Server className="w-5 h-5 text-neutral-400" />;
    switch (health.status) {
      case 'online': return <Wifi className="w-5 h-5 text-emerald-500" />;
      case 'degraded': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'offline': return <WifiOff className="w-5 h-5 text-red-500" />;
    }
  };
  const getStatusBadge = () => {
    if (!health) return <Badge variant="outline">Loading...</Badge>;
    switch (health.status) {
      case 'online': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Online</Badge>;
      case 'degraded': return <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" />Degraded</Badge>;
      case 'offline': return <Badge variant="error"><XCircle className="w-3 h-3 mr-1" />Offline</Badge>;
    }
  };
  const getBackendBadge = () => {
    if (!health) return null;
    return health.backend === 'connected' 
      ? <Badge variant="info">Backend Connected</Badge>
      : <Badge variant="outline">Demo Mode</Badge>;
  };
  return (
    <Card className="p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm">{getStatusIcon()}</div>
          <div>
            <h3 className="font-semibold text-neutral-900">System Health</h3>
            <p className="text-sm text-neutral-500">Real-time status</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Backend Status</span>
          {getBackendBadge()}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Last Sync</span>
          <span className="text-neutral-900 font-medium">{health ? new Date(health.lastSync).toLocaleTimeString() : '--:--'}</span>
        </div>
        {health && (
          <div className="flex gap-2 mt-3">
            <div className={`flex-1 p-2 rounded-lg text-center text-xs ${health.checks.database ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>Database</div>
            <div className={`flex-1 p-2 rounded-lg text-center text-xs ${health.checks.cache ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>Cache</div>
            <div className={`flex-1 p-2 rounded-lg text-center text-xs ${health.checks.storage ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>Storage</div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Role Distribution Widget
function RoleDistributionCard({ data }: { data: RoleDistribution }) {
  const total = data.total;
  const customerPct = Math.round((data.customers / total) * 100);
  const engineerPct = Math.round((data.engineers / total) * 100);
  const adminPct = Math.round((data.admins / total) * 100);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand" />
          <h3 className="font-semibold text-neutral-900">Role Distribution</h3>
        </div>
        <Badge variant="outline">{total.toLocaleString()} total</Badge>
      </div>
      <div className="h-4 rounded-full overflow-hidden flex mb-4">
        <div className="bg-purple-500 transition-all" style={{ width: `${customerPct}%` }} />
        <div className="bg-amber-500 transition-all" style={{ width: `${engineerPct}%` }} />
        <div className="bg-gold transition-all" style={{ width: `${adminPct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <div><p className="text-neutral-500">Customers</p><p className="font-semibold">{data.customers}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div><p className="text-neutral-500">Engineers</p><p className="font-semibold">{data.engineers}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gold" />
          <div><p className="text-neutral-500">Admins</p><p className="font-semibold">{data.admins}</p></div>
        </div>
      </div>
    </Card>
  );
}

// Risk Indicators Panel
function RiskIndicatorsPanel({ indicators, onNavigate }: { indicators: RiskIndicator[]; onNavigate: (url: string) => void }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-neutral-900">Risk Indicators</h3>
        </div>
        <Badge variant="warning">{indicators.filter(i => i.count > 0).length} active</Badge>
      </div>
      <div className="space-y-2">
        {indicators.map((indicator) => (
          <button key={indicator.id} onClick={() => onNavigate(indicator.actionUrl)}
            className={`w-full p-3 rounded-lg border flex items-center justify-between hover:shadow-sm transition-all ${getSeverityColor(indicator.severity)}`}>
            <div className="flex items-center gap-3">
              {getSeverityIcon(indicator.severity)}
              <div className="text-left">
                <p className="font-medium text-sm">{indicator.label}</p>
                <p className="text-xs opacity-75">{indicator.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{indicator.count}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// Platform Confidence Score
function ConfidenceScoreCard({ confidence }: { confidence: PlatformConfidence }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };
  return (
    <Card className="p-5 bg-gradient-to-br from-brand/5 to-gold/5 border-brand/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-brand" />
          <h3 className="font-semibold text-neutral-900">Platform Confidence</h3>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-neutral-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">{confidence.explanation}</div>
        </div>
      </div>
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${getScoreColor(confidence.score)}`}>{confidence.score}</div>
        <p className="text-sm text-neutral-500 mt-1">{getScoreLabel(confidence.score)}</p>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-neutral-600">SLA Compliance</span><span className="font-medium">{confidence.factors.slaCompliance}%</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">Dispute Rate</span><span className="font-medium">{confidence.factors.disputeRate}%</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">Approval Backlog</span><span className="font-medium">{confidence.factors.approvalBacklog}</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">Customer Satisfaction</span><span className="font-medium">{confidence.factors.customerSatisfaction}/5</span></div>
      </div>
    </Card>
  );
}

// Enhanced Recent Activity
function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="error" size="sm">CRITICAL</Badge>;
      case 'warning': return <Badge variant="warning" size="sm">WARN</Badge>;
      default: return <Badge variant="info" size="sm">INFO</Badge>;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-brand';
    }
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand" />
          <h3 className="font-semibold text-neutral-900">Recent Activity</h3>
        </div>
        <Button variant="ghost" size="sm"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(activity.type)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-neutral-900 text-sm truncate">{activity.action}</p>
                {getSeverityBadge(activity.severity)}
              </div>
              <p className="text-xs text-neutral-500">{activity.user}</p>
              {activity.performedBy && <p className="text-xs text-neutral-400 mt-1">By: {activity.performedBy}</p>}
            </div>
            <span className="text-xs text-neutral-400 whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setCurrentUser, engineers } = useData();
  
  const pendingEngineers = engineers.filter(e => e.status === 'pending').length;
  const acceptedEngineers = engineers.filter(e => e.status === 'accepted').length;
  const totalCustomers = 3;
  const totalTransactions = 1250;

  // Decision-driven state
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution | null>(null);
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([]);
  const [platformConfidence, setPlatformConfidence] = useState<PlatformConfidence | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all dashboard data in parallel
        const [health, roles, risks, confidence, activity] = await Promise.all([
          adminHealthService.getHealth(),
          Promise.resolve(generateRoleDistribution()),
          Promise.resolve(generateRiskIndicators()),
          Promise.resolve(generatePlatformConfidence()),
          Promise.resolve(generateRecentActivity())
        ]);
        setSystemHealth(health);
        setRoleDistribution(roles);
        setRiskIndicators(risks);
        setPlatformConfidence(confidence);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  // Mock trends
  const revenueTrend = [800, 920, 1100, 980, 1150, 1250, 1400];

  return (
    <AppShell title="Decision-Driven Control Center" subtitle="Real-time platform intelligence & governance">
      <div className="space-y-8 animate-fade-in">
        {/* Demo Mode Badge */}
        <DemoModeBadge />

      {/* Decision-Driven Top Row: System Health + Role Distribution + Platform Confidence */}
      <div className="grid md:grid-cols-3 gap-4">
        <SystemHealthCard health={systemHealth} />
        {roleDistribution && <RoleDistributionCard data={roleDistribution} />}
        {platformConfidence && <ConfidenceScoreCard confidence={platformConfidence} />}
      </div>

      {/* Risk Indicators Panel */}
      {riskIndicators.length > 0 && (
        <RiskIndicatorsPanel indicators={riskIndicators} onNavigate={navigate} />
      )}
      
      {/* KPI Stats - Mix of WOW and regular */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WowKPICard 
          title="Pending Engineers" 
          value={pendingEngineers}
          subtitle="Awaiting review"
          icon={<Clock className="w-5 h-5" />}
          accentColor="#f59e0b"
        />
        <KPICard 
          title="Active Engineers" 
          value={acceptedEngineers}
          variant="success"
          icon={<UserCheck className="w-5 h-5" />}
          change={{ value: 12, type: 'increase' }}
        />
        <KPICard 
          title="Total Customers" 
          value={totalCustomers}
          variant="brand"
          icon={<Users className="w-5 h-5" />}
        />
        <WowKPICard 
          title="Monthly Revenue" 
          value={`₪${totalTransactions}`}
          subtitle="This month"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
          change={18}
          accentColor="#D4AF37"
        />
      </div>

      {/* Admin Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h4 font-semibold text-text-primary">Admin Actions</h3>
          {pendingEngineers > 0 && (
            <Badge variant="warning" dot>
              {pendingEngineers} pending reviews
            </Badge>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Database Explorer - Featured */}
          <Card variant="interactive" className="group md:col-span-3 bg-gradient-to-r from-brand/5 to-success/5 dark:from-brand/10 dark:to-success/10 border-brand/30 dark:border-brand/20" onClick={() => navigate('/admin/database')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-brand to-success text-white transition-transform group-hover:scale-110">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">🔍 Database Explorer</CardTitle>
                <CardDescription>بحث متقدم وعرض تفصيلي لكل البيانات - مستخدمين، مهندسين، طلبات، معاملات، تقييمات</CardDescription>
              </div>
              <Badge variant="success" className="bg-brand">
                <Eye className="w-3 h-3 mr-1" />
                NEW
              </Badge>
              <ArrowRight className="w-5 h-5 text-brand/50 group-hover:text-brand transition-colors" />
            </div>
          </Card>
          
          {/* System Data Viewer */}
          <Card variant="interactive" className="group" onClick={() => navigate('/admin/data-viewer')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 transition-transform group-hover:scale-110">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Data Viewer</CardTitle>
                <CardDescription>Quick table view</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/add-admin')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gold/10 text-gold transition-transform group-hover:scale-110">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Add New Admin</CardTitle>
                <CardDescription>Create admin account</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-gold transition-colors" />
            </div>
          </Card>

          <Card 
            variant="interactive" 
            className={`group ${pendingEngineers > 0 ? 'border-warning/30' : ''}`}
            onClick={() => navigate('/admin/engineers')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand/10 text-brand transition-transform group-hover:scale-110">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Review Engineers</CardTitle>
                <CardDescription>Approve or reject</CardDescription>
              </div>
              {pendingEngineers > 0 && (
                <Badge variant="warning" size="sm">{pendingEngineers}</Badge>
              )}
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-brand transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/users')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-error/10 text-error transition-transform group-hover:scale-110">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Manage Users</CardTitle>
                <CardDescription>Block or delete accounts</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-error transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/reviews')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10 text-info transition-transform group-hover:scale-110">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">View Reviews</CardTitle>
                <CardDescription>Customer feedback</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-info transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/finances')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10 text-success transition-transform group-hover:scale-110">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Finances</CardTitle>
                <CardDescription>View transactions</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-success transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/disputes')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10 text-warning transition-transform group-hover:scale-110">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Disputes</CardTitle>
                <CardDescription>Resolve conflicts</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-warning transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/areas')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Service Areas</CardTitle>
                <CardDescription>Manage regions</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-purple-500 transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/reports')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 transition-transform group-hover:scale-110">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Reports</CardTitle>
                <CardDescription>Analytics & insights</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-sky-500 transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/sla')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 transition-transform group-hover:scale-110">
                <Timer className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">SLA Monitoring</CardTitle>
                <CardDescription>Track response times</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-rose-500 transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="group" onClick={() => navigate('/admin/audit-log')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-neutral-500/10 text-neutral-600 transition-transform group-hover:scale-110">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Audit Log</CardTitle>
                <CardDescription>Admin activity history</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
            </div>
          </Card>

          <Card variant="interactive" className="border-error/20 hover:border-error/40 group" onClick={handleLogout}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-error/10 text-error">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium text-error">Log Out</CardTitle>
                <CardDescription>Sign out safely</CardDescription>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      {recentActivity.length > 0 && (
        <RecentActivityCard activities={recentActivity} />
      )}
      </div>
    </AppShell>
  );
}
