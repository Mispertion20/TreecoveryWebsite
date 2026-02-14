/**
 * Environment variable validation utility
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

const REQUIRED_ENV_VARS: EnvVar[] = [
  {
    name: 'SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (for admin operations)',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'Secret key for JWT token signing',
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    description: 'Secret key for JWT refresh token signing',
  },
];

const OPTIONAL_ENV_VARS: EnvVar[] = [
  {
    name: 'PORT',
    required: false,
    description: 'Server port number',
    defaultValue: '3001',
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Node environment (development, staging, production)',
    defaultValue: 'development',
  },
  {
    name: 'FRONTEND_URL',
    required: false,
    description: 'Frontend application URL for CORS',
    defaultValue: 'http://localhost:5173',
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for email service',
  },
  {
    name: 'FROM_EMAIL',
    required: false,
    description: 'Email address to send emails from',
    defaultValue: 'noreply@treecovery.kz',
  },
  {
    name: 'ACCESS_TOKEN_EXPIRY',
    required: false,
    description: 'Access token expiration time',
    defaultValue: '24h',
  },
  {
    name: 'REFRESH_TOKEN_EXPIRY',
    required: false,
    description: 'Refresh token expiration time',
    defaultValue: '7d',
  },
];

/**
 * Validate environment variables
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar.name]) {
      missing.push(envVar.name);
    }
  }

  // Check optional but recommended variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar.name] && !envVar.defaultValue) {
      warnings.push(envVar.name);
    }
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Log warnings for missing optional variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `Warning: Optional environment variables not set: ${warnings.join(', ')}\n` +
      'Using default values where available.'
    );
  }

  // Validate JWT secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
      throw new Error(
        'JWT_SECRET must be changed from default value in production'
      );
    }
    if (process.env.JWT_REFRESH_SECRET === 'your-refresh-secret-key-change-in-production') {
      throw new Error(
        'JWT_REFRESH_SECRET must be changed from default value in production'
      );
    }
  }
}

/**
 * Get all environment variable definitions (for documentation)
 */
export function getEnvVarDefinitions(): EnvVar[] {
  return [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS];
}

