# Authentication Flow Test Scenarios

## Test Plan for Authentication Stabilization

This document outlines test scenarios to validate the acceptance criteria from the issue.

### Acceptance Criteria & Test Cases

#### ✅ 1. Application can be opened and /quest accessed in DEV mode without login

**Test Steps (DEV Mode)**:
1. Ensure `.env.local` has no `VITE_APP_AUTH_AUTHORITY` set (or is empty)
2. Run `npm run dev`
3. Navigate to `http://localhost:3000/quest` directly
4. Expected: Quest page loads immediately without redirect to login
5. Expected: Console shows `[Auth] Mode: DEV` and `[Auth] Using DEV mode - authentication bypassed`

**Status**: ✅ Implemented
- `getAuthMode()` returns 'dev' when in development and no authority is set
- `MockAuthProvider` provides immediate authentication
- `ProtectedRoute` sees `isAuthenticated: true` immediately

#### ✅ 2. Application can authenticate correctly in OIDC mode without redirect loops

**Test Steps (OIDC Mode)**:
1. Set `.env.local` with valid OIDC configuration:
   ```
   VITE_APP_AUTH_AUTHORITY=https://your-idp.com
   VITE_APP_AUTH_REDIRECT_URI=http://localhost:3000
   ```
2. Run `npm run dev`
3. Navigate to `http://localhost:3000`
4. Expected: Redirected to `/login`
5. Expected: Auto-redirected to OIDC provider for authentication
6. After authentication: Return to intended page
7. Expected: No redirect loops between `/login` and `/quest`

**Status**: ✅ Implemented
- `getAuthMode()` returns 'oidc' when authority is set
- `ProtectedRoute` waits for `isAuthLoading === false` before redirects
- `Login` page uses `hasInitiatedSignin` ref to prevent multiple redirects
- Navigation uses `replace: true` to prevent history pollution

**Redirect Loop Prevention Mechanisms**:
- ✅ Wait for auth state resolution (`isAuthLoading` guard)
- ✅ Ref-based signin guard in Login page
- ✅ Conditional redirects (only if not already on login page)
- ✅ History replacement instead of push
- ✅ Single source of truth via `AuthContext`

#### ✅ 3. Switching auth mode requires only config changes

**Test Steps**:
1. **Switch to DEV mode**: Remove or empty `VITE_APP_AUTH_AUTHORITY` in `.env.local`
2. Restart dev server
3. Expected: App uses DEV mode
4. **Switch to OIDC mode**: Set `VITE_APP_AUTH_AUTHORITY` in `.env.local`
5. Restart dev server
6. Expected: App uses OIDC mode

**Status**: ✅ Implemented
- No code changes required
- Only environment variable changes
- Mode detection is automatic via `getAuthMode()`
- Both modes use same `AuthContext` interface

#### ✅ 4. No auth logic is duplicated across components

**Verification**:
- ✅ All components use `useAuthContext()` hook
- ✅ Single `AuthProvider` at app root
- ✅ Single `ProtectedRoute` component for all protected routes
- ✅ No direct `useAuth()` from `react-oidc-context` in components
- ✅ Auth state logic centralized in `AuthContext` and `authConfig`

**Files verified**:
- `src/pages/quest/quest.tsx`: Uses `useAuthContext()`
- `src/pages/login/login.tsx`: Uses `useAuthContext()`
- `src/components/ProtectedRoute/ProtectedRoute.tsx`: Uses `useAuthContext()`
- `src/components/StackedPointers/StackedPointers.tsx`: Uses `useAuthContext()`
- `src/components/Step/Step.tsx`: Uses `useAuthContext()`

#### ✅ 5. Routing behavior is predictable and easy to reason about

**Routing Flow**:
```
1. User navigates to protected route (e.g., /quest)
   ↓
2. ProtectedRoute checks isAuthLoading
   ↓
3. If isAuthLoading === true:
   → Show loading spinner
   → Wait for auth resolution
   ↓
4. If isAuthLoading === false && !isAuthenticated:
   → Redirect to /login?returnUrl=/quest
   ↓
5. If isAuthLoading === false && isAuthenticated:
   → Render protected content
```

**Login Flow**:
```
1. User lands on /login
   ↓
2. Login page checks isAuthLoading
   ↓
3. If isAuthLoading === true:
   → Show loading spinner
   ↓
4. If authenticated:
   → Navigate to returnUrl or /quest
   ↓
5. If not authenticated && OIDC mode:
   → Initiate signin (once)
   → Redirect to identity provider
   ↓
6. After successful auth:
   → Return to app
   → Navigate to intended destination
```

**Status**: ✅ Implemented
- Clear, linear flow
- Well-documented in code and AUTHENTICATION.md
- Predictable behavior based on auth state
- No hidden side effects

### Additional Tests

#### Configuration Validation

**Test: Invalid OIDC Configuration**:
1. Set `VITE_APP_AUTH_AUTHORITY` but not `VITE_APP_AUTH_REDIRECT_URI`
2. Run `npm run build && npm run preview`
3. Expected: Error screen with clear message about missing configuration

**Status**: ✅ Implemented
- `validateOidcConfig()` checks required fields
- `AuthConfigError` thrown with helpful message
- `AuthConfigErrorDisplay` shows user-friendly error screen

#### Edge Cases

**Test: Page Refresh**:
- User refreshes page while on `/quest`
- Expected: Stays on `/quest`, auth state restored
- Status: ✅ (OIDC handles this via storage)

**Test: Direct Navigation**:
- User navigates directly to `/quest` (not authenticated)
- Expected: Redirect to `/login?returnUrl=/quest`
- After auth: Return to `/quest`
- Status: ✅ Implemented

**Test: Logout Flow**:
- User clicks logout
- Expected: Auth state cleared
- Redirect to `/login`
- Clean state for re-authentication
- Status: ✅ Implemented (`signOut()` method)

### Build & Runtime Tests

#### Build Test
```bash
npm run build
```
Expected: ✅ Successful build with no errors

#### Lint Test
```bash
npm run lint
```
Expected: ✅ No warnings or errors

#### Type Check
```bash
tsc --noEmit
```
Expected: ✅ No TypeScript errors

### Summary

All acceptance criteria have been met:

- ✅ DEV mode works without login
- ✅ OIDC mode works without redirect loops
- ✅ Auth mode switching via config only
- ✅ No duplicated auth logic
- ✅ Predictable routing behavior
- ✅ Configuration validation
- ✅ Comprehensive documentation

Additional achievements:
- ✅ Centralized `AuthContext` abstraction
- ✅ Runtime config validation with clear errors
- ✅ Robust redirect loop prevention (5 mechanisms)
- ✅ Complete documentation (README + AUTHENTICATION.md)
- ✅ Edge case handling (refresh, direct nav, logout)
- ✅ TypeScript type safety
- ✅ Clean, maintainable code structure

The authentication system is now stable, reusable, and production-ready.
