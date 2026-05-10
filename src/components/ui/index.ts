/**
 * FalcoElectrec UI Component Library
 * Centralized exports for all UI components
 */

// Core Components
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Input } from './input';
export { Select } from './select';
export { Textarea } from './textarea';
export { Badge } from './badge';

// Modal
export { Modal, ConfirmModal } from './modal';

// Toast Notifications
export { ToastProvider, useToast } from './toast';

// Skeleton Loading
export { Skeleton, SkeletonCard, SkeletonTable, SkeletonKPICard } from './skeleton';

// Empty State
export { EmptyState, NoDataState, NoSearchResultsState, ErrorState } from './empty-state';

// Status Timeline
export { StatusTimeline, StatusBadge } from './status-timeline';
export type { RequestStatus } from './status-timeline';

// Spinner
export { Spinner } from './spinner';

// Avatar
export { Avatar, AvatarGroup } from './avatar';

// KPI Cards
export { KPICard, StatCard } from './kpi-card';

// WOW Components (Premium Effects)
export { default as WowKPICard } from './wow-kpi-card';
export { default as WowActionCard } from './wow-action-card';
export { default as EffectsToggle } from './effects-toggle';

// Theme Toggle
export { ThemeToggle } from './theme-toggle';

// Electric Card (Premium Animated Border)
export { ElectricCard, ElectricCardCompact, ElectricSVGFilter } from './electric-card';

// Premium Components
export { PremiumStatCard, ViewsStatCard, RedemptionsStatCard, CodeClipsStatCard } from './premium-stat-card';
export { GradientCard, AnimatedBorderCard, CampaignCard } from './gradient-card';
export { PremiumTabs, CampaignSlider } from './premium-tabs';
export { PremiumSidebar, SidebarUserCard } from './premium-sidebar';
export { PremiumTable, TableAction, TableBadge } from './premium-table';
export { DashboardNav, Breadcrumb, SectionHeader, PageHeader } from './dashboard-nav';
export { DashboardCard, DashboardCardHeader, StatusBadge as DashboardStatusBadge, SegmentedProgress, Metric } from './dashboard-card';
