import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { 
  Clock, AlertTriangle, CheckCircle, XCircle, Timer, 
  TrendingUp, Loader2, RefreshCw, User, MapPin, Calendar,
  Gauge, Lightbulb, ArrowRight, Bell, Zap
} from 'lucide-react';
import { adminSLAService, type SLARequest, type SLASummary, DEMO_MODE, generateSLARecommendations, formatTimeRemaining } from '../../services/admin';

// SLA Gauge Component
function SLAGauge({ value, label, size = 'md' }: { value: number; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (val: number) => {
    if (val >= 90) return 'text-emerald-500';
    if (val >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  const getTrackColor = (val: number) => {
    if (val >= 90) return 'stroke-emerald-500';
    if (val >= 70) return 'stroke-amber-500';
    return 'stroke-red-500';
  };
  const dimensions = size === 'lg' ? 180 : size === 'md' ? 140 : 100;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const progress = (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={dimensions} height={dimensions / 2 + 20} className="transform -rotate-0">
        {/* Background track */}
        <path
          d={`M ${strokeWidth/2} ${dimensions/2} A ${radius} ${radius} 0 0 1 ${dimensions - strokeWidth/2} ${dimensions/2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-200"
        />
        {/* Progress track */}
        <path
          d={`M ${strokeWidth/2} ${dimensions/2} A ${radius} ${radius} 0 0 1 ${dimensions - strokeWidth/2} ${dimensions/2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          className={getTrackColor(value)}
        />
      </svg>
      <div className={`-mt-8 text-center`}>
        <span className={`text-3xl font-bold ${getColor(value)}`}>{value}%</span>
        <p className="text-sm text-neutral-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// Countdown Badge Component
function CountdownBadge({ deadline, label }: { deadline: string | null; label: string }) {
  const timeInfo = formatTimeRemaining(deadline);
  if (!timeInfo) return null;
  
  const isOverdue = timeInfo.startsWith('-') || timeInfo.includes('overdue');
  const isUrgent = !isOverdue && (timeInfo.includes('min') || (timeInfo.includes('h') && parseInt(timeInfo) < 2));
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      isOverdue ? 'bg-red-100 text-red-700 animate-pulse' : 
      isUrgent ? 'bg-amber-100 text-amber-700' : 
      'bg-emerald-100 text-emerald-700'
    }`}>
      <Timer className="w-4 h-4" />
      <span>{timeInfo}</span>
      <span className="text-xs opacity-75">({label})</span>
    </div>
  );
}

// Recommendations Panel Component
function RecommendationsPanel() {
  const recommendations = generateSLARecommendations();
  
  if (recommendations.length === 0) return null;
  
  return (
    <Card className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-neutral-900">AI Recommendations</h3>
        <Badge variant="warning" size="sm">Auto-generated</Badge>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className={`p-3 rounded-lg border ${
            rec.priority === 'high' ? 'bg-red-50 border-red-200' :
            rec.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full ${
                rec.priority === 'high' ? 'bg-red-200' :
                rec.priority === 'medium' ? 'bg-amber-200' :
                'bg-blue-200'
              }`}>
                <Zap className={`w-4 h-4 ${
                  rec.priority === 'high' ? 'text-red-700' :
                  rec.priority === 'medium' ? 'text-amber-700' :
                  'text-blue-700'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-neutral-900">{rec.title}</p>
                <p className="text-xs text-neutral-600 mt-1">{rec.description}</p>
                {rec.affectedCount > 0 && (
                  <Badge variant="outline" size="sm" className="mt-2">
                    {rec.affectedCount} affected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminSLA() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SLASummary | null>(null);
  const [atRiskRequests, setAtRiskRequests] = useState<SLARequest[]>([]);
  const [breachedRequests, setBreachedRequests] = useState<SLARequest[]>([]);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const data = await adminSLAService.getDashboard();
      setSummary(data.summary);
      setAtRiskRequests(data.at_risk_requests || []);
      setBreachedRequests(data.breached_requests || []);
    } catch (err: any) {
      if (!DEMO_MODE) {
        setError(err.message || 'Failed to load SLA data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await adminSLAService.checkBreaches();
      fetchData(false);
    } catch (err) {
      if (!DEMO_MODE) {
        console.error('Failed to check breaches', err);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => fetchData(false), 120000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (deadline: string | null) => {
    if (!deadline) return 'N/A';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) {
      const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      const mins = Math.abs(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      return `${hours}h ${mins}m overdue`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    color: string;
    subtitle?: string;
  }) => (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );

  const RequestCard = ({ request, variant }: { request: SLARequest; variant: 'at_risk' | 'breached' }) => (
    <Card className={`p-4 ${variant === 'breached' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{request.request_number}</span>
            <Badge variant={request.type === 'quick' ? 'info' : 'default'}>
              {request.type}
            </Badge>
            <Badge variant={variant === 'breached' ? 'error' : 'warning'}>
              {variant === 'breached' ? 'SLA Breached' : 'At Risk'}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{request.status}</p>
        </div>
      </div>
      
      {/* Countdown Badge */}
      <div className="mb-3">
        {request.status === 'pending' ? (
          <CountdownBadge deadline={request.sla?.response_deadline || null} label="Response" />
        ) : (
          <CountdownBadge deadline={request.sla?.completion_deadline || null} label="Completion" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-neutral-600">
          <User className="w-4 h-4" />
          <span>{request.customer?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{request.location_text}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(request.created_at)}</span>
        </div>
        {request.engineer && (
          <div className="flex items-center gap-2 text-neutral-600">
            <User className="w-4 h-4" />
            <span>Eng: {request.engineer.name}</span>
          </div>
        )}
      </div>

      {request.sla?.response_breached && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Response SLA breached
        </div>
      )}
      {request.sla?.completion_breached && (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Completion SLA breached
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-neutral-900 font-medium">{error}</p>
        <Button onClick={() => fetchData()} className="mt-4">Try Again</Button>
      </Card>
    );
  }

  return (
    <AppShell title="SLA Monitoring" subtitle="Track response and completion times with AI-powered recommendations">
      <div className="space-y-6 animate-fade-in">
        <DemoModeBadge />
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            {summary && (summary.at_risk > 0 || summary.breached > 0) && (
              <Badge variant="warning" dot>
                <Bell className="w-3 h-3 mr-1" />
                {summary.at_risk + summary.breached} alerts
              </Badge>
            )}
          </div>
        </div>

        {/* WOW KPI Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WowKPICard
              title="Active Requests"
              value={summary.active_requests}
              subtitle="Being processed"
              icon={<Clock className="w-5 h-5" />}
              accentColor="#136F94"
            />
            <WowKPICard
              title="On Track"
              value={summary.on_track}
              subtitle="Within SLA"
              icon={<CheckCircle className="w-5 h-5" />}
              accentColor="#22c55e"
            />
            <WowKPICard
              title="At Risk"
              value={summary.at_risk}
              subtitle="Nearing deadline"
              icon={<AlertTriangle className="w-5 h-5" />}
              accentColor="#f59e0b"
            />
            <WowKPICard
              title="Breached"
              value={summary.breached}
              subtitle="Past deadline"
              icon={<XCircle className="w-5 h-5" />}
              accentColor="#ef4444"
            />
          </div>
        )}

        {summary && (
          <Card className="p-6">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 flex justify-center">
                <SLAGauge 
                  value={Math.round(100 - (summary.response_breach_rate + summary.completion_breach_rate) / 2)} 
                  label="Overall SLA Compliance"
                  size="lg"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    <span className="font-medium">Response SLA</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">{100 - summary.response_breach_rate}%</div>
                  <p className="text-sm text-neutral-500 mt-1">met target</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Completion SLA</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">{100 - summary.completion_breach_rate}%</div>
                  <p className="text-sm text-neutral-500 mt-1">met target</p>
                </div>
              </div>
            </div>
          </Card>
        )}

      {/* Recommendations Panel */}
      {summary && (summary.at_risk > 0 || summary.breached > 0) && (
        <RecommendationsPanel />
      )}

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Active Requests"
            value={summary.active_requests}
            icon={Clock}
            color="bg-sky-100 text-sky-600"
          />
          <StatCard
            title="On Track"
            value={summary.on_track}
            icon={CheckCircle}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            title="At Risk"
            value={summary.at_risk}
            icon={AlertTriangle}
            color="bg-amber-100 text-amber-600"
          />
          <StatCard
            title="Breached"
            value={summary.breached}
            icon={XCircle}
            color="bg-red-100 text-red-600"
          />
        </div>
      )}

      {/* Breach Rates */}
      {summary && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <CardTitle className="text-lg mb-4">SLA Performance</CardTitle>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Response SLA</span>
                  <span className="font-medium">{100 - summary.response_breach_rate}% met</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${100 - summary.response_breach_rate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Completion SLA</span>
                  <span className="font-medium">{100 - summary.completion_breach_rate}% met</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${100 - summary.completion_breach_rate}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <CardTitle className="text-lg mb-4">SLA Targets</CardTitle>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">Quick Request Response</span>
                <span className="font-medium">2 hours</span>
              </div>
              <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">Quick Request Completion</span>
                <span className="font-medium">24 hours</span>
              </div>
              <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">Late Request Response</span>
                <span className="font-medium">24 hours</span>
              </div>
              <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">Late Request Completion</span>
                <span className="font-medium">72 hours</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Breached Requests */}
      {breachedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Breached Requests ({breachedRequests.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {breachedRequests.map((req) => (
              <RequestCard key={req.id} request={req} variant="breached" />
            ))}
          </div>
        </div>
      )}

      {/* At Risk Requests */}
      {atRiskRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            At Risk Requests ({atRiskRequests.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {atRiskRequests.map((req) => (
              <RequestCard key={req.id} request={req} variant="at_risk" />
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {breachedRequests.length === 0 && atRiskRequests.length === 0 && (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-neutral-900">All Clear!</p>
          <p className="text-neutral-500 mt-1">No SLA breaches or at-risk requests</p>
        </Card>
      )}
      </div>
    </AppShell>
  );
}
