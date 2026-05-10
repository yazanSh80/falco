import { Card, CardTitle } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { DollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';

export default function AdminFinances() {
  const { transactions, customers, engineers } = useData();

  const customerTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
  const engineerTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
  const commissionTotal = transactions.reduce((sum, t) => t.amount > 700 ? sum + t.amount * 0.05 : sum, 0);

  return (
    <AppShell title="Financial Overview" subtitle="Track platform revenue, commissions, and user transactions">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Transactions"
            value={transactions.length}
            subtitle="All time"
            icon={<CreditCard className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Customer Payments"
            value={`${customerTotal} NIS`}
            subtitle="Total collected"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Platform Commission"
            value={`${commissionTotal.toFixed(2)} NIS`}
            subtitle="5% on jobs >700 NIS"
            icon={<TrendingUp className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Active Customers"
            value={customers.length}
            subtitle="With transactions"
            icon={<Users className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
        </div>

      <Card>
        <CardTitle>Customer Spending</CardTitle>
        <div className="mt-3 space-y-2">
          {customers.map(customer => {
            const customerTransactions = transactions.filter(t => t.customerId === customer.id);
            const total = customerTransactions.reduce((sum, t) => sum + t.amount, 0);
            return (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/50">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-slate-400">{customerTransactions.length} jobs</p>
                </div>
                <p className="text-brand-light font-semibold">{total} NIS</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Engineer Earnings</CardTitle>
        <div className="mt-3 space-y-2">
          {engineers.filter(e => e.status === 'accepted').map(engineer => {
            const engineerTransactions = transactions.filter(t => t.engineerId === engineer.id);
            const gross = engineerTransactions.reduce((sum, t) => sum + t.amount, 0);
            const commission = engineerTransactions.reduce((sum, t) => t.amount > 700 ? sum + t.amount * 0.05 : sum, 0);
            const net = gross - commission;
            return (
              <div key={engineer.id} className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/50">
                <div>
                  <p className="font-medium">{engineer.name}</p>
                  <p className="text-xs text-slate-400">{engineerTransactions.length} jobs</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-light font-semibold">{gross} NIS gross</p>
                  <p className="text-xs text-slate-500">Net: {net.toFixed(2)} NIS</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      </div>
    </AppShell>
  );
}