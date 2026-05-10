import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { ArrowLeft, CheckCircle, Star, User } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { getPricingDisplay } from '../../utils/pricingDisplay';

export default function CustomerLateWorks() {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();
  const { features, services, engineers, loading } = useData();

  const feature = features.find(f => f.id === featureId);
  const featureServices = services.filter(s => s.featureId === featureId);

  if (loading.catalog) {
    return (
      <AppShell title="Loading" subtitle="Loading service catalog">
        <Card className="p-8 text-center">
          <p className="text-text-secondary">Loading service catalog...</p>
        </Card>
      </AppShell>
    );
  }

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
    <AppShell title={feature.name} subtitle="Available catalog services">
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
        {featureServices.length === 0 ? (
          <Card className="p-8 text-center">
            <CardTitle>No bookable services here yet</CardTitle>
            <CardDescription>Operations may keep services hidden until pricing and provider coverage are ready.</CardDescription>
          </Card>
        ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {featureServices.map((service, index) => {
            const engineer = engineers.find(e => e.id === service.engineerId);
            const pricing = getPricingDisplay(service.pricingMode, service.price);
            return (
              <Card
                key={service.id}
                className={`p-5 cursor-pointer hover:shadow-lg hover:border-brand/30 transition-all ${index === 0 ? 'electric-accent-border' : ''}`}
                onClick={() => navigate(`/customer/late/service/${service.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="mt-1">{service.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brand">{pricing.value}</p>
                    <p className="text-xs text-text-muted">{pricing.label}</p>
                    <span className="mt-2 inline-flex rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                      {pricing.modeLabel}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-medium">
                      {service.engineerName.charAt(0)}
                    </div>
                    <span className="text-sm text-text-secondary">{service.engineerName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle className="w-4 h-4" />
                      Bookable
                    </span>
                    {engineer && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-medium">{engineer.rating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </AppShell>
  );
}
