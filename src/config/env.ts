/**
 * Environment Variables Validation
 * Validates and provides typed access to environment variables
 */

interface EnvConfig {
  API_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  IS_DEV: boolean;
  IS_PROD: boolean;
}

function validateEnv(): EnvConfig {
  const API_URL = import.meta.env.VITE_API_URL;
  const MODE = import.meta.env.MODE;

  // Validate required environment variables
  const errors: string[] = [];

  if (!API_URL && MODE === 'production') {
    errors.push('VITE_API_URL is required in production');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    
    // In development, show warning but don't crash
    if (MODE !== 'development') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }

  const nodeEnv = MODE as 'development' | 'production' | 'test';

  return {
    API_URL: API_URL || 'http://localhost:5000/api',
    NODE_ENV: nodeEnv,
    IS_DEV: nodeEnv === 'development',
    IS_PROD: nodeEnv === 'production',
  };
}

// Export validated environment config
export const env = validateEnv();

// Type-safe environment variable access
export default env;
