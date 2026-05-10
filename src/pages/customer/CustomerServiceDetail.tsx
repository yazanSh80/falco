import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import { Star, MapPin, Award, ArrowLeft, Send, Clock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { servicesApi } from '../../api/client';
import { DEMO_MODE } from '../../config/appMode';
import type { Service } from '../../types';
import { getPricingDisplay } from '../../utils/pricingDisplay';

function mapApiServiceDetail(apiService: any, fallback?: Service): Service {
  return {
    id: apiService.id,
    featureId: apiService.feature_id || apiService.featureId || fallback?.featureId || '',
    name: apiService.name || fallback?.name || 'Service',
    price: Number(apiService.base_price ?? apiService.price ?? fallback?.price ?? 0),
    engineerId: fallback?.engineerId || '',
    engineerName: fallback?.engineerName || 'Available Engineer',
    description: apiService.description || fallback?.description || '',
    domain: apiService.domain || fallback?.domain,
    serviceKind: apiService.service_kind || apiService.serviceKind || fallback?.serviceKind,
    pricingMode: apiService.pricing_mode || apiService.pricingMode || fallback?.pricingMode,
    complexity: apiService.complexity || fallback?.complexity,
    requiresVisit: apiService.requires_visit ?? apiService.requiresVisit ?? fallback?.requiresVisit,
    isCore: apiService.is_core ?? apiService.isCore ?? fallback?.isCore,
  };
}

export default function CustomerServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { services, engineers, addRequest, currentUser, portfolio, loading, isApiAvailable } = useData();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [backendService, setBackendService] = useState<Service | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFailed, setDetailFailed] = useState(false);

  const contextService = services.find(s => s.id === serviceId);
  const service = backendService || ((DEMO_MODE || !isApiAvailable || detailFailed) ? contextService : undefined);
  const engineer = service ? engineers.find(e => e.id === service.engineerId) : null;
  const providerName = engineer?.name || service?.engineerName || 'available engineers';
  const engineerPortfolio = portfolio.filter(p => p.id.startsWith('P'));

  useEffect(() => {
    if (!serviceId || DEMO_MODE || !isApiAvailable) {
      setBackendService(null);
      setDetailFailed(false);
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailFailed(false);

    servicesApi.getService(serviceId)
      .then(({ service: apiService }) => {
        if (!cancelled) {
          setBackendService(mapApiServiceDetail(apiService, contextService));
        }
      })
      .catch((err) => {
        console.error('Failed to load service detail from API; using catalog fallback:', err);
        if (!cancelled) {
          setBackendService(null);
          setDetailFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, isApiAvailable, contextService]);

  if (loading.catalog || detailLoading) {
    return (
      <AppShell title="Loading" subtitle="Loading service details">
        <Card className="p-8 text-center">
          <p className="text-text-secondary">Loading service details...</p>
        </Card>
      </AppShell>
    );
  }

  if (!service) {
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

  const pricing = getPricingDisplay(service.pricingMode, service.price);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setRequestError('Please log in before booking a service.');
      return;
    }

    if (!location.trim()) {
      setRequestError('Please enter the service location before booking.');
      return;
    }

    setSubmitting(true);
    setRequestError('');

    try {
      await addRequest({
        type: 'late',
        category: service.name,
        area: engineer?.area || currentUser.area || '',
        location,
        status: 'Pending',
        description: description || service.description,
        customerName: currentUser.name,
        customerId: currentUser.id,
        engineerId: engineer?.id,
        engineerName: providerName,
        requestIntent: 'book_service',
        serviceId: service.id,
        price: service.price,
      });

      setSubmitted(true);
      setTimeout(() => navigate('/customer/requests'), 2000);
    } catch (err) {
      setRequestError('Failed to book this service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title={service.name} subtitle={`Service by ${providerName}`}>
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Engineer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Rating"
            value={engineer ? engineer.rating.toFixed(1) : 'N/A'}
            subtitle="Out of 5"
            icon={<Star className="w-5 h-5" />}
            trend="up"
            accentColor="#7C3AED"
          />
          <WowKPICard
            title="Experience"
            value={engineer ? `${engineer.experience}y` : 'N/A'}
            subtitle="Years"
            icon={<Award className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Price"
            value={pricing.value}
            subtitle={pricing.label}
            icon={<Clock className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Area"
            value={engineer?.city || 'Available'}
            subtitle={engineer?.area || 'Provider matching'}
            icon={<MapPin className="w-5 h-5" />}
            accentColor="#136F94"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Engineer Info */}
          <Card className="p-6 electric-accent-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-2xl font-bold">
                {providerName[0]}
              </div>
              <div>
                <CardTitle className="text-xl">{providerName}</CardTitle>
                <CardDescription>{engineer?.specialization || 'Provider will be matched based on availability'}</CardDescription>
              </div>
            </div>
            
            <p className="text-sm text-text-secondary mt-4">
              {engineer?.bio || 'A suitable provider will be matched for this service when the request is submitted.'}
            </p>

            <div className="mt-4 grid gap-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Provider matching follows active catalog and availability rules.</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand" />
                <span>Booking uses late urgency for scheduled catalog services.</span>
              </div>
            </div>

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
            <div className="mt-3 rounded-xl border border-brand/15 bg-brand/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">Pricing mode</p>
                  <p className="text-2xl font-bold text-brand mt-1">{pricing.value}</p>
                  <p className="text-xs text-text-muted mt-1">{pricing.label}</p>
                </div>
                <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                  {pricing.modeLabel}
                </span>
              </div>
            </div>

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

            {requestError && (
              <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {requestError}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Book Service
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
