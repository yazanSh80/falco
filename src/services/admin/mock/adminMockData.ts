/**
 * Admin Mock Data
 * 
 * Centralized mock data generators for demo mode.
 * All mock data follows the same shape as real API responses.
 */

import type {
  RoleDistribution,
  RiskIndicator,
  PlatformConfidence,
  InsightCard,
  RecentActivity,
  AuditSeverity,
  SLARecommendation,
  AreaHealthScore
} from '../../../types/admin';

// ========================================================================
// Role Distribution Data
// ========================================================================
export const generateRoleDistribution = (): RoleDistribution => ({
  customers: 724,
  engineers: 523,
  admins: 3,
  total: 1250
});

// ========================================================================
// Risk Indicators Data
// ========================================================================
export const generateRiskIndicators = (): RiskIndicator[] => [
  {
    id: 'pending-approvals',
    label: 'Pending Approvals > 48h',
    count: 8,
    severity: 'high',
    description: 'Engineers waiting for approval beyond 48 hours',
    actionUrl: '/admin/engineers?filter=pending'
  },
  {
    id: 'sla-at-risk',
    label: 'Requests at SLA Risk',
    count: 5,
    severity: 'medium',
    description: 'Requests approaching their SLA deadline',
    actionUrl: '/admin/sla'
  },
  {
    id: 'open-disputes',
    label: 'Open Disputes',
    count: 12,
    severity: 'medium',
    description: 'Unresolved customer-engineer disputes',
    actionUrl: '/admin/disputes'
  },
  {
    id: 'expired-subscriptions',
    label: 'Expired Subscriptions',
    count: 23,
    severity: 'low',
    description: 'Engineers with expired subscriptions',
    actionUrl: '/admin/engineers?filter=expired'
  }
];

// ========================================================================
// Platform Confidence Score
// ========================================================================
export const generatePlatformConfidence = (): PlatformConfidence => {
  const slaCompliance = 94.5;
  const disputeRate = 0.8;
  const approvalBacklog = 8;
  const customerSatisfaction = 4.7;

  // Calculate composite score (weighted average)
  const slaScore = slaCompliance;
  const disputeScore = Math.max(0, 100 - disputeRate * 10);
  const approvalScore = Math.max(0, 100 - approvalBacklog * 2);
  const satisfactionScore = (customerSatisfaction / 5) * 100;

  const score = Math.round(
    slaScore * 0.35 +
    disputeScore * 0.25 +
    approvalScore * 0.15 +
    satisfactionScore * 0.25
  );

  return {
    score,
    factors: {
      slaCompliance,
      disputeRate,
      approvalBacklog,
      customerSatisfaction
    },
    explanation: 'Calculated from SLA compliance (35%), dispute rate (25%), approval backlog (15%), and customer satisfaction (25%).'
  };
};

// ========================================================================
// Insight Cards for Reports
// ========================================================================
export const generateInsightCards = (): InsightCard[] => [
  {
    id: 'engineer-activity',
    title: 'Engineer Activity Up',
    description: 'Engineer activity increased by 12% compared to last period. More engineers are completing jobs.',
    type: 'success',
    metric: 12,
    trend: {
      current: 523,
      previous: 467,
      change: 56,
      changePercent: 12,
      direction: 'up'
    }
  },
  {
    id: 'sla-risk-region',
    title: 'SLA Risk in South Area',
    description: 'Hebron region shows 15% higher SLA breach rate. Consider assigning more engineers.',
    type: 'warning',
    metric: 15,
    actionLabel: 'View Details',
    actionUrl: '/admin/sla'
  },
  {
    id: 'revenue-stable',
    title: 'Revenue Trend Stable',
    description: 'Monthly revenue is stable at ₪18,920 with 2% growth. Platform fees healthy.',
    type: 'info',
    metric: 2,
    trend: {
      current: 18920,
      previous: 18540,
      change: 380,
      changePercent: 2,
      direction: 'up'
    }
  },
  {
    id: 'customer-satisfaction',
    title: 'High Customer Satisfaction',
    description: 'Average rating of 4.7/5 across 2,985 reviews. Keep up the quality standards!',
    type: 'success',
    metric: 4.7
  },
  {
    id: 'new-registrations',
    title: 'New User Growth',
    description: '47 new users registered this week. Customer acquisition is healthy.',
    type: 'info',
    metric: 47,
    trend: {
      current: 47,
      previous: 42,
      change: 5,
      changePercent: 12,
      direction: 'up'
    }
  }
];

