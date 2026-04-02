import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { Star, ArrowLeft, DollarSign, User } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';

export default function CustomerLateWorks() {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();
  const { features, services, engineers } = useData();

  const feature = features.find(f => f.id === featureId);
  const featureServices = services.filter(s => s.featureId === featureId);

  if (!feature) {
    return (
      <AppShell title="Not Found" subtitle="The requested feature could not be found">
        <Card className="p-8 text-center">
          <p className="text-text-secondary">Feature not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/customer/late')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Features
          </Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={feature.name} subtitle="Available services and engineers">
      <div className="space-y-6">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <WowKPICard
              title="Services"
              value={featureServices.length}
              subtitle="Available"
              icon={<User className="w-5 h-5" />}
              accentColor="#136F94"
            />
          </div>
          <Button variant="outline" onClick={() => navigate('/customer/late')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Features
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {featureServices.map(service => {
            const engineer = engineers.find(e => e.id === service.engineerId);
            return (
              <Card
                key={service.id}
                className="p-5 cursor-pointer hover:shadow-lg hover:border-brand/30 transition-all"
                onClick={() => navigate(`/customer/late/service/${service.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="mt-1">{service.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brand">₪{service.price}</p>
                    <p className="text-xs text-text-muted">Fixed rate</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-medium">
                      {service.engineerName.charAt(0)}
                    </div>
                    <span className="text-sm text-text-secondary">{service.engineerName}</span>
                  </div>
                  {engineer && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span className="font-medium">{engineer.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
