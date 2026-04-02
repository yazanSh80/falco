import { Card, CardTitle } from '../../components/ui/card';
import { DollarSign, Zap, Tv, Wifi, List } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard, WowActionCard } from '../../components/ui';

const prices = [
  { category: 'Electricity', service: 'Lighting Repair', price: 120, icon: Zap },
  { category: 'Electricity', service: 'Main Panel Check', price: 250, icon: Zap },
  { category: 'Electronics', service: 'TV Diagnosis', price: 90, icon: Tv },
  { category: 'Communications', service: 'Network Cable Setup', price: 300, icon: Wifi },
];

export default function CustomerPriceList() {
  const avgPrice = Math.round(prices.reduce((sum, p) => sum + p.price, 0) / prices.length);

  return (
    <AppShell title="Price List" subtitle="Standardized prices defined with the Engineers Syndicate">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Services"
            value={prices.length}
            subtitle="Available"
            icon={<List className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Avg Price"
            value={`₪${avgPrice}`}
            subtitle="Per service"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
        </div>

        {/* Price Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {prices.map(p => {
            const IconComponent = p.icon;
            return (
              <Card key={p.service} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.service}</CardTitle>
                      <p className="text-sm text-text-muted mt-1">Category: {p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand">₪{p.price}</p>
                    <p className="text-xs text-text-muted">Fixed rate</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Note */}
        <Card className="p-4 bg-brand/5 border-brand/20">
          <p className="text-sm text-text-secondary">
            <strong>Note:</strong> These prices are regulated standards. Actual costs may vary based on complexity, parts needed, and location.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
