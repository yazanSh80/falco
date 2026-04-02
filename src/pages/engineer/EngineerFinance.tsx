import { Card, CardTitle } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { DollarSign, Briefcase, TrendingDown, TrendingUp, CreditCard, Percent } from 'lucide-react';

export default function EngineerFinance() {
  const { transactions, currentUser } = useData();
  const engineerTransactions = transactions.filter(t => t.engineerId === currentUser?.id);

  const totalJobs = engineerTransactions.length;
  const grossAmount = engineerTransactions.reduce((sum, t) => sum + t.amount, 0);
  const commission = engineerTransactions.reduce((sum, t) => t.amount > 700 ? sum + t.amount * 0.05 : sum, 0);
  const netAmount = grossAmount - commission;
  const monthlySubscription = 100;

  return (
    <AppShell title="Finance & Earnings" subtitle="Track your income and manage subscriptions">
      <div className="space-y-6 max-w-3xl">
        {/* WOW KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Jobs"
            value={totalJobs}
            subtitle="This month"
            icon={<Briefcase className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Gross Amount"
            value={`${grossAmount} NIS`}
            subtitle="Before commission"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Commission"
            value={`${commission.toFixed(0)} NIS`}
            subtitle="5% on 700+ jobs"
            icon={<Percent className="w-5 h-5" />}
            accentColor="#ef4444"
          />
          <WowKPICard
            title="Net Earnings"
            value={`${netAmount.toFixed(0)} NIS`}
            subtitle="Your take-home"
            icon={<TrendingUp className="w-5 h-5" />}
            trend="up"
            change={12}
            accentColor="#22c55e"
          />
        </div>

        <Card>
        <CardTitle>Subscription</CardTitle>
        <div className="mt-3 p-3 rounded bg-slate-800/50">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-brand-light">Active</span> - {monthlySubscription} NIS / month
          </p>
          <p className="text-xs text-slate-400 mt-1">Next billing: 2025-12-01</p>
        </div>
      </Card>

      <Card>
        <CardTitle>Commission Rule</CardTitle>
        <p className="text-sm text-slate-300 mt-2">
          5% commission applies on projects above 700 NIS.
        </p>
      </Card>

      <Card>
        <CardTitle>Transaction History</CardTitle>
        <div className="mt-3 space-y-2">
          {engineerTransactions.length === 0 && (
            <p className="text-sm text-slate-400">No transactions yet.</p>
          )}
          {engineerTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/50">
              <div>
                <p className="font-medium">{t.service}</p>
                <p className="text-xs text-slate-400">Customer: {t.customerName}</p>
                <p className="text-xs text-slate-500">{t.date}</p>
              </div>
              <div className="text-right">
                <p className="text-brand-light font-semibold">{t.amount} NIS</p>
                {t.amount > 700 && (
                  <p className="text-xs text-red-400">-{(t.amount * 0.05).toFixed(2)} commission</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>
    </AppShell>
  );
}
