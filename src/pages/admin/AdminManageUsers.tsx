import { useState } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import Button from '../../components/ui/button';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { Trash2, Users, Briefcase, UserX, Shield } from 'lucide-react';

type UserType = 'engineer' | 'customer';

export default function AdminManageUsers() {
  const { engineers, customers, deleteEngineer, deleteCustomer } = useData();
  const [filter, setFilter] = useState<UserType>('engineer');

  const handleDeleteEngineer = (id: string, name: string) => {
    if (window.confirm(`Delete engineer ${name}? This action cannot be undone.`)) {
      deleteEngineer(id);
      alert('Engineer deleted.');
    }
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (window.confirm(`Delete customer ${name}? This action cannot be undone.`)) {
      deleteCustomer(id);
      alert('Customer deleted.');
    }
  };

  const acceptedEngineers = engineers.filter(e => e.status === 'accepted');
  const totalUsers = acceptedEngineers.length + customers.length;

  return (
    <AppShell title="Manage Users" subtitle="Block or delete user accounts from the platform">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Users"
            value={totalUsers}
            subtitle="Active accounts"
            icon={<Users className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Engineers"
            value={acceptedEngineers.length}
            subtitle="Verified providers"
            icon={<Briefcase className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="Customers"
            value={customers.length}
            subtitle="Active customers"
            icon={<Shield className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Deleted"
            value={0}
            subtitle="This month"
            icon={<UserX className="w-5 h-5" />}
            accentColor="#ef4444"
          />
        </div>
        
        <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Filter:</label>
        <Select value={filter} onChange={e => setFilter(e.target.value as UserType)}>
          <option value="engineer">Engineers</option>
          <option value="customer">Customers</option>
        </Select>
      </div>

      {filter === 'engineer' && (
        <div className="space-y-3">
          {engineers.filter(e => e.status === 'accepted').map(engineer => (
            <Card key={engineer.id} className="flex items-center justify-between">
              <div>
                <CardTitle>{engineer.name}</CardTitle>
                <p className="text-sm text-slate-400">{engineer.specialization} • {engineer.area}</p>
                <p className="text-xs text-slate-500">{engineer.email}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleDeleteEngineer(engineer.id, engineer.name)}>
                <Trash2 className="w-4 h-4 mr-1 text-red-400" /> Delete
              </Button>
            </Card>
          ))}
        </div>
      )}

      {filter === 'customer' && (
        <div className="space-y-3">
          {customers.map(customer => (
            <Card key={customer.id} className="flex items-center justify-between">
              <div>
                <CardTitle>{customer.name}</CardTitle>
                <p className="text-sm text-slate-400">{customer.area}</p>
                <p className="text-xs text-slate-500">{customer.email}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleDeleteCustomer(customer.id, customer.name)}>
                <Trash2 className="w-4 h-4 mr-1 text-red-400" /> Delete
              </Button>
            </Card>
          ))}
        </div>
      )}
      </div>
    </AppShell>
  );
}