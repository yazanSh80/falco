import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { KPICard } from '../../components/ui/kpi-card';
import { WowKPICard, WowActionCard } from '../../components/ui';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { StatusBadge } from '../../components/ui/status-timeline';
import AppShell from '../../layouts/AppShell';
import { useNavigate } from 'react-router-dom';
import { Zap, Briefcase, User, DollarSign, Bell, Ban, LogOut, CheckCircle, Clock, TrendingUp, ArrowRight, Star, CreditCard, AlertCircle } from 'lucide-react';
import { useData } from '../../state/DataContext';

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const { setCurrentUser, engineerJobs, transactions, currentUser } = useData();
  
  const isPending = currentUser?.verification_status === 'pending' || currentUser?.status === 'pending';
  const engineerTransactions = transactions.filter(t => t.engineerId === currentUser?.id);
  const totalEarnings = engineerTransactions.reduce((sum, t) => sum + t.amount, 0);
  const tasksToday = engineerJobs.filter(j => j.status === 'In Progress').length;
  const completedJobs = engineerJobs.filter(j => j.status === 'Completed').length;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  // Mock data for trends
  const earningsTrend = [120, 180, 150, 220, 280, 310, 290];

  return (
    <AppShell 
      title={`Welcome${currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!`}
      subtitle={isPending ? 'Your account is being reviewed' : "Here's your overview for today"}
    >
      <div className="space-y-8 animate-fade-in">
        {/* Pending Approval Banner */}
      {isPending && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning-dark">Account Pending Approval</h3>
            <p className="text-body-sm text-text-secondary mt-1">
              Your engineer account is under review by our admin team. You'll be able to accept jobs once approved.
              This usually takes 24-48 hours.
            </p>
          </div>
          <Badge variant="warning" size="lg" className="ml-auto flex-shrink-0">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending Review
          </Badge>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-hero rounded-2xl p-6 md:p-8 text-white shadow-brand relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-light/20 rounded-full blur-2xl" />
        
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser?.name || 'Engineer'} size="lg" status={isPending ? 'away' : 'online'} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!</h1>
              <p className="text-white/80 text-sm mt-1">
                {isPending ? 'Your account is being reviewed' : "Here's your overview for today"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPending ? (
              <Badge variant="warning" size="lg" dot>
                <Clock className="w-3.5 h-3.5 mr-1" />
                Pending Approval
              </Badge>
            ) : (
              <>
                <Badge variant="success" size="lg" dot>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Subscription Active
                </Badge>
                <Badge variant="gold" size="lg">
                  <Star className="w-3.5 h-3.5 mr-1" />
                  4.9 Rating
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Stats - Mix of WOW and regular KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
          title="Tasks Today" 
          value={tasksToday}
          variant="brand"
          icon={<Clock className="w-5 h-5" />}
          change={{ value: 15, type: 'increase' }}
        />
        <WowKPICard 
          title="This Month" 
          value={`₪${totalEarnings}`}
          subtitle="Earnings"
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
          change={22}
          accentColor="#22c55e"
        />
        <WowKPICard 
          title="Completed Jobs" 
          value={completedJobs}
          subtitle="All time"
          icon={<CheckCircle className="w-5 h-5" />}
          trend="up"
          change={8}
          accentColor="#D4AF37"
        />
        <KPICard 
          title="Total Jobs" 
          value={engineerJobs.length}
          variant="default"
          icon={<Briefcase className="w-5 h-5" />}
        />
      </div>

      {/* Quick Actions - WOW 3D Tilt Cards */}
      <div>
        <h3 className="text-h4 font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <WowActionCard 
            title="Quick Requests"
            description={isPending ? 'Available after approval' : '3 available in your area'}
            icon={<Zap className="w-7 h-7" />}
            onClick={() => !isPending && navigate('/engineer/requests')}
            accentColor="#136F94"
            disabled={isPending}
          />

          <WowActionCard 
            title="My Jobs"
            description={isPending ? 'Available after approval' : `${tasksToday} current assignments`}
            icon={<Briefcase className="w-7 h-7" />}
            onClick={() => !isPending && navigate('/engineer/jobs')}
            accentColor="#136F94"
            disabled={isPending}
          />

          <WowActionCard 
            title="Profile"
            description="Portfolio & bio"
            icon={<User className="w-7 h-7" />}
            onClick={() => navigate('/engineer/profile')}
            accentColor="#D4AF37"
          />
        </div>
      </div>

      {/* Menu */}
      <div>
        <h3 className="text-h4 font-semibold text-text-primary mb-4">Your Account</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card variant="interactive" onClick={() => navigate('/engineer/finance')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Finance</CardTitle>
                <CardDescription className="text-body-sm">View earnings</CardDescription>
              </div>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/engineer/subscription')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold/10">
                <CreditCard className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Subscription</CardTitle>
                <CardDescription className="text-body-sm">Renews Dec 2025</CardDescription>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/engineer/notifications')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Notifications</CardTitle>
                <CardDescription className="text-body-sm">5 unread</CardDescription>
              </div>
              <Badge variant="warning" size="sm">5</Badge>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/engineer/block-list')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neutral-100">
                <Ban className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Block List</CardTitle>
                <CardDescription className="text-body-sm">Manage blocked</CardDescription>
              </div>
            </div>
          </Card>

          <Card variant="interactive" className="border-error/20 hover:border-error/40" onClick={handleLogout}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-error/10">
                <LogOut className="w-5 h-5 text-error" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium text-error">Log Out</CardTitle>
                <CardDescription className="text-body-sm">Sign out safely</CardDescription>
              </div>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
