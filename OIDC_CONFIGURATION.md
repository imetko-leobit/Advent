# OIDC Configuration Guide

## Overview

This document provides comprehensive information about the OpenID Connect (OIDC) authentication configuration required for the Well Being Quest application. The application uses `react-oidc-context` (v3.0.0) and `oidc-client-ts` (v3.0.0) for authentication.

## Current Issue

The application fails to start authentication with the following error:

```
Oops... No authority or metadataUrl configured on settings
```

This error occurs because required OIDC environment variables are not configured.

## Required OIDC Configuration Parameters

The following configuration parameters are defined in the application:

### 1. **authority** (REQUIRED)
- **Environment Variable:** `VITE_APP_AUTH_AUTHORITY`
- **Type:** String (URL)
- **Purpose:** The base URL of the OIDC/OAuth2 identity provider
- **Used In:** `src/auth/config.ts` (line 5), `src/configUtils.ts` (line 1)
- **Description:** This is the URL of your OIDC provider's discovery endpoint. The OIDC client will append `/.well-known/openid-configuration` to this URL to retrieve provider metadata.
- **Example Values:**
  - Keycloak: `https://keycloak.example.com/realms/your-realm`
  - Auth0: `https://your-tenant.auth0.com`
  - Azure AD: `https://login.microsoftonline.com/{tenant-id}/v2.0`
  - Okta: `https://your-domain.okta.com`
  - Custom OIDC: `https://your-identity-provider.com`

### 2. **redirect_uri** (REQUIRED)
- **Environment Variable:** `VITE_APP_AUTH_REDIRECT_URI`
- **Type:** String (URL)
- **Purpose:** The URL where the identity provider will redirect users after authentication
- **Used In:** `src/auth/config.ts` (line 7, 12), `src/configUtils.ts` (line 4)
- **Description:** This must be the full URL of your application (including protocol, domain, and path). This URL must be registered as an allowed redirect URI in your OIDC provider's client configuration.
- **Format:** `{protocol}://{domain}:{port}{path}`
- **Example Values:**
  - Development: `http://localhost:3000/login`
  - Production: `https://quest.leobit.com/login`
  - Test Environment: `https://quest-test.leobit.com/login`

### 3. **client_id** (HARDCODED)
- **Current Value:** `leobit.quest.web`
- **Location:** `src/auth/config.ts` (line 6)
- **Purpose:** Unique identifier for this application registered with the OIDC provider
- **Status:** Currently hardcoded in the source code
- **Note:** This value must match the client ID configured in your OIDC provider. If your provider uses a different client ID, you must modify the source code or refactor to use an environment variable.

### 4. **scope** (HARDCODED)
- **Current Value:** `"quest openid profile"`
- **Location:** `src/auth/config.ts` (line 8)
- **Purpose:** OAuth2/OIDC scopes requested during authentication
- **Status:** Currently hardcoded in the source code
- **Scopes Explained:**
  - `openid`: Required for OIDC authentication (mandatory)
  - `profile`: Requests access to user profile information (name, email, etc.)
  - `quest`: Custom scope (specific to the application/provider)
- **Note:** The `quest` scope suggests a custom scope configured in the OIDC provider specifically for this application.

### 5. **automaticSilentRenew** (HARDCODED)
- **Current Value:** `true`
- **Location:** `src/auth/config.ts` (line 9)
- **Purpose:** Automatically refresh tokens before they expire using silent iframe renewal
- **Note:** This requires the OIDC provider to support silent renewal and that third-party cookies are not blocked.

### 6. **loadUserInfo** (HARDCODED)
- **Current Value:** `true`
- **Location:** `src/auth/config.ts` (line 10)
- **Purpose:** Automatically fetch user profile information from the OIDC provider's userinfo endpoint after authentication
- **Note:** User profile data is accessed via `user.profile` in the application code.

### 7. **userStore** (HARDCODED)
- **Current Value:** `new WebStorageStateStore({ store: localStorage })`
- **Location:** `src/auth/config.ts` (line 11)
- **Purpose:** Persists authentication state in browser localStorage
- **Note:** This allows the application to maintain authentication across page refreshes.

