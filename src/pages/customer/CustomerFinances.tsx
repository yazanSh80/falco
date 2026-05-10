import { Card, CardTitle } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import { DollarSign, TrendingUp, Receipt, CreditCard } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';

export default function CustomerFinances() {
  const { transactions, currentUser } = useData();
  const customerTransactions = transactions.filter(t => t.customerId === currentUser?.id);

  const total = customerTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgPerJob = customerTransactions.length > 0 ? Math.round(total / customerTransactions.length) : 0;

  return (
    <AppShell title="My Finances" subtitle="Track your spending and transaction history">
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Spent"
            value={`₪${total}`}
            subtitle="All time"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Total Jobs"
            value={customerTransactions.length}
            subtitle="Completed"
            icon={<Receipt className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Average/Job"
            value={`₪${avgPerJob}`}
            subtitle="Per service"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={avgPerJob > 100 ? 'up' : 'neutral'}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Payment"
            value="Active"
            subtitle="Status"
            icon={<CreditCard className="w-5 h-5" />}
            accentColor="#136F94"
          />
        </div>

        {/* Transaction History */}
        <Card className="p-6">
          <CardTitle className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-brand" />
            Transaction History
          </CardTitle>
          <div className="space-y-3">
            {customerTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-text-secondary">No transactions yet.</p>
                <p className="text-sm text-text-muted mt-1">Your completed service payments will appear here.</p>
              </div>
            ) : (
              customerTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{t.service}</p>
                      <p className="text-sm text-text-secondary">Engineer: {t.engineerName}</p>
                      <p className="text-xs text-text-muted">{t.date}</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-brand">₪{t.amount}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
