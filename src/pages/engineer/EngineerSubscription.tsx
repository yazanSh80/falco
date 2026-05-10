import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { Card, CardTitle } from '../../components/ui/card';
import { DollarSign, Briefcase, Percent, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';

export default function EngineerSubscription() {
  // Mock data
  const jobsThisMonth = 12;
  const grossAmount = 1800;
  const commission = 90;
  const netAmount = 1710;

  return (
    <AppShell title="Subscription & Earnings" subtitle="Manage your subscription and track earnings">
      <div className="space-y-6 max-w-2xl">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Jobs"
            value={jobsThisMonth}
            subtitle="This month"
            icon={<Briefcase className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Gross"
            value={`${grossAmount} NIS`}
            subtitle="Total earned"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Commission"
            value={`${commission} NIS`}
            subtitle="5% deducted"
            icon={<Percent className="w-5 h-5" />}
            accentColor="#ef4444"
          />
          <WowKPICard
            title="Net"
            value={`${netAmount} NIS`}
            subtitle="Take home"
            icon={<TrendingUp className="w-5 h-5" />}
            trend="up"
            change={15}
            accentColor="#22c55e"
          />
        </div>

        {/* Subscription Card */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand" />
            Subscription Status
          </CardTitle>
          <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">Active</span>
            </div>
            <p className="text-sm text-slate-300 mt-2">100 NIS / month</p>
            <p className="text-xs text-slate-400 mt-1">Next billing: December 1, 2025</p>
          </div>
        </Card>

        {/* Commission Rule Card */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-warning" />
            Commission Rule
          </CardTitle>
          <p className="text-sm text-slate-300 mt-3">
            5% commission applies on projects above 700 NIS.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
