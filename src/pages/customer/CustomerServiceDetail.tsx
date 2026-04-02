import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { Star, MapPin, Award, ArrowLeft, Send, User, Clock } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';

export default function CustomerServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { services, engineers, addRequest, currentUser, portfolio } = useData();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const service = services.find(s => s.id === serviceId);
  const engineer = service ? engineers.find(e => e.id === service.engineerId) : null;
  const engineerPortfolio = portfolio.filter(p => p.id.startsWith('P'));

  if (!service || !engineer) {
    return (
      <AppShell title="Service Not Found" subtitle="The requested service could not be found">
        <Card className="p-8 text-center">
          <p className="text-text-secondary">Service not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/customer/late')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
        </Card>
      </AppShell>
    );
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addRequest({
      type: 'late',
      category: service.name,
      area: engineer.area,
      location,
      status: 'Pending',
      description: description || service.description,
      customerName: 'Current User',
      customerId: currentUser.id,
      engineerId: engineer.id,
      engineerName: engineer.name,
      serviceId: service.id, // Link to service for price consistency
      price: service.price, // Price pulled from services.ts
    });

    setSubmitted(true);
    setTimeout(() => navigate('/customer/requests'), 2000);
  };

  return (
    <AppShell title={service.name} subtitle={`Service by ${engineer.name}`}>
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Engineer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Rating"
            value={engineer.rating.toFixed(1)}
            subtitle="Out of 5"
            icon={<Star className="w-5 h-5" />}
            trend="up"
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Experience"
            value={`${engineer.experience}y`}
            subtitle="Years"
            icon={<Award className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Price"
            value={`₪${service.price}`}
            subtitle="Fixed rate"
            icon={<Clock className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Area"
            value={engineer.city}
            subtitle={engineer.area}
            icon={<MapPin className="w-5 h-5" />}
            accentColor="#136F94"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Engineer Info */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-2xl font-bold">
                {engineer.name[0]}
              </div>
              <div>
                <CardTitle className="text-xl">{engineer.name}</CardTitle>
                <CardDescription>{engineer.specialization}</CardDescription>
              </div>
            </div>
            
            <p className="text-sm text-text-secondary mt-4">{engineer.bio}</p>

            {engineerPortfolio.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <h4 className="text-sm font-semibold mb-3">Portfolio Highlights</h4>
                <div className="space-y-2">
                  {engineerPortfolio.slice(0, 2).map(item => (
                    <div key={item.id} className="text-sm p-3 rounded-lg bg-neutral-50">
                      <p className="font-medium text-text-primary">{item.title}</p>
                      <p className="text-text-muted text-xs mt-1">{item.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Service Request Form */}
          <Card className="p-6">
            <CardTitle className="text-xl">{service.name}</CardTitle>
            <CardDescription className="mt-1">{service.description}</CardDescription>
            <p className="text-2xl font-bold text-brand mt-3">₪{service.price}</p>
          <CardDescription>{service.description}</CardDescription>
          <p className="text-brand-light font-semibold text-lg mt-2">{service.price} NIS</p>

          <form onSubmit={handleSendRequest} className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Your Location</label>
              <Input
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter address"
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

            <div>
              <label className="text-xs text-slate-400 block mb-1">Additional Details (Optional)</label>
              <Textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Any specific requirements..."
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand">
              <Send className="w-4 h-4 mr-2" />
              Send Request to {engineer.name}
            </Button>

            {submitted && (
              <div className="p-4 bg-success/10 border border-success/30 rounded-xl text-success text-sm flex items-center gap-2">
                <span className="text-lg">✓</span>
                Request sent! Redirecting to your requests...
              </div>
            )}
          </form>
        </Card>
      </div>
      </div>
    </AppShell>
  );
}
