import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useData } from '../state/DataContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'engineer' | 'admin')[];
  requireAuth?: boolean;
  requireApproved?: boolean; // For engineer routes that require approval
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * 
 * Usage:
 * - <ProtectedRoute requireAuth>...</ProtectedRoute> - Any logged-in user
 * - <ProtectedRoute allowedRoles={['customer']}>...</ProtectedRoute> - Customers only
 * - <ProtectedRoute allowedRoles={['engineer', 'admin']}>...</ProtectedRoute> - Engineers or admins
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  requireApproved = false,
}) => {
  const { currentUser, loading } = useData();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading.auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login with ?next= param
  if (requireAuth && !currentUser) {
    const nextUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${nextUrl}`} replace />;
  }

  // Logged in but wrong role - redirect to 403 access denied
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

/**
 * Get the dashboard path for a given user (considers role and verification status)
 */
export function getDashboardPath(user: { role: 'customer' | 'engineer' | 'admin'; verification_status?: string | null }): string {
  switch (user.role) {
    case 'admin':
      return '/admin/dashboard';
    case 'engineer':
      // Pending engineers go to pending page
      if (user.verification_status !== 'approved') {
        return '/engineer/pending';
      }
      return '/engineer/dashboard';
    case 'customer':
    default:
      return '/customer/dashboard';
  }
}

/**
 * Higher-order component for role-based route protection
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: ('customer' | 'engineer' | 'admin')[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * RedirectIfAuthenticated Component
 * 
 * Redirects logged-in users away from public pages (login, signup)
 */
export const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, loading } = useData();

  if (loading.auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    const dashboardPath = getDashboardPath(currentUser);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
