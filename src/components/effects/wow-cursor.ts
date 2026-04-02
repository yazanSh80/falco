/**
 * WOW Cursor Effect Initializer
 * 
 * Purpose: Initialize ThreeJS Tubes Cursor effect on a canvas element.
 * Creates mesmerizing, mouse-reactive tube animations.
 * 
 * UX Rule: Use ONLY on landing/marketing pages. Never on dashboards/forms.
 * Performance: Heavy effect - check canUseHeavyEffects before enabling.
 * 
 * License: CC BY-NC-SA 4.0
 * Credit: Kevin Levron (Framer / threejs-components)
 */

// Define the app interface returned by TubesCursor
export interface TubesCursorApp {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
  dispose?: () => void;
}

// Type definition for the TubesCursor module
type TubesCursorModule = (
  canvas: HTMLCanvasElement,
  options: {
    tubes: {
      colors: string[];
      lights: {
        intensity: number;
        colors: string[];
      };
    };
  }
) => TubesCursorApp;

// Default tube configuration
const DEFAULT_CONFIG = {
  tubes: {
    colors: ['#f967fb', '#53bc28', '#6958d5'],
    lights: {
      intensity: 200,
      colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5']
    }
  }
};

/**
 * Load TubesCursor module dynamically
 * Uses dynamic import to load the ES module from CDN
 */
async function loadTubesCursor(): Promise<TubesCursorModule | null> {
  try {
    const module = await import(
      /* @vite-ignore */
      'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
    );
    return module.default || module;
  } catch (error) {
    console.warn('[WowCursor] Failed to load TubesCursor module:', error);
    return null;
  }
}

/**
 * Initialize the WOW Cursor effect on a canvas element
 * 
 * @param canvas - HTMLCanvasElement to render on
 * @param config - Optional configuration override
 * @returns Promise<TubesCursorApp | null> - The app instance or null if failed
 */
export async function initWowCursor(
  canvas: HTMLCanvasElement,
  config = DEFAULT_CONFIG
): Promise<TubesCursorApp | null> {
  const TubesCursor = await loadTubesCursor();
  
  if (!TubesCursor) {
    console.warn('[WowCursor] TubesCursor not available');
    return null;
  }

  try {
    const app = TubesCursor(canvas, config);
    return app;
  } catch (error) {
    console.error('[WowCursor] Failed to initialize:', error);
    return null;
  }
}

/**
 * Generate random hex colors
 * 
 * @param count - Number of colors to generate
 * @returns Array of hex color strings
 */
export function generateRandomColors(count: number): string[] {
  return Array.from({ length: count }, () =>
    '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  );
}