### 8. **post_logout_redirect_uri** (DERIVED FROM redirect_uri)
- **Current Value:** Same as `redirect_uri`
- **Location:** `src/auth/config.ts` (line 12)
- **Purpose:** The URL where users are redirected after logging out
- **Note:** This URL must also be registered as an allowed post-logout redirect URI in your OIDC provider.

## OIDC Provider Requirements

### Provider Configuration
Your OIDC provider must be configured with the following settings:

1. **Client Configuration:**
   - Client ID: `leobit.quest.web` (or update source code)
   - Client Type: Public (SPA/Browser-based application)
   - Response Type: `code` (Authorization Code Flow with PKCE)
   - Grant Types: `authorization_code`, `refresh_token`

2. **Allowed Redirect URIs:**
   - Must include the exact `redirect_uri` value from your environment
   - Example: `http://localhost:3000/login` for development
   - Example: `https://quest.leobit.com/login` for production

3. **Allowed Post-Logout Redirect URIs:**
   - Same as redirect URIs (since `post_logout_redirect_uri` uses same value)

4. **CORS Configuration:**
   - Your application's origin must be allowed for CORS requests
   - Example origins: `http://localhost:3000`, `https://quest.leobit.com`

5. **Scopes:**
   - `openid` (standard OIDC scope)
   - `profile` (standard OIDC scope)
   - `quest` (custom scope - must be created in your OIDC provider)

6. **Token Claims:**
   - The application expects the following claims in the ID token:
     - `sub`: User's unique identifier (matched against employee ID)
     - `email`: User's email address
   - Additional profile claims are loaded via the userinfo endpoint

### OIDC Provider Discovery
The application relies on OIDC discovery (`.well-known/openid-configuration`). Your provider must expose this endpoint at:
```
{authority}/.well-known/openid-configuration
```

This endpoint must return standard OIDC metadata including:
- `authorization_endpoint`
- `token_endpoint`
- `userinfo_endpoint`
- `end_session_endpoint`
- `jwks_uri`

## Environment Variable Setup

### Development (.env.local)
Create a `.env.local` file in the project root:

```bash
# OIDC Authentication Configuration
VITE_APP_AUTH_AUTHORITY=https://your-oidc-provider.com/realms/your-realm
VITE_APP_AUTH_REDIRECT_URI=http://localhost:3000/login

# Google Sheets Data Source
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/your-sheet-id/export?format=csv
```

### Production
In your CI/CD pipeline or hosting environment, set the following environment variables:

```bash
VITE_APP_AUTH_AUTHORITY=https://your-oidc-provider.com/realms/production-realm
VITE_APP_AUTH_REDIRECT_URI=https://quest.leobit.com/login
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/production-sheet-id/export?format=csv
```

**Important:** The variables must be prefixed with `VITE_` to be accessible in the Vite-built application. Vite only exposes environment variables that start with `VITE_` to the client-side code.

## Code Locations

### Configuration Files
- **Main OIDC Config:** `src/auth/config.ts`
  - Defines all OIDC settings including authority, client_id, scopes, etc.
  - Imports helper functions from `configUtils.ts`

- **Config Utilities:** `src/configUtils.ts`
  - `getAuthority()`: Retrieves `VITE_APP_AUTH_AUTHORITY` from environment
  - `getAuthRedirectUri()`: Retrieves `VITE_APP_AUTH_REDIRECT_URI` from environment

- **Auth Provider:** `src/auth/auth-provider.tsx`
  - Wraps `AuthProvider` from `react-oidc-context`
  - Passes `oidcConfig` as props to the provider

- **Application Entry:** `src/main.tsx`
  - Wraps the entire application with `<AuthProvider>`
  - Initializes OIDC context at app startup

### Authentication Usage
- **Login Page:** `src/pages/login/login.tsx`
  - Calls `signinRedirect()` to initiate OIDC flow
  - Handles return navigation after successful authentication
  - Displays error messages if authentication fails

- **Protected Routes:** `src/components/ProtectedRoute/ProtectedRoute.tsx`
  - Guards routes that require authentication
  - Redirects unauthenticated users to `/login`
  - Displays loading spinner while auth state is being determined

