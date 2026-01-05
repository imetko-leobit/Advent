/**
 * Authentication Configuration
 * 
 * Centralizes all authentication configuration and provides runtime validation.
 * Supports two explicit modes:
 * - DEV: Always authenticated, no OIDC required
 * - OIDC: Real OIDC authentication flow
 */

export type AuthMode = 'dev' | 'oidc';

export interface AuthConfig {
  mode: AuthMode;
  oidcAuthority?: string;
  oidcRedirectUri?: string;
  oidcClientId: string;
  oidcScope: string;
}

/**
 * Determines the authentication mode based on environment variables.
 * 
 * Logic:
 * - If in development mode AND no OIDC authority configured: DEV mode
 * - Otherwise: OIDC mode
 */
export function getAuthMode(): AuthMode {
  const isDev = import.meta.env.DEV;
  const hasAuthority = !!import.meta.env.VITE_APP_AUTH_AUTHORITY;
  
  if (isDev && !hasAuthority) {
    return 'dev';
  }
  
  return 'oidc';
}

/**
 * Configuration validation error
 */
export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigError';
  }
}

/**
 * Validates OIDC configuration.
 * Throws AuthConfigError if required values are missing in OIDC mode.
 */
function validateOidcConfig(authority?: string, redirectUri?: string): void {
  const missing: string[] = [];
  
  if (!authority) {
    missing.push('VITE_APP_AUTH_AUTHORITY');
  }
  
  if (!redirectUri) {
    missing.push('VITE_APP_AUTH_REDIRECT_URI');
  }
  
  if (missing.length > 0) {
    throw new AuthConfigError(
      `OIDC mode is enabled but required environment variables are missing:\n\n` +
      missing.map(v => `  - ${v}`).join('\n') + '\n\n' +
      `Please set these values in your .env file or switch to DEV mode by:\n` +
      `  1. Running in development mode (npm run dev)\n` +
      `  2. Leaving VITE_APP_AUTH_AUTHORITY empty\n\n` +
      `See README.md for more information.`
    );
  }
}

/**
 * Gets the complete authentication configuration with validation.
 * 
 * @throws {AuthConfigError} If OIDC mode is enabled but required config is missing
 */
export function getAuthConfig(): AuthConfig {
  const mode = getAuthMode();
  const authority = import.meta.env.VITE_APP_AUTH_AUTHORITY;
  const redirectUri = import.meta.env.VITE_APP_AUTH_REDIRECT_URI;
  
  const config: AuthConfig = {
    mode,
    oidcAuthority: authority,
    oidcRedirectUri: redirectUri,
    oidcClientId: 'leobit.quest.web',
    oidcScope: 'quest openid profile',
  };
  
  // Validate OIDC configuration if in OIDC mode
  if (mode === 'oidc') {
    validateOidcConfig(authority, redirectUri);
  }
  
  console.log(`[Auth] Mode: ${mode.toUpperCase()}`);
  if (mode === 'dev') {
    console.log('[Auth] Using DEV mode - authentication bypassed');
  } else {
    console.log(`[Auth] Using OIDC mode - authority: ${authority}`);
  }
  
  return config;
}
