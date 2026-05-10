import { useData } from '../../state/DataContext';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { useState } from 'react';
import { Input } from '../../components/ui/input';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { Star, Award, MapPin, Upload, Briefcase, Image } from 'lucide-react';

export default function EngineerProfile() {
  const { portfolio, addPortfolioItem, engineers, currentUser } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '' });

  const engineer = engineers.find(e => e.id === currentUser?.id) || engineers[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addPortfolioItem({ ...form, image: '' });
    setForm({ title: '', description: '', location: '' });
    setOpen(false);
  };

  return (
    <AppShell title="My Profile & Portfolio" subtitle="Manage your professional presence and showcase your work">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Rating"
            value={engineer.rating.toFixed(1)}
            subtitle="Average score"
            icon={<Star className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Experience"
            value={`${engineer.experience}y`}
            subtitle="Years active"
            icon={<Award className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Portfolio"
            value={portfolio.length}
            subtitle="Projects"
            icon={<Image className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Specialization"
            value="Expert"
            subtitle={engineer.specialization}
            icon={<Briefcase className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
        </div>
      
      {/* Profile Card - LinkedIn Style */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-brand-light/20 flex items-center justify-center text-4xl font-bold border-4 border-brand-light">
              {engineer.name[0]}
            </div>
            <Button variant="outline" size="sm" className="mt-3">
              <Upload className="w-4 h-4 mr-1" /> Upload Photo
            </Button>
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <CardTitle className="text-2xl">{engineer.name}</CardTitle>
              <CardDescription className="text-base">{engineer.specialization}</CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-light" />
                <span>{engineer.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-light" />
                <span>{engineer.city} - {engineer.area}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{engineer.rating.toFixed(1)} rating</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 mb-1">Bio</p>
              <Textarea rows={3} defaultValue={engineer.bio || 'Add your professional bio...'} className="text-sm" />
              <Button variant="outline" size="sm" className="mt-2">Update Bio</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Portfolio Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Portfolio</h3>
        <Button size="sm" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Add Project'}</Button>
      </div>

      {open && (
        <Card>
          <CardTitle>New Portfolio Item</CardTitle>
          <form onSubmit={submit} className="space-y-3 mt-3">
            <div>
              <label className="text-xs text-slate-400">Project Title</label>
              <Input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Description</label>
              <Textarea required rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Location</label>
              <Input required value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Project Image</label>
              <Button type="button" variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" /> Upload Image (Placeholder)
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Project</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {portfolio.map(p => (
          <Card key={p.id}>
            <CardTitle>{p.title}</CardTitle>
            <CardDescription>{p.location}</CardDescription>
            <p className="text-xs text-slate-400 mt-1">{p.description}</p>
            <div className="mt-2 h-32 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">
              {p.image ? <img src={p.image} alt={p.title} className="object-cover w-full h-full rounded" /> : 'Image Placeholder'}
            </div>
          </Card>
        ))}
      </div>
      </div>
    </AppShell>
  );
}
