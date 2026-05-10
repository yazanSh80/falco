import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useData } from '../state/DataContext';
import {
  Menu, X, Zap, Package, DollarSign, Clock, CreditCard,
  Bell, Ban, Users, Eye, User, CheckCircle, BarChart3,
  AlertCircle, MapPin, FileText, Briefcase, LogOut
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
    navigate('/');
  };

  // Role-based navigation items
  const getNavItems = (): NavItem[] => {
    if (!currentUser) return [];

    const customerItems: NavItem[] = [
      { label: 'Request Inspection', path: '/customer/new-request?intent=inspection', icon: <Zap className="w-5 h-5" /> },
      { label: 'Browse Services', path: '/customer/late', icon: <Package className="w-5 h-5" /> },
      { label: 'Price List', path: '/customer/price-list', icon: <DollarSign className="w-5 h-5" /> },
      { label: 'My Requests', path: '/customer/requests', icon: <Clock className="w-5 h-5" /> },
      { label: 'Finances', path: '/customer/finances', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'Notifications', path: '/customer/notifications', icon: <Bell className="w-5 h-5" /> },
      { label: 'Block List', path: '/customer/block-list', icon: <Ban className="w-5 h-5" /> },
      { label: 'Most Worked', path: '/customer/most-worked', icon: <Users className="w-5 h-5" /> },
    ];

    const engineerItems: NavItem[] = [
      { label: 'Quick Requests', path: '/engineer/requests', icon: <Zap className="w-5 h-5" /> },
      { label: 'My Jobs', path: '/engineer/jobs', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Profile', path: '/engineer/profile', icon: <User className="w-5 h-5" /> },
      { label: 'Finance', path: '/engineer/finance', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'Subscription', path: '/engineer/subscription', icon: <Package className="w-5 h-5" /> },
      { label: 'Notifications', path: '/engineer/notifications', icon: <Bell className="w-5 h-5" /> },
      { label: 'Block List', path: '/engineer/block-list', icon: <Ban className="w-5 h-5" /> },
    ];

    const adminItems: NavItem[] = [
      { label: 'Data Viewer', path: '/admin/data-viewer', icon: <Eye className="w-5 h-5" /> },
      { label: 'Add New Admin', path: '/admin/add-admin', icon: <User className="w-5 h-5" /> },
      { label: 'Review Engineers', path: '/admin/engineers', icon: <CheckCircle className="w-5 h-5" /> },
      { label: 'Manage Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
      { label: 'View Reviews', path: '/admin/reviews', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Finances', path: '/admin/finances', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'Disputes', path: '/admin/disputes', icon: <AlertCircle className="w-5 h-5" /> },
      { label: 'Service Areas', path: '/admin/areas', icon: <MapPin className="w-5 h-5" /> },
      { label: 'Reports', path: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
      { label: 'SLA Monitoring', path: '/admin/sla', icon: <Clock className="w-5 h-5" /> },
      { label: 'Audit Log', path: '/admin/audit-log', icon: <FileText className="w-5 h-5" /> },
    ];

    switch (currentUser.role) {
      case 'customer':
        return customerItems;
      case 'engineer':
        return engineerItems;
      case 'admin':
        return adminItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Don't show sidebar on public routes
  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-brand text-white rounded-full shadow-lg hover:bg-brand-dark transition-colors"
        aria-label="Toggle sidebar"
        title="Navigation menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20 top-16 left-0 right-0 bottom-0"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-card-bg border-r border-border-color
          overflow-y-auto transition-transform duration-300 ease-in-out z-30
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <nav className="sticky top-0 h-full flex flex-col p-4">
          {/* Navigation Items */}
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light'
                      : 'text-text-secondary dark:text-text-muted hover:bg-bg-tertiary dark:hover:bg-card-border'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border-color dark:border-card-border my-4" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