- **Quest Page:** `src/pages/quest/quest.tsx`
  - Uses `useAuth()` hook to access authenticated user
  - Accesses user profile via `user.profile.sub` and `user.profile.email`
  - Filters current user's data from quest participants

### User Identity
The application uses the following logic to identify users:
- **OIDC User ID:** `user.profile.sub` (from OIDC token claims)
- **Email Extraction:** For displaying user data, the app also uses email prefix (part before @) as Leobit user ID
- **Avatar URLs:** Constructed as `https://api.employee.leobit.co/photos-small/{userId}.png`

## Authentication Flow

1. **Application Startup:**
   - User navigates to the application
   - React app initializes with `<AuthProvider>` wrapper
   - OIDC client attempts to load stored auth state from localStorage
   - If no valid auth state exists, user is not authenticated

2. **Unauthenticated Access:**
   - User tries to access `/quest` (protected route)
   - `<ProtectedRoute>` detects user is not authenticated
   - User is redirected to `/login?returnUrl=/quest`

3. **Login Initiation:**
   - Login page automatically calls `signinRedirect()`
   - User is redirected to OIDC provider's authorization endpoint
   - User authenticates with the identity provider

4. **Authentication Callback:**
   - OIDC provider redirects back to `redirect_uri` with authorization code
   - OIDC client exchanges code for tokens (using PKCE)
   - Tokens are stored in localStorage
   - User profile is loaded from userinfo endpoint
   - User is redirected to original destination (`returnUrl` or `/quest`)

5. **Authenticated Session:**
   - User can access protected routes
   - Access token is included in API requests (if needed)
   - Silent token renewal occurs automatically before expiration

6. **Logout:**
   - User initiates logout (not currently implemented in UI)
   - OIDC client clears localStorage
   - User is redirected to OIDC provider's end_session_endpoint
   - User is redirected back to `post_logout_redirect_uri`

## Troubleshooting

### Error: "No authority or metadataUrl configured on settings"
**Cause:** `VITE_APP_AUTH_AUTHORITY` environment variable is not set or empty.

**Solution:**
1. Create a `.env.local` file in the project root
2. Add `VITE_APP_AUTH_AUTHORITY=https://your-oidc-provider.com/realms/your-realm`
3. Restart the development server (`npm run dev`)

### Error: "Invalid redirect_uri"
**Cause:** The `redirect_uri` is not registered in the OIDC provider's client configuration.

**Solution:**
1. Log into your OIDC provider's admin console
2. Navigate to the client configuration for `leobit.quest.web`
3. Add the exact redirect URI to the allowed list (e.g., `http://localhost:3000/login`)
4. Ensure there are no trailing slashes or typos

### Error: CORS errors when authenticating
**Cause:** OIDC provider is not configured to allow requests from your application's origin.

**Solution:**
1. In your OIDC provider, add your application's origin to allowed CORS origins
2. For development: `http://localhost:3000`
3. For production: `https://quest.leobit.com`

### Error: "Invalid scope"
**Cause:** The `quest` scope is not defined in your OIDC provider.

**Solution:**
1. In your OIDC provider, create a custom scope named `quest`
2. Assign this scope to the `leobit.quest.web` client
3. Alternatively, remove `quest` from the scope list in `src/auth/config.ts` if not needed

### Authentication succeeds but user data is missing
**Cause:** User profile claims are not included in the ID token or userinfo endpoint response.

**Solution:**
1. Check that the `profile` scope is requested and granted
2. Ensure your OIDC provider includes `email` claim in user profile
3. Verify `loadUserInfo: true` is set in the config (it is by default)
4. Check browser console for userinfo endpoint errors

### Silent renewal fails (session expires unexpectedly)
**Cause:** Third-party cookies are blocked, or OIDC provider doesn't support silent renewal.

**Solution:**
1. Check browser privacy settings for third-party cookie blocking
2. Ensure OIDC provider supports silent renewal via iframe
3. Consider implementing manual token refresh instead
4. Add proper error handling for renewal failures

## Dependencies on Company Infrastructure

### Leobit-Specific Configuration
The application currently has the following dependencies on Leobit infrastructure:

