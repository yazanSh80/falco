/**
 * WowCursorBackground Component
 * 
 * Purpose: Premium ThreeJS Tubes Cursor effect for landing/marketing pages.
 * Creates mesmerizing, mouse-reactive tube animations that follow cursor movement.
 * 
 * UX Rules:
 * - Use ONLY on landing page and marketing pages (About, Home)
 * - NEVER use on dashboards, forms, or tables
 * - Canvas is fixed, fullscreen, behind UI (z-index: 0)
 * - Pointer events disabled so clicks pass through
 * 
 * Performance:
 * - Automatically disabled on mobile/touch devices
 * - Respects prefers-reduced-motion
 * - Color randomization on click for interactivity
 * 
 * License: CC BY-NC-SA 4.0
 * Credit: Kevin Levron (Framer / threejs-components)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useEffectsPreference } from '../../utils/effects';
import { initWowCursor, generateRandomColors, TubesCursorApp } from './wow-cursor';

interface WowCursorBackgroundProps {
  /** Enable color randomization on click (default: true) */
  enableClickRandomize?: boolean;
  /** Custom tube colors */
  tubeColors?: string[];
  /** Custom light colors */
  lightColors?: string[];
  /** Light intensity (default: 200) */
  lightIntensity?: number;
  /** Additional CSS class */
  className?: string;
}

export const WowCursorBackground: React.FC<WowCursorBackgroundProps> = ({
  enableClickRandomize = true,
  tubeColors = ['#f967fb', '#53bc28', '#6958d5'],
  lightColors = ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
  lightIntensity = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesCursorApp | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { canUseHeavyEffects, prefersReducedMotion, isMobile } = useEffectsPreference();

  // Determine if effect should be enabled
  const shouldEnable = canUseHeavyEffects && !prefersReducedMotion && !isMobile;

  // Initialize the cursor effect
  useEffect(() => {
    if (!canvasRef.current || !shouldEnable) return;

    let mounted = true;

    const init = async () => {
      const app = await initWowCursor(canvasRef.current!, {
        tubes: {
          colors: tubeColors,
          lights: {
            intensity: lightIntensity,
            colors: lightColors,
          },
        },
      });

      if (mounted && app) {
        appRef.current = app;
        setIsLoaded(true);
      }
    };

    init();

    return () => {
      mounted = false;
      if (appRef.current?.dispose) {
        appRef.current.dispose();
      }
      appRef.current = null;
      setIsLoaded(false);
    };
  }, [shouldEnable, tubeColors.join(','), lightColors.join(','), lightIntensity]);

  // Handle click for color randomization
  useEffect(() => {
    if (!enableClickRandomize || !appRef.current || !isLoaded) return;

    const handleClick = () => {
      if (appRef.current?.tubes) {
        try {
          appRef.current.tubes.setColors(generateRandomColors(3));
          appRef.current.tubes.setLightsColors(generateRandomColors(4));
        } catch (error) {
          // Silently fail if app is not ready
        }
      }
    };

    document.body.addEventListener('click', handleClick);

    return () => {
      document.body.removeEventListener('click', handleClick);
    };
  }, [enableClickRandomize, isLoaded]);

  // Don't render anything if effects are disabled
  if (!shouldEnable) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      id="wow-cursor-canvas"
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
};

export default WowCursorBackground;
