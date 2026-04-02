import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import * as Icons from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowActionCard } from '../../components/ui';

export default function CustomerLateFeatures() {
  const navigate = useNavigate();
  const { features } = useData();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Box;
    return <Icon className="w-7 h-7" />;
  };

  return (
    <AppShell title="Browse Services" subtitle="Select a category and choose an engineer based on their work portfolio">
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <WowActionCard
              key={feature.id}
              title={feature.name}
              description="View available services"
              icon={getIcon(feature.icon)}
              onClick={() => navigate(`/customer/late/${feature.id}`)}
              accentColor={index % 2 === 0 ? '#136F94' : '#D4AF37'}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
