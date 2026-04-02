import { Card } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { CheckCircle, Bell, BellRing, BellOff } from 'lucide-react';

export default function EngineerNotifications() {
  const { notifications, currentUser, markNotificationRead } = useData();
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <AppShell title="Notifications" subtitle="Stay updated on your jobs and requests">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Total"
            value={userNotifications.length}
            subtitle="All notifications"
            icon={<Bell className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Unread"
            value={unreadCount}
            subtitle="Need attention"
            icon={<BellRing className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
          <WowKPICard
            title="Read"
            value={userNotifications.length - unreadCount}
            subtitle="Reviewed"
            icon={<BellOff className="w-5 h-5" />}
            accentColor="#22c55e"
          />
        </div>
      
        <div className="space-y-3">
        {userNotifications.length === 0 && (
          <p className="text-slate-400">No notifications.</p>
        )}
        {userNotifications.map(notif => (
          <Card key={notif.id} className={`p-4 ${!notif.read ? 'border-brand-light' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm">{notif.message}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              {!notif.read && (
                <Button size="sm" variant="ghost" onClick={() => markNotificationRead(notif.id)}>
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
        </div>
      </div>
    </AppShell>
  );
}
