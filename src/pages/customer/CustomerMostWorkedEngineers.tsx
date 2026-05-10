import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Award, Heart, ExternalLink } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import Button from '../../components/ui/button';

export default function CustomerMostWorkedEngineers() {
  const { customerRequests, currentUser, engineers } = useData();
  const navigate = useNavigate();

  // Calculate engineer frequency from REAL completed jobs data
  const engineerCounts: Record<string, { name: string; count: number; engineerId: string }> = {};
  customerRequests
    .filter(r => r.customerId === currentUser?.id && r.engineerId && r.status === 'Completed')
    .forEach(r => {
      if (r.engineerId && r.engineerName) {
        if (!engineerCounts[r.engineerId]) {
          engineerCounts[r.engineerId] = { name: r.engineerName, count: 0, engineerId: r.engineerId };
        }
        engineerCounts[r.engineerId].count++;
      }
    });

  const sorted = Object.values(engineerCounts).sort((a, b) => b.count - a.count);
  const totalJobs = sorted.reduce((sum, item) => sum + item.count, 0);

  return (
    <AppShell title="Your Favorite Engineers" subtitle="Engineers you've completed the most jobs with">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Total Jobs"
            value={totalJobs}
            subtitle="Completed"
            icon={<Award className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Engineers"
            value={sorted.length}
            subtitle="Worked with"
            icon={<Users className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
        </div>

        {/* Engineer Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-text-secondary">No completed jobs yet.</p>
              <p className="text-sm text-text-muted mt-1">Complete services to see your favorite engineers here.</p>
            </Card>
          ) : (
            sorted.map((item, index) => {
              const engineer = engineers.find(e => e.id === item.engineerId);
              return (
                <Card key={item.engineerId} className="p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-gold text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                      ⭐ Top Pick
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-xl font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>
                        {engineer?.specialization || 'Engineer'} • {engineer?.area || 'N/A'}
                      </CardDescription>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-text-muted">Jobs: </span>
                          <span className="font-semibold text-brand">{item.count}</span>
                        </div>
                        {engineer && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-gold text-gold" />
                            <span className="font-medium">{engineer.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => navigate(`/engineer/profile/${item.engineerId}`)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        عرض الملف الشخصي
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
