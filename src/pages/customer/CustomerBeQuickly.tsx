import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { MapPin, Zap, ArrowLeft, Send } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowActionCard } from '../../components/ui';

export default function CustomerBeQuickly() {
  const navigate = useNavigate();
  const { addRequest, currentUser } = useData();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    addRequest({
      type: 'quick',
      category: 'General',
      area: 'Hebron - City Center',
      location,
      status: 'Pending',
      description,
      customerName: 'Current User',
      customerId: currentUser.id,
    });
    
    setSubmitted(true);
    setTimeout(() => navigate('/customer/requests'), 2000);
  };

  return (
    <AppShell title="⚡ Be Quickly" subtitle="Submit an urgent request and engineers in your area will be notified instantly">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <WowActionCard
            title="Instant"
            description="Engineers notified immediately"
            icon={<Zap className="w-6 h-6" />}
            accentColor="#136F94"
          />
          <WowActionCard
            title="Local"
            description="Only nearby engineers see this"
            icon={<MapPin className="w-6 h-6" />}
            accentColor="#136F94"
          />
          <WowActionCard
            title="Fast"
            description="Average response: 15 min"
            icon={<Send className="w-6 h-6" />}
            accentColor="#D4AF37"
          />
        </div>

        <Card className="p-6">
          <CardTitle className="text-xl mb-4">Quick Request Form</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">Problem Description *</label>
              <Textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your issue briefly..."
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">Location / Address *</label>
              <Input
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter your address"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank')}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Open in Google Maps
              </Button>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" size="lg" className="flex-1 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand">
                <Zap className="w-5 h-5 mr-2" />
                Send Quick Request
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/customer/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
            
            {submitted && (
              <div className="p-4 bg-success/10 border border-success/30 rounded-xl text-success text-sm flex items-center gap-2">
                <span className="text-lg">✓</span>
                Request sent! Engineers in your area will be notified. Redirecting...
              </div>
            )}
            
            <p className="text-xs text-text-muted text-center pt-2">
              You'll receive a notification as soon as an engineer accepts your request
            </p>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
