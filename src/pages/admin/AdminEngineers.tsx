import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { CheckCircle, XCircle, FileText, Clock, Users, UserCheck } from 'lucide-react';

export default function AdminEngineers() {
  const { engineers, updateEngineerStatus } = useData();
  const pendingEngineers = engineers.filter(e => e.status === 'pending');

  const handleAccept = (id: string, email: string) => {
    if (window.confirm('Accept this engineer? An email will be sent.')) {
      updateEngineerStatus(id, 'accepted');
      alert(`Engineer accepted. Email sent to ${email}.`);
    }
  };

  const handleReject = (id: string, email: string) => {
    if (window.confirm('Reject this engineer? An email will be sent.')) {
      updateEngineerStatus(id, 'rejected');
      alert(`Engineer rejected. Email sent to ${email}.`);
    }
  };

  const acceptedEngineers = engineers.filter(e => e.status === 'accepted').length;
  const rejectedEngineers = engineers.filter(e => e.status === 'rejected').length;

  return (
    <AppShell title="Review Engineer Applications" subtitle="Accept or reject engineer applications within 48 hours of submission">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Pending Reviews"
            value={pendingEngineers.length}
            subtitle="Awaiting decision"
            icon={<Clock className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
          <WowKPICard
            title="Accepted"
            value={acceptedEngineers}
            subtitle="Approved engineers"
            icon={<UserCheck className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Rejected"
            value={rejectedEngineers}
            subtitle="Declined applications"
            icon={<XCircle className="w-5 h-5" />}
            accentColor="#ef4444"
          />
          <WowKPICard
            title="Total Engineers"
            value={engineers.length}
            subtitle="All applications"
            icon={<Users className="w-5 h-5" />}
            accentColor="#136F94"
          />
        </div>

        {pendingEngineers.length === 0 && (
          <p className="text-slate-400">No pending engineer applications.</p>
        )}

        <div className="space-y-4">
        {pendingEngineers.map(engineer => (
          <Card key={engineer.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{engineer.name}</CardTitle>
                <CardDescription>{engineer.specialization} • {engineer.experience} years</CardDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-slate-400">Email:</span> {engineer.email}</p>
                  <p><span className="text-slate-400">Area:</span> {engineer.city} - {engineer.area}</p>
                  <p><span className="text-slate-400">Bio:</span> {engineer.bio || 'N/A'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {engineer.cv && (
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" /> View CV
                      </Button>
                    )}
                    {engineer.certificate && (
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" /> View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Badge>{engineer.status}</Badge>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => handleAccept(engineer.id, engineer.email)}>
                <CheckCircle className="w-4 h-4 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleReject(engineer.id, engineer.email)}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          </Card>
        ))}
        </div>
      </div>
    </AppShell>
  );
}
