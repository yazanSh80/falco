import { useState } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import Button from '../../components/ui/button';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { UserPlus, Users, Shield } from 'lucide-react';

export default function AdminAddAdmin() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setForm({ name: '', email: '', password: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <AppShell title="Add New Admin" subtitle="Create new administrator accounts with elevated privileges">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Total Admins"
            value={3}
            subtitle="Active accounts"
            icon={<Shield className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="This Month"
            value={1}
            subtitle="New admins created"
            icon={<UserPlus className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Active Users"
            value={156}
            subtitle="Total platform users"
            icon={<Users className="w-5 h-5" />}
            accentColor="#22c55e"
          />
        </div>

        <Card className="max-w-xl">
        <CardTitle>Create Admin Account</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Full Name</label>
            <Input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email</label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Password</label>
            <Input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>
          <Button type="submit">Create Admin</Button>
          {submitted && (
            <p className="text-sm text-green-400">Admin account created successfully!</p>
          )}
        </form>
        </Card>
      </div>
    </AppShell>
  );
}
