import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardTitle } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import * as Icons from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowActionCard } from '../../components/ui';

export default function CustomerLateFeatures() {
  const navigate = useNavigate();
  const { features, loading } = useData();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Box;
    return <Icon className="w-7 h-7" />;
  };

  return (
    <AppShell title="Book Service" subtitle="Browse core catalog groups and choose a priced service">
      <div className="space-y-6">
        {loading.catalog ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="p-5">
                <div className="skeleton h-10 w-10 rounded-xl mb-4" />
                <div className="skeleton h-5 w-2/3 mb-2" />
                <div className="skeleton h-4 w-full" />
              </Card>
            ))}
          </div>
        ) : features.length === 0 ? (
          <Card className="p-8 text-center">
            <CardTitle>No catalog groups available</CardTitle>
            <CardDescription>Visible backend services will appear here once operations publishes them.</CardDescription>
          </Card>
        ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <WowActionCard
              key={feature.id}
              title={feature.name}
              description="View catalog services"
              icon={getIcon(feature.icon)}
              onClick={() => navigate(`/customer/late/${feature.id}`)}
              accentColor={index % 2 === 0 ? '#2563EB' : '#7C3AED'}
              className={index === 0 ? 'electric-accent-border rounded-2xl' : ''}
            />
          ))}
        </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <CardTitle className="text-sm">Backend catalog</CardTitle>
            <CardDescription className="text-xs">Services are loaded from the active service catalog.</CardDescription>
          </Card>
          <Card className="p-4">
            <CardTitle className="text-sm">Controlled visibility</CardTitle>
            <CardDescription className="text-xs">Only public core services are shown for booking.</CardDescription>
          </Card>
          <Card className="p-4">
            <CardTitle className="text-sm">Clear pricing</CardTitle>
            <CardDescription className="text-xs">Each service shows its pricing mode before submit.</CardDescription>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
