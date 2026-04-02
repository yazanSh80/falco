/**
 * UI Showcase Page
 * 
 * Purpose: Display all WOW components in one place for demonstration.
 * This page serves as a living style guide for the premium UI components.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Star, Shield, DollarSign, Users, TrendingUp, 
  CheckCircle, Clock, Briefcase, Bell, Settings, Heart, Award,
  Sparkles, Palette, Eye, EyeOff
} from 'lucide-react';
import Button from '../components/ui/button';
import { Card, CardTitle, CardDescription } from '../components/ui/card';
import AppShell from '../layouts/AppShell';
import { WowKPICard, WowActionCard, EffectsToggle, ElectricCard, ElectricCardCompact } from '../components/ui';
import { useEffectsPreference } from '../utils/effects';

export default function UIShowcase() {
  const { canUseHeavyEffects, prefersReducedMotion, isMobile } = useEffectsPreference();

  const kpiExamples = [
    { title: 'Total Revenue', value: '₪125,430', subtitle: 'This month', icon: <DollarSign className="w-5 h-5" />, trend: 'up' as const, change: 12, accentColor: '#22c55e' },
    { title: 'Active Users', value: '1,234', subtitle: 'Currently online', icon: <Users className="w-5 h-5" />, trend: 'up' as const, change: 8, accentColor: '#136F94' },
    { title: 'Completed Jobs', value: '892', subtitle: 'All time', icon: <CheckCircle className="w-5 h-5" />, trend: 'up' as const, change: 15, accentColor: '#D4AF37' },
    { title: 'Avg Rating', value: '4.9', subtitle: 'Customer satisfaction', icon: <Star className="w-5 h-5" />, accentColor: '#f59e0b' },
    { title: 'Response Time', value: '2.3h', subtitle: 'Average', icon: <Clock className="w-5 h-5" />, trend: 'down' as const, change: 18, accentColor: '#22c55e' },
    { title: 'Pending Reviews', value: '23', subtitle: 'Need attention', icon: <Bell className="w-5 h-5" />, accentColor: '#ef4444' },
  ];

  const actionExamples = [
    { title: 'Quick Request', description: 'Get instant help from nearby engineers', icon: <Zap className="w-7 h-7" />, accentColor: '#136F94' },
    { title: 'Browse Services', description: 'Explore available service categories', icon: <Briefcase className="w-7 h-7" />, accentColor: '#D4AF37' },
    { title: 'View Profile', description: 'Manage your account settings', icon: <Settings className="w-7 h-7" />, accentColor: '#22c55e' },
    { title: 'Favorites', description: 'Your saved engineers', icon: <Heart className="w-7 h-7" />, accentColor: '#ef4444' },
    { title: 'Achievements', description: 'View your badges and progress', icon: <Award className="w-7 h-7" />, accentColor: '#f59e0b' },
    { title: 'Analytics', description: 'Track your performance metrics', icon: <TrendingUp className="w-7 h-7" />, accentColor: '#8b5cf6' },
  ];

  return (
    <AppShell title="UI Component Showcase" subtitle="Premium WOW components with electric effects">
      <div className="space-y-12">
        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-gold" />
            <div>
              <h3 className="font-semibold text-text-primary">Effects Status</h3>
              <p className="text-sm text-text-muted">
                {canUseHeavyEffects ? 'Full effects enabled' : 'Reduced effects mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs ${canUseHeavyEffects ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                {canUseHeavyEffects ? '✓ Effects On' : '⚠ Limited'}
              </span>
              {prefersReducedMotion && (
                <span className="px-3 py-1 rounded-full text-xs bg-info/20 text-info">
                  Reduced Motion
                </span>
              )}
              {isMobile && (
                <span className="px-3 py-1 rounded-full text-xs bg-brand/20 text-brand">
                  Mobile
                </span>
              )}
            </div>
            <EffectsToggle />
          </div>
        </div>

        {/* WowKPICard Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Zap className="w-6 h-6 text-brand" />
              WowKPICard
            </h2>
            <p className="text-text-muted mt-1">
              Electric border KPI cards with animated SVG turbulence effect. Perfect for dashboard highlights.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpiExamples.map((kpi, index) => (
              <WowKPICard key={index} {...kpi} />
            ))}
          </div>

          <Card className="mt-4 p-4 bg-slate-50">
            <CardTitle className="text-sm">Usage</CardTitle>
            <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`<WowKPICard
  title="Total Revenue"
  value="₪125,430"
  subtitle="This month"
  icon={<DollarSign className="w-5 h-5" />}
  trend="up"
  change={12}
  accentColor="#22c55e"
/>`}
            </pre>
          </Card>
        </section>

        {/* ElectricCard Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              ElectricCard
            </h2>
            <p className="text-text-muted mt-1">
              Premium animated electric border cards with turbulence effects. Available in multiple color variants.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <ElectricCard
              variant="blue"
              badge="Premium"
              title="Electric Blue"
              subtitle="Animated border with BZU brand colors"
              size="sm"
            >
              <div className="text-white/70 text-sm">
                <p>Perfect for highlighting important content with premium feel.</p>
              </div>
            </ElectricCard>

            <ElectricCard
              variant="gold"
              badge="VIP"
              title="Gold Edition"
              subtitle="Luxurious gold glow effect"
              size="sm"
            >
              <div className="text-white/70 text-sm">
                <p>Ideal for premium subscriptions and achievements.</p>
              </div>
            </ElectricCard>

            <ElectricCard
              variant="success"
              badge="Success"
              title="Success Green"
              subtitle="Positive confirmation style"
              size="sm"
            >
              <div className="text-white/70 text-sm">
                <p>Great for completed tasks and success messages.</p>
              </div>
            </ElectricCard>

            <ElectricCard
              variant="purple"
              badge="New"
              title="Purple Magic"
              subtitle="Modern purple gradient"
              size="sm"
            >
              <div className="text-white/70 text-sm">
                <p>Perfect for highlighting new features.</p>
              </div>
            </ElectricCard>
          </div>

          {/* Compact Electric Cards */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Compact Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ElectricCardCompact variant="blue">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-brand-light" />
                  <div>
                    <p className="text-white font-medium">₪125,430</p>
                    <p className="text-white/50 text-xs">Revenue</p>
                  </div>
                </div>
              </ElectricCardCompact>

              <ElectricCardCompact variant="gold">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gold-light" />
                  <div>
                    <p className="text-white font-medium">4.9 Rating</p>
                    <p className="text-white/50 text-xs">Average</p>
                  </div>
                </div>
              </ElectricCardCompact>

              <ElectricCardCompact variant="success">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">892 Jobs</p>
                    <p className="text-white/50 text-xs">Completed</p>
                  </div>
                </div>
              </ElectricCardCompact>

              <ElectricCardCompact variant="purple">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">1,234</p>
                    <p className="text-white/50 text-xs">Active Users</p>
                  </div>
                </div>
              </ElectricCardCompact>
            </div>
          </div>

          <Card className="mt-4 p-4 bg-slate-50 dark:bg-slate-800">
            <CardTitle className="text-sm">Usage</CardTitle>
            <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`<ElectricCard
  variant="blue"  // blue | gold | success | purple
  badge="Premium"
  title="Electric Blue"
  subtitle="Animated border effect"
  size="md"  // sm | md | lg
>
  <p>Your content here</p>
</ElectricCard>

// Compact version
<ElectricCardCompact variant="gold">
  <p>Compact content</p>
</ElectricCardCompact>`}
            </pre>
          </Card>
        </section>

        {/* WowActionCard Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Palette className="w-6 h-6 text-gold" />
              WowActionCard
            </h2>
            <p className="text-text-muted mt-1">
              3D perspective tilt cards with spotlight glow that follows cursor movement. Ideal for CTAs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {actionExamples.map((action, index) => (
              <WowActionCard 
                key={index} 
                {...action} 
                onClick={() => alert(`Clicked: ${action.title}`)}
              />
            ))}
          </div>

          <Card className="mt-4 p-4 bg-slate-50">
            <CardTitle className="text-sm">Usage</CardTitle>
            <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`<WowActionCard
  title="Quick Request"
  description="Get instant help"
  icon={<Zap className="w-7 h-7" />}
  onClick={() => navigate('/request')}
  accentColor="#136F94"
/>`}
            </pre>
          </Card>
        </section>

        {/* Effects Toggle Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Eye className="w-6 h-6 text-success" />
              EffectsToggle
            </h2>
            <p className="text-text-muted mt-1">
              Global toggle to enable/disable visual effects. Respects user preferences and device capabilities.
            </p>
          </div>
          
          <div className="flex items-center gap-6 p-6 bg-slate-100 rounded-xl">
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Toggle Component</p>
              <EffectsToggle />
            </div>
            <div className="text-sm text-text-muted">
              <p>• Persists preference in localStorage</p>
              <p>• Auto-disables on mobile devices</p>
              <p>• Respects prefers-reduced-motion</p>
            </div>
          </div>

          <Card className="mt-4 p-4 bg-slate-50">
            <CardTitle className="text-sm">Usage</CardTitle>
            <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`import { EffectsToggle } from '../components/ui';
import { useEffectsPreference } from '../utils/effects';

// Toggle component
<EffectsToggle />

// Hook for conditional rendering
const { canUseHeavyEffects, prefersReducedMotion, isMobile } = useEffectsPreference();
if (canUseHeavyEffects) {
  // Render heavy effects
}`}
            </pre>
          </Card>
        </section>

        {/* Brand Colors Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-brand" />
              Brand Colors
            </h2>
            <p className="text-text-muted dark:text-[#7a7d82] mt-1">
              Official color palette for consistent premium design.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'BZU Blue', value: '#136F94', textClass: 'text-white' },
              { name: 'Falco Gold', value: '#D4AF37', textClass: 'text-slate-900' },
              { name: 'Success', value: '#22c55e', textClass: 'text-white' },
              { name: 'Warning', value: '#f59e0b', textClass: 'text-white' },
              { name: 'Error', value: '#ef4444', textClass: 'text-white' },
              { name: 'Info', value: '#3b82f6', textClass: 'text-white' },
            ].map((color, index) => (
              <div 
                key={index}
                className="rounded-xl p-4 text-center shadow-md transition-transform duration-200 hover:scale-105"
                style={{ backgroundColor: color.value }}
              >
                <p className={`font-semibold ${color.textClass}`}>{color.name}</p>
                <p className={`text-xs mt-1 opacity-80 ${color.textClass}`}>{color.value}</p>
              </div>
            ))}
          </div>
          
          {/* Dark mode specific colors */}
          <div className="mt-6 p-4 bg-slate-100 dark:bg-[#1b1c20] rounded-xl">
            <h3 className="font-semibold text-text-primary dark:text-white mb-3">Dark Mode Colors</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { name: 'Primary', value: '#000000' },
                { name: 'Secondary', value: '#1b1c20' },
                { name: 'Tertiary', value: '#252628' },
                { name: 'Border', value: '#35383d' },
                { name: 'Text', value: '#c0c4cd' },
                { name: 'Muted', value: '#7a7d82' },
              ].map((color, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-[#454850] mb-2"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-xs font-medium text-text-primary dark:text-white">{color.name}</p>
                  <p className="text-[10px] text-text-muted dark:text-[#65666b]">{color.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Components Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-gold" />
              Premium Components
            </h2>
            <p className="text-text-muted dark:text-[#7a7d82] mt-1">
              New premium stat cards and gradient effects inspired by modern dashboard designs.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Gradient Card Demo */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card-base dark:bg-[#1b1c20] dark:border-[#35383d]">
                <h4 className="text-text-primary dark:text-white font-medium mb-2">Default Card</h4>
                <p className="text-text-muted dark:text-[#7a7d82] text-sm">Basic card with dark mode support</p>
              </div>
              
              <div className="gradient-border p-4 bg-white dark:bg-[#1b1c20]">
                <h4 className="text-text-primary dark:text-white font-medium mb-2">Gradient Border</h4>
                <p className="text-text-muted dark:text-[#7a7d82] text-sm">Card with premium gradient border</p>
              </div>
              
              <div className="notification-gradient">
                <div className="p-4 bg-white dark:bg-black">
                  <h4 className="text-text-primary dark:text-white font-medium mb-2">Notification Style</h4>
                  <p className="text-text-muted dark:text-[#7a7d82] text-sm">Premium notification border</p>
                </div>
              </div>
            </div>
            
            {/* Icon backgrounds demo */}
            <div className="card-base dark:bg-[#1b1c20] dark:border-[#35383d] p-4">
              <h4 className="text-text-primary dark:text-white font-medium mb-4">Icon Backgrounds</h4>
              <div className="flex flex-wrap gap-4">
                <div className="icon-bg-purple size-12 rounded-xl grid place-items-center"><Eye className="w-5 h-5" /></div>
                <div className="icon-bg-orange size-12 rounded-xl grid place-items-center"><Star className="w-5 h-5" /></div>
                <div className="icon-bg-neutral size-12 rounded-xl grid place-items-center"><Zap className="w-5 h-5" /></div>
                <div className="icon-bg-brand size-12 rounded-xl grid place-items-center"><Users className="w-5 h-5" /></div>
                <div className="icon-bg-gold size-12 rounded-xl grid place-items-center"><Award className="w-5 h-5" /></div>
                <div className="icon-bg-success size-12 rounded-xl grid place-items-center"><CheckCircle className="w-5 h-5" /></div>
              </div>
            </div>
            
            {/* Percentage badges */}
            <div className="card-base dark:bg-[#1b1c20] dark:border-[#35383d] p-4">
              <h4 className="text-text-primary dark:text-white font-medium mb-4">Percentage Badges</h4>
              <div className="flex flex-wrap gap-3">
                <span className="pct-badge-purple px-3 py-1 rounded-lg text-sm font-medium">+12.5%</span>
                <span className="pct-badge-orange px-3 py-1 rounded-lg text-sm font-medium">-8.3%</span>
                <span className="pct-badge-neutral px-3 py-1 rounded-lg text-sm font-medium">0.0%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Shell Components Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-warning" />
              Shell Components
            </h2>
            <p className="text-text-muted dark:text-[#7a7d82] mt-1">
              Page wrapper components that provide consistent layout and effects.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 dark:bg-[#1b1c20] dark:border-[#35383d]">
              <CardTitle className="dark:text-white">AppShell</CardTitle>
              <CardDescription className="mt-2 dark:text-[#7a7d82]">
                Light professional shell for dashboard and app pages. Provides consistent header with title/subtitle.
              </CardDescription>
              <div className="mt-4 p-3 bg-slate-100 dark:bg-[#252628] rounded text-xs text-text-muted dark:text-[#7a7d82]">
                Used in: Customer Dashboard, Engineer Dashboard, Admin pages
              </div>
            </Card>
            
            <Card className="p-6 bg-slate-900 dark:bg-black">
              <CardTitle className="text-white">AuthShell</CardTitle>
              <CardDescription className="mt-2 text-white/60">
                Dark cinematic shell for authentication pages. Features animated blob/ring effects.
              </CardDescription>
              <div className="mt-4 p-3 bg-slate-800 dark:bg-[#1b1c20] rounded text-xs text-white/50">
                Used in: Login, Signup, Access Denied
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-200 dark:border-[#35383d]">
          <p className="text-text-muted dark:text-[#7a7d82] text-sm">
            FalcoElectrec UI Showcase — All components designed for premium user experience
          </p>
          <div className="mt-4">
            <Link to="/demo" className="text-brand dark:text-brand-light hover:underline text-sm mr-4">
              View Effects Demo
            </Link>
            <Link to="/credits" className="text-brand dark:text-brand-light hover:underline text-sm">
              View Credits
            </Link>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
