import { Card } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { CheckCircle, Bell, BellOff, Inbox } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';

export default function CustomerNotifications() {
  const { notifications, currentUser, markNotificationRead } = useData();
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <AppShell title="Notifications" subtitle="Stay updated with your service requests and activities">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Total"
            value={userNotifications.length}
            subtitle="Notifications"
            icon={<Bell className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Unread"
            value={unreadCount}
            subtitle="Pending"
            icon={<Inbox className="w-5 h-5" />}
            trend={unreadCount > 0 ? 'up' : 'neutral'}
            accentColor="#D4AF37"
          />
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {userNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <BellOff className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-text-secondary">No notifications yet.</p>
              <p className="text-sm text-text-muted mt-1">You'll receive updates about your requests here.</p>
            </Card>
          ) : (
            userNotifications.map(notif => (
              <Card 
                key={notif.id} 
                className={`p-4 transition-all hover:shadow-md ${
                  !notif.read ? 'border-l-4 border-l-brand bg-brand/5' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !notif.read ? 'bg-brand/10' : 'bg-neutral-100'
                    }`}>
                      <Bell className={`w-5 h-5 ${!notif.read ? 'text-brand' : 'text-neutral-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-text-primary">{notif.message}</p>
                      <p className="text-xs text-text-muted mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-brand hover:bg-brand/10"
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Read
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
