import { Card, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { UserX, Ban, ShieldOff } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';

export default function CustomerBlockList() {
  const { blockedUsers, currentUser, unblockUser } = useData();
  const myBlocked = blockedUsers.filter(b => b.userId === currentUser?.id);

  return (
    <AppShell title="Blocked Engineers" subtitle="Engineers you've blocked will not appear in your recommendations">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Total Blocked"
            value={myBlocked.length}
            subtitle="Engineers"
            icon={<Ban className="w-5 h-5" />}
            accentColor="#ef4444"
          />
          <WowKPICard
            title="Protection"
            value="Active"
            subtitle="Filtering enabled"
            icon={<ShieldOff className="w-5 h-5" />}
            accentColor="#136F94"
          />
        </div>

        {/* Blocked List */}
        <div className="grid md:grid-cols-2 gap-4">
          {myBlocked.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <UserX className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-text-secondary">No blocked engineers.</p>
              <p className="text-sm text-text-muted mt-1">When you block an engineer, they'll appear here.</p>
            </Card>
          ) : (
            myBlocked.map(blocked => (
              <Card key={blocked.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                    <Ban className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{blocked.blockedName}</CardTitle>
                    <p className="text-xs text-text-muted">Blocked on {new Date(blocked.blockedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-success/10 hover:text-success hover:border-success"
                  onClick={() => {
                    if (window.confirm(`Unblock ${blocked.blockedName}?`)) {
                      unblockUser(blocked.blockedId);
                    }
                  }}
                >
                  <UserX className="w-4 h-4 mr-1" /> Unblock
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
