import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { AlertCircle, CheckCircle, ClipboardCheck, Hammer, Loader2, Send } from 'lucide-react';
import { WEST_BANK_CITIES, WEST_BANK_CITY_AREAS } from '../../data/locations';

const domainOptions = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'ac', label: 'AC' },
  { value: 'low_current', label: 'Low Current' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'smart', label: 'Smart Systems' },
  { value: 'solar', label: 'Solar' },
  { value: 'special', label: 'Special Works' },
];

export default function CustomerNewRequest() {
  const navigate = useNavigate();
  const { currentUser, addRequest } = useData();
  const [searchParams] = useSearchParams();
  const requestIntent = searchParams.get('intent') === 'project_special' ? 'project_special' : 'inspection';
  const entryDomain = searchParams.get('domain') || '';
  const entryScope = searchParams.get('scope') || '';
  const isProjectSpecial = requestIntent === 'project_special';
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category: domainOptions.some((option) => option.value === entryDomain) ? entryDomain : '',
    problemType: entryScope,
    description: '',
    city: currentUser?.city || '',
    area: currentUser?.area || '',
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value, ...(key === 'city' ? { area: '' } : {}) }));
  };
  const areaOptions = form.city ? WEST_BANK_CITY_AREAS[form.city] || [] : [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      setError('Please log in before submitting a request.');
      return;
    }

    const missingFields = [
      !form.category && 'domain',
      !form.problemType && (isProjectSpecial ? 'project scope' : 'issue type'),
      !form.description && 'details',
      !form.city && 'city',
      !form.area && 'area',
    ].filter(Boolean);

    if (missingFields.length > 0) {
      setError(`Please complete: ${missingFields.join(', ')}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addRequest({
        type: isProjectSpecial ? 'late' : 'quick',
        requestIntent,
        category: form.category,
        city: form.city,
        area: `${form.city} - ${form.area}`,
        location: `${form.city} - ${form.area}`,
        status: 'Pending',
        description: `${form.problemType}: ${form.description}`,
        customerName: currentUser.name,
        customerId: currentUser.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell title="Request Submitted" subtitle="Your request is now queued for review">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-success">Request Submitted</CardTitle>
            <CardDescription className="mt-2">
              {isProjectSpecial
                ? 'Operations will review the project scope before routing.'
                : 'Operations will review the inspection request before pricing or routing.'}
            </CardDescription>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/customer/dashboard')}>
                Dashboard
              </Button>
              <Button onClick={() => navigate('/customer/requests')}>
                My Requests
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={isProjectSpecial ? 'Project / Special Work Request' : 'Inspection Request'}
      subtitle={isProjectSpecial ? 'Submit project scope for operations review' : 'Submit an issue for inspection review'}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <CardTitle className="flex items-center gap-2">
            {isProjectSpecial ? <Hammer className="w-5 h-5 text-brand" /> : <ClipboardCheck className="w-5 h-5 text-brand" />}
            {isProjectSpecial ? 'Project Details' : 'Inspection Details'}
          </CardTitle>
          <CardDescription className="mt-1">
            {isProjectSpecial
              ? 'No fixed service price is applied here. The team will review and route it.'
              : 'Describe the issue. Inspection pricing or after-visit pricing can be handled after review.'}
          </CardDescription>
          <div className="mt-4 rounded-xl border border-brand/15 bg-brand/5 p-3 text-sm text-text-secondary">
            {isProjectSpecial
              ? 'Pricing mode: project quote. No fixed service price is attached at submit.'
              : 'Pricing mode: inspection fee or after visit. Operations confirms the next step.'}
          </div>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Domain *</label>
              <Select value={form.category} onChange={(event) => update('category', event.target.value)} required>
                <option value="">Select a domain...</option>
                {domainOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Issue / Scope *</label>
              <Input
                placeholder={isProjectSpecial ? 'e.g. Solar roof project, fiber extension' : 'e.g. Panel inspection, AC diagnosis'}
                value={form.problemType}
                onChange={(event) => update('problemType', event.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Details *</label>
              <Textarea
                rows={4}
                placeholder={isProjectSpecial ? 'Describe scope, building type, timeline, and any known constraints.' : 'Describe symptoms, safety concerns, and when the issue started.'}
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">City *</label>
              <Select value={form.city} onChange={(event) => update('city', event.target.value)} required>
                <option value="">Select city...</option>
                {WEST_BANK_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Area / Village *</label>
              <Select
                value={form.area}
                onChange={(event) => update('area', event.target.value)}
                disabled={!form.city}
                required
              >
                <option value="">{form.city ? 'Select area or village...' : 'Select city first'}</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-500">
                Exact map location is not required. City and area are enough for routing nearby engineers.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/customer/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