// ========================================================================
// Recent Activity with Enhanced Data
// ========================================================================
export const generateRecentActivity = (): RecentActivity[] => {
  const activities: RecentActivity[] = [
    {
      id: 'act-1',
      action: 'New engineer registration',
      user: 'Mahmoud K.',
      time: '5 min ago',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'info',
      severity: 'info',
      performedBy: null
    },
    {
      id: 'act-2',
      action: 'Service request completed',
      user: 'Ahmad S.',
      time: '12 min ago',
      timestamp: new Date(Date.now() - 12 * 60000),
      type: 'success',
      severity: 'info',
      performedBy: null
    },
    {
      id: 'act-3',
      action: 'Engineer approved',
      user: 'Sara M.',
      time: '1 hour ago',
      timestamp: new Date(Date.now() - 60 * 60000),
      type: 'success',
      severity: 'info',
      performedBy: 'Ahmad Saqer (Super Admin)'
    },
    {
      id: 'act-4',
      action: 'User blocked for policy violation',
      user: 'User #127',
      time: '2 hours ago',
      timestamp: new Date(Date.now() - 120 * 60000),
      type: 'warning',
      severity: 'warning',
      performedBy: 'Ahmad Saqer (Super Admin)'
    },
    {
      id: 'act-5',
      action: 'Critical: SLA breach detected',
      user: 'Request #R-00342',
      time: '3 hours ago',
      timestamp: new Date(Date.now() - 180 * 60000),
      type: 'error',
      severity: 'critical',
      performedBy: 'System'
    },
    {
      id: 'act-6',
      action: 'Payment received',
      user: 'Customer #42',
      time: '4 hours ago',
      timestamp: new Date(Date.now() - 240 * 60000),
      type: 'success',
      severity: 'info',
      performedBy: null
    }
  ];

  return activities;
};

// ========================================================================
// SLA Recommendations
// ========================================================================
export const generateSLARecommendations = (): SLARecommendation[] => [
  {
    id: 'rec-1',
    priority: 'high',
    title: 'Assign more engineers to South Area',
    description: 'Hebron and surrounding areas have higher demand than engineer capacity.',
    actionType: 'capacity',
    affectedCount: 12
  },
  {
    id: 'rec-2',
    priority: 'medium',
    title: 'Review requests pending > 2 hours',
    description: '5 requests are approaching response SLA deadline.',
    actionType: 'response',
    affectedCount: 5
  },
  {
    id: 'rec-3',
    priority: 'low',
    title: 'Consider peak hour staffing',
    description: 'Request volume spikes between 10am-2pm. Encourage engineers to be available.',
    actionType: 'scheduling',
    affectedCount: 0
  }
];

// ========================================================================
// Area Health Scores
// ========================================================================
export const generateAreaHealthScore = (
  engineerCount: number,
  requestCount: number
): AreaHealthScore => {
  // Calculate capacity based on engineers vs requests
  const engineersRequired = Math.ceil(requestCount / 20); // Assume 20 requests per engineer capacity
  const capacityPercent = Math.min(100, Math.round((engineerCount / Math.max(engineersRequired, 1)) * 100));
  
  // Calculate health score
  let score = capacityPercent;
  let coverage: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (capacityPercent >= 90) {
    coverage = 'excellent';
    score = Math.min(100, capacityPercent);
  } else if (capacityPercent >= 70) {
    coverage = 'good';
    score = capacityPercent;
  } else if (capacityPercent >= 50) {
    coverage = 'fair';
    score = capacityPercent;
  } else {
    coverage = 'poor';
    score = capacityPercent;
  }

  return {
    score,
    coverage,
    engineersAvailable: engineerCount,
    engineersRequired,
    capacityPercent
  };
};

// ========================================================================
// Severity Helpers
// ========================================================================
export const getSeverityFromAction = (actionType: string): AuditSeverity => {
  const criticalActions = ['delete_user', 'block_user', 'reject_engineer', 'area_delete'];
  const warningActions = ['permission_update', 'area_update', 'unblock_user'];
  
  if (criticalActions.includes(actionType)) return 'critical';
  if (warningActions.includes(actionType)) return 'warning';
  return 'info';
};

// ========================================================================
// Time Formatting Helpers
// ========================================================================
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export const formatTimeRemaining = (deadline: string | null): string | null => {
  if (!deadline) return null;
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  
  if (diff < 0) {
    const hours = Math.abs(Math.floor(diff / 3600000));
    const mins = Math.abs(Math.floor((diff % 3600000) / 60000));
    return `${hours}h ${mins}m overdue`;
  }
  
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `⏳ ${hours}h ${mins}m remaining`;
};
