import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Sidebar from './components/Sidebar';
import { LandingPage } from './components/landing';
import { ProtectedRoute, RedirectIfAuthenticated } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/ui/PageLoader';
import { ThemeProvider } from './state/ThemeContext';
import { ElectricSVGFilter } from './components/ui/electric-card';

// Lazy load pages for better performance
const AboutUs = lazy(() => import('./components/about-us'));
const LoginForm = lazy(() => import('./components/login-form'));
const SignUpForm = lazy(() => import('./components/signup-form'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const DemoPage = lazy(() => import('./pages/DemoPage'));
const UIShowcase = lazy(() => import('./pages/UIShowcase'));

// Customer pages - lazy loaded
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerBeQuickly = lazy(() => import('./pages/customer/CustomerBeQuickly'));
const CustomerLateFeatures = lazy(() => import('./pages/customer/CustomerLateFeatures'));
const CustomerLateWorks = lazy(() => import('./pages/customer/CustomerLateWorks'));
const CustomerServiceDetail = lazy(() => import('./pages/customer/CustomerServiceDetail'));
const CustomerRequestsList = lazy(() => import('./pages/customer/CustomerRequestsList'));
const CustomerNewRequest = lazy(() => import('./pages/customer/CustomerNewRequest'));
const CustomerPriceList = lazy(() => import('./pages/customer/CustomerPriceList'));
const CustomerFinances = lazy(() => import('./pages/customer/CustomerFinances'));
const CustomerNotifications = lazy(() => import('./pages/customer/CustomerNotifications'));
const CustomerBlockList = lazy(() => import('./pages/customer/CustomerBlockList'));
const CustomerMostWorkedEngineers = lazy(() => import('./pages/customer/CustomerMostWorkedEngineers'));

// Engineer pages - lazy loaded
const EngineerDashboard = lazy(() => import('./pages/engineer/EngineerDashboard'));
const EngineerPending = lazy(() => import('./pages/engineer/EngineerPending'));
const EngineerAvailableRequests = lazy(() => import('./pages/engineer/EngineerAvailableRequests'));
const EngineerJobs = lazy(() => import('./pages/engineer/EngineerJobs'));
const EngineerProfile = lazy(() => import('./pages/engineer/EngineerProfile'));
const EngineerSubscription = lazy(() => import('./pages/engineer/EngineerSubscription'));
const EngineerFinance = lazy(() => import('./pages/engineer/EngineerFinance'));
const EngineerBlockList = lazy(() => import('./pages/engineer/EngineerBlockList'));
const EngineerNotifications = lazy(() => import('./pages/engineer/EngineerNotifications'));
const PublicProfile = lazy(() => import('./pages/engineer/PublicProfile'));

// Shared pages
const DealContract = lazy(() => import('./pages/shared/DealContract'));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAddAdmin = lazy(() => import('./pages/admin/AdminAddAdmin'));
const AdminEngineers = lazy(() => import('./pages/admin/AdminEngineers'));
const AdminManageUsers = lazy(() => import('./pages/admin/AdminManageUsers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminFinances = lazy(() => import('./pages/admin/AdminFinances'));
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes'));
const AdminAreas = lazy(() => import('./pages/admin/AdminAreas'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminSLA = lazy(() => import('./pages/admin/AdminSLA'));
const AdminDataViewer = lazy(() => import('./pages/admin/AdminDataViewer'));
const AdminDatabaseExplorer = lazy(() => import('./pages/admin/AdminDatabaseExplorer'));

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        {/* Global SVG Filter for Electric Card effects */}
        <ElectricSVGFilter />
        
        <div className="min-h-screen flex flex-col overflow-hidden transition-colors duration-300 pt-16">
          <Navbar />
          <Sidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={
              <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
                <AboutUs />
              </div>
            } />
            <Route path="/403" element={
              <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
                <AccessDenied />
              </div>
          } />
          
          {/* Demo & Credits Pages */}
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/ui-showcase" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <UIShowcase />
            </div>
          } />
          
          <Route path="/login" element={
            <RedirectIfAuthenticated>
              <LoginForm />
            </RedirectIfAuthenticated>
          } />
          <Route path="/signup" element={
            <RedirectIfAuthenticated>
              <SignUpForm />
            </RedirectIfAuthenticated>
          } />
          <Route path="/register" element={
            <RedirectIfAuthenticated>
              <SignUpForm />
            </RedirectIfAuthenticated>
          } />
          
          {/* Customer routes - Protected */}
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/customer/dashboard" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/be-quickly" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerBeQuickly />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/new-request" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerNewRequest />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/late" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLateFeatures />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/late/:featureId" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLateWorks />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/late/service/:serviceId" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerServiceDetail />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/requests" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerRequestsList />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/price-list" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerPriceList />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/finances" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerFinances />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/notifications" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerNotifications />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/block-list" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerBlockList />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/customer/most-worked" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerMostWorkedEngineers />
              </ProtectedRoute>
            </div>
          } />
          
          {/* Engineer routes - Protected */}
          <Route path="/engineer" element={<Navigate to="/engineer/dashboard" replace />} />
          <Route path="/engineer/pending" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerPending />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/dashboard" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerDashboard />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/requests" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerAvailableRequests />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/jobs" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerJobs />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/profile" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerProfile />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/subscription" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerSubscription />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/finance" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerFinance />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/block-list" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerBlockList />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/engineer/notifications" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerNotifications />
              </ProtectedRoute>
            </div>
          } />
          
          {/* Public Engineer Profile - Anyone can view */}
          <Route path="/engineer/profile/:engineerId" element={<PublicProfile />} />
          <Route path="/technician/:engineerId" element={<PublicProfile />} />
          
          {/* Deal Contract Page - Shared between customer and engineer */}
          <Route path="/deal/:requestId" element={
            <ProtectedRoute allowedRoles={['customer', 'engineer', 'admin']}>
              <DealContract />
            </ProtectedRoute>
          } />
          <Route path="/contract/:requestId" element={
            <ProtectedRoute allowedRoles={['customer', 'engineer', 'admin']}>
              <DealContract />
            </ProtectedRoute>
          } />
          
          {/* Admin routes - Protected */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/add-admin" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAddAdmin />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/engineers" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEngineers />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/users" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManageUsers />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/reviews" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReviews />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/finances" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminFinances />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/disputes" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDisputes />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/areas" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAreas />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/reports" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/audit-log" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditLog />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/admin/sla" element={
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSLA />
              </ProtectedRoute>
            </div>
          } />
            <Route path="/admin/data-viewer" element={
              <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDataViewer />
                </ProtectedRoute>
              </div>
            } />
            <Route path="/admin/database" element={
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDatabaseExplorer />
                </ProtectedRoute>
              </div>
            } />
            
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
      </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
