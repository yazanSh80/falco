import { useState } from 'react';
import { useData } from '../../state/DataContext';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { MapPin, Zap, AlertTriangle, Clock } from 'lucide-react';

export default function EngineerAvailableRequests() {
  const { customerRequests, acceptRequest, currentUser, blockedUsers, engineers } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  
  const currentEngineer = engineers.find(e => e.id === currentUser?.id || e.email === currentUser?.email) || engineers[0];
  const subscriptionExpired = currentEngineer?.subscriptionStatus === 'expired';
  
  // Filter: quick requests, pending status, same city/nearby area, customer not blocked.
  const engineerArea = currentEngineer.area;
  const engineerCity = currentEngineer.city;
  const blockedCustomerIds = blockedUsers.filter(b => b.userId === currentUser?.id).map(b => b.blockedId);
  const normalize = (value?: string) => (value || '').toLowerCase().trim();
  const requestCity = (area: string, city?: string) => city || area.split('-')[0]?.trim() || '';
  const requestAreaOnly = (area: string) => area.split('-').slice(1).join('-').trim() || area;
  
  const availableRequests = customerRequests
    .filter((r) => (
      r.type === 'quick' &&
      r.status === 'Pending' &&
      normalize(requestCity(r.area, r.city)) === normalize(engineerCity) &&
      !blockedCustomerIds.includes(r.customerId)
    ))
    .sort((a, b) => {
      const aSameArea = normalize(requestAreaOnly(a.area)) === normalize(engineerArea) ? 0 : 1;
      const bSameArea = normalize(requestAreaOnly(b.area)) === normalize(engineerArea) ? 0 : 1;
      return aSameArea - bSameArea;
    });

  const req = availableRequests.find(r => r.id === selected);

  const handleAccept = (requestId: string) => {
    if (currentUser && window.confirm('Accept this request?')) {
      acceptRequest(requestId, currentUser.id, currentEngineer.name);
      alert('Request accepted! Customer will be notified.');
      setSelected(null);
    }
  };

  return (
    <AppShell title="Quick Requests" subtitle={`"Be Quickly" requests from customers in ${engineerCity} / ${engineerArea}`}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Available"
            value={availableRequests.length}
            subtitle="In your city"
            icon={<Zap className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Urgent"
            value={availableRequests.filter(r => r.type === 'quick').length}
            subtitle="Quick requests"
            icon={<Clock className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
        </div>
      
      {/* Subscription Expiry Warning */}
      {subscriptionExpired && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 font-semibold">⚠️ Subscription Expired</p>
          <p className="text-sm text-red-300 mt-1">
            Your subscription has expired. Please renew to accept new jobs.
          </p>
          <Button 
            variant="primary" 
            size="sm" 
            className="mt-3"
            onClick={() => window.location.href = '/engineer/subscription'}
          >
            Renew Subscription
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {availableRequests.length === 0 && (
          <p className="text-slate-400">No quick requests available in your city at the moment.</p>
        )}
        {availableRequests.map(r => (
          <Card
            key={r.id}
            className="cursor-pointer hover:border-brand-light transition-colors"
            onClick={() => setSelected(r.id)}
          >
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-light" />
                {r.category}
              </CardTitle>
              <Badge>Quick</Badge>
            </div>
            <CardDescription>{r.area}</CardDescription>
            <p className="text-sm text-slate-300 mt-2">{r.description}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
              <MapPin className="w-3 h-3" />
              <span>{r.location}</span>
            </div>
          </Card>
        ))}
      </div>

      {req && (
        <Card>
          <CardTitle>Request {req.id} Details</CardTitle>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-slate-400">Type:</span> Be Quickly (Urgent)</p>
            <p><span className="text-slate-400">Category:</span> {req.category}</p>
            <p><span className="text-slate-400">Area:</span> {req.area}</p>
            <p><span className="text-slate-400">Description:</span> {req.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Location:</span>
              <span>{req.location}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(req.location)}`, '_blank')}
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
            <p><span className="text-slate-400">Customer:</span> {req.customerName}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => handleAccept(req.id)}
              disabled={subscriptionExpired}
            >
              {subscriptionExpired ? 'Subscription Required' : 'Accept Request'}
            </Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </div>
          
          {subscriptionExpired && (
            <p className="text-xs text-red-400 mt-2">
              You must have an active subscription to accept requests.
            </p>
          )}
        </Card>
      )}
      </div>
    </AppShell>
  );
}
