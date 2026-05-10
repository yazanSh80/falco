/**
 * Effects Components Index
 * 
 * These are premium visual effect components for FalcoElectrec.
 * 
 * IMPORTANT UX RULES:
 * - Use only ONE heavy effect per page
 * - All effects respect prefers-reduced-motion
 * - All effects disabled on mobile/touch devices
 * - Always provide fallback backgrounds
 * 
 * WowCursorBackground:
 * - Use ONLY on landing/marketing pages
 * - NEVER on dashboards, forms, or tables
 */

export { default as AttractionBackground } from './AttractionBackground';
export { default as AuthRingLayout } from './AuthRingLayout';
export { WowCursorBackground } from './WowCursorBackground';
export { initWowCursor, generateRandomColors } from './wow-cursor';
export type { TubesCursorApp } from './wow-cursor';
