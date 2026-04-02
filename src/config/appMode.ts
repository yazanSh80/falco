/**
 * Application Mode Configuration
 * 
 * Centralized configuration for demo mode and API settings.
 * This file exports all mode-related constants used throughout the app.
 */

// Demo mode - when true, uses mock data instead of real API calls
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// API base URL for backend requests
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// App version for exports and logs
export const APP_VERSION = '1.0.0';

// Last mock data sync time (for demo mode display)
export const DEMO_SYNC_TIME = new Date().toISOString();

// Mode labels for display
export const getModeLabel = (): 'Demo' | 'Live' => DEMO_MODE ? 'Demo' : 'Live';
export const getBackendLabel = (): 'Connected' | 'Demo' => DEMO_MODE ? 'Demo' : 'Connected';
