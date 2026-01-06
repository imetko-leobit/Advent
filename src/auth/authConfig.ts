/**
 * Authentication Configuration
 * 
 * Centralizes all authentication configuration and provides runtime validation.
 * Supports two explicit modes:
 * - DEV: Always authenticated, no OIDC required
 * - OIDC: Real OIDC authentication flow
 */

// Cache the DEV mode flag value - read only once
let cachedDevMode: boolean | null = null;

/**
 * Check if DEV mode is enabled.
 * This value is read once and cached for the lifetime of the application.
 * 
 * @returns true if VITE_DEV_MODE=true, false otherwise
 */
export function isDevMode(): boolean {
  if (cachedDevMode === null) {
    cachedDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  }
  return cachedDevMode;
}

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
 * - If VITE_DEV_MODE=true: DEV mode (bypasses authentication)
 * - Otherwise: OIDC mode (real authentication required)
 */
export function getAuthMode(): AuthMode {
  if (isDevMode()) {
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
      `Please set these values in your .env file or switch to DEV mode by setting:\n` +
      `  VITE_DEV_MODE=true\n\n` +
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
  
  // Log auth mode for debugging (DEV mode only)
  if (import.meta.env.DEV) {
    console.log(`[Auth] Mode: ${mode.toUpperCase()}`);
    if (mode === 'dev') {
      console.log('[Auth] Using DEV mode - authentication bypassed');
    } else {
      console.log(`[Auth] Using OIDC mode - authority: ${authority}`);
    }
  }
  
  return config;
}
