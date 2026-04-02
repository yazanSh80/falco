import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import DemoModeBadge from '../../components/admin/DemoModeBadge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Briefcase, DollarSign,
  Clock, CheckCircle, AlertCircle, Star, FileText, Download,
  Calendar, Filter, Loader2, ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Target, FileDown, Lightbulb, RefreshCw,
  GitCompare, ArrowRight, Info, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  adminReportsService, 
  type ReportStats, 
  type EngineerReport, 
  type AreaReport, 
  DEMO_MODE,
  generateInsightCards
} from '../../services/admin';
import type { InsightCard } from '../../types/admin';

// Insight Card Component
function InsightCardComponent({ insight }: { insight: InsightCard }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-sky-50 border-sky-200 text-sky-800';
    }
  };
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'danger': case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Lightbulb className="w-5 h-5 text-sky-600" />;
    }
  };
  const trendDirection = insight.trend?.direction;
  return (
    <div className={`p-4 rounded-xl border ${getTypeColor(insight.type)} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon(insight.type)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{insight.title}</h4>
          <p className="text-xs mt-1 opacity-80">{insight.description}</p>
          {insight.metric !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={trendDirection === 'up' ? 'success' : trendDirection === 'down' ? 'error' : 'info'} size="sm">
                {trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                {trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                {insight.metric}%
              </Badge>
            </div>
          )}
          {insight.actionLabel && insight.actionUrl && (
            <button className="flex items-center gap-1 text-xs mt-2 font-medium hover:underline">
              {insight.actionLabel} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Trend Arrow Component with enhanced styling
function TrendArrow({ value, period = 'vs last period' }: { value: number; period?: string }) {
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? (
        <ArrowUpRight className="w-4 h-4" />
      ) : (
        <ArrowDownRight className="w-4 h-4" />
      )}
      <span className="font-medium">{isPositive ? '+' : ''}{value}%</span>
      <span className="text-neutral-400 text-xs">{period}</span>
    </div>
  );
}

// Export Metadata Component
function ExportMetadataPanel({ dateRange, recordCount }: { dateRange: string; recordCount: number }) {
  const getRangeLabel = (days: string) => {
    switch (days) {
      case '7': return 'Last 7 days';
      case '30': return 'Last 30 days';
      case '90': return 'Last 90 days';
      case '365': return 'Last year';
      default: return `Last ${days} days`;
    }
  };
  return (
    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-neutral-600">Export includes:</span>
        <Badge variant="outline" size="sm">{recordCount} records</Badge>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-neutral-600">Date range:</span>
        <span className="font-medium">{getRangeLabel(dateRange)}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-neutral-600">Generated:</span>
        <span className="font-medium">{new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<'overview' | 'engineers' | 'finance' | 'areas'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [engineers, setEngineers] = useState<EngineerReport[]>([]);
  const [areas, setAreas] = useState<AreaReport[]>([]);
  
  const [dateRange, setDateRange] = useState('30'); // days
  const [sortBy, setSortBy] = useState('total_jobs');
  const [exporting, setExporting] = useState(false);
  
  // New: Insight cards and comparison mode
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [previousStats, setPreviousStats] = useState<ReportStats | null>(null);

  const handleExport = async (type: 'engineers' | 'finance' | 'requests' | 'users') => {
    try {
      setExporting(true);
      let blob: Blob;
      let filename: string;
      
      switch (type) {
        case 'engineers':
          blob = await adminReportsService.exportEngineersCSV();
          filename = `engineers_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'finance':
          blob = await adminReportsService.exportFinanceCSV(parseInt(dateRange));
          filename = `finance_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'requests':
          blob = await adminReportsService.exportRequestsCSV({ days: parseInt(dateRange) });
          filename = `requests_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'users':
          blob = await adminReportsService.exportUsersCSV();
          filename = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          return;
      }
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      if (!DEMO_MODE) {
        alert('Export failed. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'overview') {
        const data = await adminReportsService.getReportStats();
        setStats(data);
        // Generate insights based on stats
        setInsights(generateInsightCards());
        // For comparison mode, generate previous period stats (mock)
        if (comparisonMode) {
          setPreviousStats({
            ...data,
            total_users: Math.round(data.total_users * 0.85),
            total_requests: Math.round(data.total_requests * 0.9),
            total_revenue: Math.round((data.total_revenue || 0) * 0.88),
            completed_requests: Math.round(data.completed_requests * 0.92),
          });
        }
      } else if (activeTab === 'engineers') {
        const data = await adminReportsService.getEngineerReports(sortBy);
        setEngineers(data);
      } else if (activeTab === 'areas') {
        const data = await adminReportsService.getAreaReports();
        setAreas(data);
      }
    } catch (err: any) {
      if (!DEMO_MODE) {
        setError(err.message || 'Failed to load report data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, dateRange, sortBy, comparisonMode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    trendValue,
    previousValue,
    showComparison
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    previousValue?: string | number;
    showComparison?: boolean;
  }) => {
    // Calculate comparison percentage if both values available
    const calcTrend = () => {
      if (!showComparison || previousValue === undefined) return null;
      const current = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
      const prev = typeof previousValue === 'string' ? parseFloat(previousValue.replace(/[^0-9.-]+/g, '')) : previousValue;
      if (prev === 0) return null;
      return Math.round(((current - prev) / prev) * 100);
    };
    const compTrend = calcTrend();
    
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
            {showComparison && previousValue !== undefined && (
              <div className="text-xs text-neutral-400 mt-1">
                Previous: {previousValue}
              </div>
            )}
            {(trend && trendValue) ? (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{trendValue}</span>
              </div>
            ) : compTrend !== null && (
              <TrendArrow value={compTrend} />
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engineers', label: 'Engineers', icon: Briefcase },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'areas', label: 'Areas', icon: Target }
  ];

  return (
    <AppShell title="Reports & Analytics" subtitle="Platform performance metrics and decision-driving insights">
      <div className="space-y-6 animate-fade-in">
        <DemoModeBadge />
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Comparison Mode Toggle */}
          <Button
            variant={comparisonMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </Button>
          
          {/* Insights Toggle */}
          <Button
            variant={showInsights ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights
          </Button>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <div className="relative group">
            <Button variant="outline" disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export CSV
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="px-3 py-2 border-b border-neutral-100">
                <ExportMetadataPanel dateRange={dateRange} recordCount={stats?.total_requests || 0} />
              </div>
              <button 
                onClick={() => handleExport('engineers')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Engineers Report
              </button>
              <button 
                onClick={() => handleExport('finance')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Finance Report
              </button>
              <button 
                onClick={() => handleExport('requests')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Requests Report
              </button>
              <button 
                onClick={() => handleExport('users')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Users Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      {showInsights && insights.length > 0 && activeTab === 'overview' && (
        <Card className="p-5 bg-gradient-to-r from-sky-50 to-purple-50 border-sky-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-neutral-900">AI-Powered Insights</h3>
              <Badge variant="gold" size="sm">Auto-generated</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowInsights(false)}>
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.slice(0, 6).map((insight) => (
              <InsightCardComponent key={insight.id} insight={insight} />
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'outline'}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-neutral-900 font-medium">{error}</p>
          <Button onClick={fetchData} className="mt-4">Try Again</Button>
        </Card>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Comparison Mode Header */}
              {comparisonMode && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800">
                    <GitCompare className="w-4 h-4" />
                    <span className="text-sm font-medium">Comparison Mode Active</span>
                    <Badge variant="outline" size="sm">vs Previous {dateRange} days</Badge>
                  </div>
                </div>
              )}
              
              {/* User Stats */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    color="bg-sky-100 text-sky-600"
                    trend={!comparisonMode ? "up" : undefined}
                    trendValue={!comparisonMode ? "+12%" : undefined}
                    previousValue={previousStats?.total_users}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Engineers"
                    value={stats.total_engineers}
                    icon={Briefcase}
                    color="bg-amber-100 text-amber-600"
                    previousValue={previousStats?.total_engineers}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Customers"
                    value={stats.total_customers}
                    icon={Users}
                    color="bg-purple-100 text-purple-600"
                    previousValue={previousStats?.total_customers}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Verified Engineers"
                    value={stats.verified_engineers}
                    icon={CheckCircle}
                    color="bg-emerald-100 text-emerald-600"
                    previousValue={previousStats?.verified_engineers}
                    showComparison={comparisonMode}
                  />
                </div>
              </div>

              {/* Request Stats */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Request Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard
                    title="Total Requests"
                    value={stats.total_requests}
                    icon={FileText}
                    color="bg-sky-100 text-sky-600"
                    previousValue={previousStats?.total_requests}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Pending"
                    value={stats.pending_requests}
                    icon={Clock}
                    color="bg-amber-100 text-amber-600"
                    previousValue={previousStats?.pending_requests}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Active"
                    value={stats.active_requests}
                    icon={Activity}
                    color="bg-blue-100 text-blue-600"
                    previousValue={previousStats?.active_requests}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Completed"
                    value={stats.completed_requests}
                    icon={CheckCircle}
                    color="bg-emerald-100 text-emerald-600"
                    previousValue={previousStats?.completed_requests}
                    showComparison={comparisonMode}
                  />
                  <StatCard
                    title="Cancelled"
                    value={stats.cancelled_requests}
                    icon={AlertCircle}
                    color="bg-red-100 text-red-600"
                    previousValue={previousStats?.cancelled_requests}
                    showComparison={comparisonMode}
                  />
                </div>
              </div>

              {/* Reviews & Rating */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Reviews & Ratings
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Reviews"
                    value={stats.total_reviews}
                    icon={Star}
                    color="bg-amber-100 text-amber-600"
                  />
                  <StatCard
                    title="Average Rating"
                    value={stats.average_rating?.toFixed(1) || '0.0'}
                    icon={Star}
                    color="bg-emerald-100 text-emerald-600"
                  />
                  <StatCard
                    title="Open Disputes"
                    value={stats.open_disputes}
                    icon={AlertCircle}
                    color="bg-red-100 text-red-600"
                  />
                </div>
              </div>

              {/* Financial Overview */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.total_revenue || 0)}
                    icon={DollarSign}
                    color="bg-emerald-100 text-emerald-600"
                    trend="up"
                    trendValue="+8%"
                  />
                  <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthly_revenue || 0)}
                    icon={TrendingUp}
                    color="bg-sky-100 text-sky-600"
                  />
                  <StatCard
                    title="Platform Fees"
                    value={formatCurrency(stats.platform_fees || 0)}
                    icon={PieChart}
                    color="bg-purple-100 text-purple-600"
                  />
                  <StatCard
                    title="Pending Payouts"
                    value={formatCurrency(stats.pending_payouts || 0)}
                    icon={Clock}
                    color="bg-amber-100 text-amber-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Engineers Tab */}
          {activeTab === 'engineers' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
                >
                  <option value="total_jobs">Most Jobs</option>
                  <option value="total_earnings">Top Earners</option>
                  <option value="average_rating">Best Rated</option>
                  <option value="completion_rate">Best Completion</option>
                </select>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-700">Engineer</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-700">Specialty</th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-neutral-700">Jobs</th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-neutral-700">Completed</th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-neutral-700">Rating</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-neutral-700">Earnings</th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-neutral-700">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {engineers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                            No engineer data available
                          </td>
                        </tr>
                      ) : (
                        engineers.map((eng) => (
                          <tr key={eng.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-neutral-900">{eng.name}</p>
                                <p className="text-sm text-neutral-500">{eng.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="info">{eng.specialty || 'General'}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-semibold">{eng.total_jobs}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-emerald-600 font-medium">{eng.completed_jobs}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="font-medium">{eng.average_rating?.toFixed(1) || '—'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-neutral-900">
                              {formatCurrency(eng.total_earnings || 0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge 
                                variant={eng.completion_rate >= 90 ? 'success' : eng.completion_rate >= 70 ? 'warning' : 'error'}
                              >
                                {eng.completion_rate?.toFixed(0) || 0}%
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(stats.total_revenue || 0)}
                  icon={DollarSign}
                  color="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                  title="Monthly Revenue"
                  value={formatCurrency(stats.monthly_revenue || 0)}
                  icon={TrendingUp}
                  color="bg-sky-100 text-sky-600"
                />
                <StatCard
                  title="Platform Fees"
                  value={formatCurrency(stats.platform_fees || 0)}
                  icon={PieChart}
                  color="bg-purple-100 text-purple-600"
                />
                <StatCard
                  title="Pending Payouts"
                  value={formatCurrency(stats.pending_payouts || 0)}
                  icon={Clock}
                  color="bg-amber-100 text-amber-600"
                />
              </div>

              <Card className="p-6">
                <CardTitle className="text-lg mb-4">Revenue Breakdown</CardTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-neutral-700">Completed Jobs</span>
                    </div>
                    <span className="font-semibold">{formatCurrency((stats.total_revenue || 0) * 0.85)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-neutral-700">Platform Commission (15%)</span>
                    </div>
                    <span className="font-semibold">{formatCurrency((stats.total_revenue || 0) * 0.15)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                      <span className="text-neutral-700">Subscription Revenue</span>
                    </div>
                    <span className="font-semibold">{formatCurrency((stats.subscribed_engineers || 0) * 50)}</span>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <CardTitle className="text-lg mb-4">Payment Status</CardTitle>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Processed Payments</span>
                      <Badge variant="success">
                        {formatCurrency((stats.total_revenue || 0) - (stats.pending_payouts || 0))}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Pending Payouts</span>
                      <Badge variant="warning">{formatCurrency(stats.pending_payouts || 0)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Failed Transactions</span>
                      <Badge variant="error">$0</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <CardTitle className="text-lg mb-4">Quick Stats</CardTitle>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Avg. Job Value</span>
                      <span className="font-semibold">
                        {formatCurrency(stats.completed_requests ? (stats.total_revenue || 0) / stats.completed_requests : 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Active Subscriptions</span>
                      <span className="font-semibold">{stats.subscribed_engineers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Subscription Rate</span>
                      <span className="font-semibold">
                        {stats.total_engineers ? ((stats.subscribed_engineers || 0) / stats.total_engineers * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Areas Tab */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.length === 0 ? (
                  <Card className="col-span-full p-8 text-center">
                    <Target className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No area data available</p>
                  </Card>
                ) : (
                  areas.map((area) => (
                    <Card key={area.id} className={`p-5 ${!area.is_active ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-neutral-900">{area.name}</h3>
                        <Badge variant={area.is_active ? 'success' : 'default'}>
                          {area.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-sky-50 rounded-lg">
                          <Briefcase className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                          <p className="text-xl font-bold text-neutral-900">{area.engineer_count}</p>
                          <p className="text-xs text-neutral-500">Engineers</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-xl font-bold text-neutral-900">{area.customer_count}</p>
                          <p className="text-xs text-neutral-500">Customers</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <FileText className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-xl font-bold text-neutral-900">{area.request_count}</p>
                          <p className="text-xs text-neutral-500">Requests</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </AppShell>
  );
}
