import { Card, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { UserX, Shield, Ban } from 'lucide-react';

export default function EngineerBlockList() {
  const { blockedUsers, currentUser, unblockUser } = useData();
  const myBlocked = blockedUsers.filter(b => b.userId === currentUser?.id);

  return (
    <AppShell title="Blocked Customers" subtitle="Customers you've blocked will not be able to send you requests">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <WowKPICard
            title="Total Blocked"
            value={myBlocked.length}
            subtitle="Customers"
            icon={<Ban className="w-5 h-5" />}
            accentColor="#ef4444"
          />
          <WowKPICard
            title="Protection"
            value="Active"
            subtitle="Filter enabled"
            icon={<Shield className="w-5 h-5" />}
            accentColor="#22c55e"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
        {myBlocked.length === 0 && (
          <p className="text-slate-400">No blocked customers.</p>
        )}
        {myBlocked.map(blocked => (
          <Card key={blocked.id} className="flex items-center justify-between">
            <div>
              <CardTitle>{blocked.blockedName}</CardTitle>
              <p className="text-xs text-slate-500">Blocked on {new Date(blocked.blockedAt).toLocaleDateString()}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (window.confirm(`Unblock ${blocked.blockedName}?`)) {
                  unblockUser(blocked.blockedId);
                }
              }}
            >
              <UserX className="w-4 h-4 mr-1" /> Unblock
            </Button>
          </Card>
        ))}
        </div>
      </div>
    </AppShell>
  );
}
