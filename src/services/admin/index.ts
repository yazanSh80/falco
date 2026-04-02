/**
 * Admin Services - Main Export
 * 
 * Barrel export for all admin services
 * Provides clean API access throughout the application
 */

// Core services
export { adminReportsService, type ReportStats, type EngineerReport, type AreaReport } from './adminReports.service';
export { adminAuditService, type AuditLog, type AuditLogResponse } from './adminAudit.service';
export { adminSLAService, type SLARequest, type SLASummary, type SLADashboard } from './adminSLA.service';
export { adminAreasService, type Area, type AreasResponse } from './adminAreas.service';
export { adminHealthService } from './adminHealth.service';
export { adminDbViewerService, TABLE_CONFIGS } from './adminDbViewer.service';

// Configuration
export { DEMO_MODE, API_BASE_URL } from './config';

// Mock data utilities
export {
  generateRoleDistribution,
  generateRiskIndicators,
  generatePlatformConfidence,
  generateInsightCards,
  generateRecentActivity,
  generateSLARecommendations,
  generateAreaHealthScore,
  getSeverityFromAction,
  formatTimeAgo,
  formatTimeRemaining
} from './mock/adminMockData';

// Re-export admin types
export type * from '../../types/admin';