1. **Client ID:** Hardcoded as `leobit.quest.web`
   - Suggests this is a Leobit-specific OIDC client
   - Cannot be easily reused without modification

2. **Custom Scope:** `quest`
   - Custom scope specific to this application
   - Must be configured in the OIDC provider

3. **User ID Format:** Email prefix extraction (`email.split("@")[0]`)
   - Assumes Leobit email format (e.g., `userid@leobit.co`)
   - Used to construct avatar URLs

4. **Avatar API:** Hardcoded URL pattern
   - `https://api.employee.leobit.co/photos-small/{userId}.png`
   - External dependency on Leobit employee photo service

5. **Data Source:** Google Sheets CSV export
   - Contains employee wellness data
   - Must be maintained externally

### Cannot Be Inferred from Codebase
The following information cannot be determined from the code alone:

1. **OIDC Provider Type:** Unknown (Keycloak, Auth0, Azure AD, Okta, etc.)
2. **Provider URL:** Not specified in code (must be configured via environment variable)
3. **Realm/Tenant:** Not specified in code
4. **Admin Access:** Unknown who has permission to configure the OIDC client
5. **Environment-Specific Settings:** Different settings for dev/test/prod environments
6. **User Provisioning:** How users are added to the OIDC provider
7. **Role/Permission Model:** Whether users have different roles (currently not used in the app)

## Summary of Required Actions

To run the application locally with real OIDC authentication:

1. **Obtain OIDC Configuration from Admin:**
   - OIDC provider authority URL
   - Realm or tenant name
   - Confirmation that client `leobit.quest.web` exists
   - Confirmation that `quest` scope is configured

2. **Register Redirect URIs:**
   - Add `http://localhost:3000/login` to allowed redirect URIs
   - Add `http://localhost:3000/login` to allowed post-logout redirect URIs

3. **Create Environment File:**
   - Create `.env.local` in project root
   - Set `VITE_APP_AUTH_AUTHORITY`
   - Set `VITE_APP_AUTH_REDIRECT_URI=http://localhost:3000/login`
   - Set `VITE_GOOGLE_SHEET_URL` (if needed for testing)

4. **Verify CORS Settings:**
   - Ensure `http://localhost:3000` is allowed in OIDC provider CORS settings

5. **Test Authentication:**
   - Run `npm run dev`
   - Navigate to `http://localhost:3000`
   - Application should redirect to OIDC provider login
   - After authentication, should redirect back to the application

## Example .env.local File

```bash
# ====================================================================================
# OIDC Authentication Configuration
# ====================================================================================
# The base URL of your OIDC identity provider
# This should point to your realm/tenant in the OIDC provider
# The OIDC client will append /.well-known/openid-configuration to discover endpoints
# 
# Examples:
#   Keycloak: https://keycloak.example.com/realms/leobit
#   Auth0: https://leobit.auth0.com
#   Azure AD: https://login.microsoftonline.com/{tenant-id}/v2.0
VITE_APP_AUTH_AUTHORITY=https://your-oidc-provider.com/realms/your-realm

# The full URL where users will be redirected after authentication
# This MUST match exactly what is configured in your OIDC provider's client settings
# For local development, use localhost with the port from vite.config.ts (default: 3000)
# This URL must be registered as an allowed redirect URI in the OIDC client configuration
VITE_APP_AUTH_REDIRECT_URI=http://localhost:3000/login

# ====================================================================================
# Application Data Source
# ====================================================================================
# Google Sheets CSV export URL containing quest data
# The sheet should contain employee email, name, social network points, and task completion data
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
```

## Additional Notes

- **Security:** Never commit `.env.local` or any file containing real credentials to version control
- **CI/CD:** Set environment variables in your CI/CD pipeline (GitLab CI variables, GitHub Secrets, etc.)
- **Deployment:** Environment variables must be set at build time for Vite applications
- **Testing:** For automated tests, consider using a mock OIDC provider or test tokens
- **Documentation:** Keep this document updated if OIDC configuration changes

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-05  
**Analyzed Codebase:** Well Being Quest (Advent App)  
**Created By:** GitHub Copilot OIDC Configuration Analysis
