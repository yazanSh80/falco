import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FalcoLogo } from './FalcoLogo';
import { useData } from '../state/DataContext';
import { Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { EffectsToggle, ThemeToggle } from './ui';

export default function Navbar() {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'customer':
        return '/customer/dashboard';
      case 'engineer':
        return '/engineer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="bg-gradient-hero border-b border-brand-dark/20 shadow-soft fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition flex-shrink-0">
          <FalcoLogo variant="full" size="sm" colorMode="white" />
        </Link>

        {/* Right side - User section & Controls */}
        <div className="flex items-center gap-3 md:gap-4 ml-auto">
          {currentUser ? (
            <>
              {/* Dashboard link */}
              <NavLink
                to={getDashboardPath()}
                className={({ isActive }) =>
                  `hidden md:flex items-center gap-1 text-sm font-medium transition-all px-3 py-2 rounded-md ${
                    isActive
                      ? 'text-white bg-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>

              {/* Theme and Effects toggles */}
              <ThemeToggle />
              <EffectsToggle variant="compact" />

              {/* User info */}
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/20">
                <span className="text-sm text-white/70">
                  {currentUser.name}
                </span>
                <span className="px-2 py-1 text-xs bg-white/10 rounded-full capitalize font-medium text-white/80">
                  {currentUser.role}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-white/70 hover:text-white hover:bg-white/10 px-2 py-1 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Public navigation links - Desktop */}
              <nav className="hidden md:flex items-center gap-1 md:gap-2">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all px-3 py-2 rounded-md ${
                      isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all px-3 py-2 rounded-md ${
                      isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all px-3 py-2 rounded-md ${
                      isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all px-3 py-2 rounded-md ${
                      isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  Sign Up
                </NavLink>
              </nav>

              {/* Theme toggle for public users */}
              <ThemeToggle />

              {/* Mobile: Simplified public nav */}
              <div className="md:hidden flex items-center gap-2">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all px-2 py-1.5 rounded-md ${
                      isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all px-2 py-1.5 rounded-md ${
                      isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  Sign Up
                </NavLink>
              </div>

              {/* Admin link - always visible */}
              <NavLink
                to="/login?next=/admin/dashboard"
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors ml-2 pl-3 border-l border-white/10"
                title="Admin Login"
              >
                <Shield className="w-3.5 h-3.5" />
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
