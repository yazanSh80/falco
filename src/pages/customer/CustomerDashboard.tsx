import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { KPICard } from '../../components/ui/kpi-card';
import { WowKPICard, WowActionCard } from '../../components/ui';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import Button from '../../components/ui/button';
import AppShell from '../../layouts/AppShell';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Clock, DollarSign, Bell, Ban, Users, LogOut, List, MapPin, Star, ArrowRight } from 'lucide-react';
import { useData } from '../../state/DataContext';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { setCurrentUser } = useData();
  const name = 'Ahmad';
  const area = 'Hebron – City Center';

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  // Mock stats
  const stats = {
    totalRequests: 12,
    activeRequests: 2,
    completedRequests: 10,
    savedAmount: 450,
  };

  return (
    <AppShell title={`Welcome back, ${name}!`} subtitle="Choose how you want to request service today">
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section with User Info */}
      <div className="bg-gradient-hero rounded-2xl p-6 md:p-8 text-white shadow-brand relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-light/20 rounded-full blur-2xl" />
        
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={name} size="lg" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {name}!</h1>
                <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{area}</span>
                </div>
              </div>
            </div>
            <p className="text-white/90 text-sm md:text-base max-w-md">
              Choose how you want to request service today. Our verified engineers are ready to help.
            </p>
          </div>
          <Badge variant="gold" size="lg" className="hidden md:flex">
            <Star className="w-4 h-4 mr-1" />
            Premium
          </Badge>
        </div>
      </div>

      {/* Stats Overview - Mix of WOW and regular KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WowKPICard 
          title="Total Requests" 
          value={stats.totalRequests}
          subtitle="All time"
          icon={<List className="w-5 h-5" />}
          trend="up"
          change={8}
          accentColor="#136F94"
        />
        <KPICard 
          title="Active Now" 
          value={stats.activeRequests}
          variant="warning"
          icon={<Clock className="w-5 h-5" />}
        />
        <KPICard 
          title="Completed" 
          value={stats.completedRequests}
          variant="success"
          icon={<Zap className="w-5 h-5" />}
        />
        <WowKPICard 
          title="Saved" 
          value={`₪${stats.savedAmount}`}
          subtitle="Total savings"
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
          change={15}
          accentColor="#D4AF37"
        />
      </div>

      {/* Quick Actions - WOW 3D Tilt Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h4 font-semibold text-text-primary">Quick Actions</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <WowActionCard 
            title="Be Quickly"
            description="Urgent service request"
            icon={<Zap className="w-7 h-7" />}
            onClick={() => navigate('/customer/be-quickly')}
            accentColor="#136F94"
          />

          <WowActionCard 
            title="Browse Services"
            description="Book by category"
            icon={<Clock className="w-7 h-7" />}
            onClick={() => navigate('/customer/late')}
            accentColor="#136F94"
          />

          <WowActionCard 
            title="Price List"
            description="View standard pricing"
            icon={<List className="w-7 h-7" />}
            onClick={() => navigate('/customer/price-list')}
            accentColor="#D4AF37"
          />
        </div>
      </div>

      {/* Menu Options */}
      <div>
        <h3 className="text-h4 font-semibold text-text-primary mb-4">Your Account</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card variant="interactive" onClick={() => navigate('/customer/requests')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand/10">
                <List className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">My Requests</CardTitle>
                <CardDescription className="text-body-sm">{stats.totalRequests} total</CardDescription>
              </div>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/customer/finances')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Finances</CardTitle>
                <CardDescription className="text-body-sm">View transactions</CardDescription>
              </div>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/customer/notifications')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Notifications</CardTitle>
                <CardDescription className="text-body-sm">3 unread</CardDescription>
              </div>
              <Badge variant="warning" size="sm">3</Badge>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/customer/block-list')}>
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

          <Card variant="interactive" onClick={() => navigate('/customer/most-worked')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold/10">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-body font-medium">Most Worked</CardTitle>
                <CardDescription className="text-body-sm">Your favorites</CardDescription>
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
