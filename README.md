# Well Being Quest

A gamified wellness tracking application built with React, TypeScript, and Vite.

## Features

- Interactive quest map showing user progress
- Social authentication via OIDC
- Real-time data from Google Sheets
- Beautiful animations with Framer Motion

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Local Development (DEV Mode)

The application supports local development **without** requiring access to real OIDC authentication or Google Sheets data.

#### Running in DEV Mode

Simply run:

```bash
npm run dev
```

When running in DEV mode **without** environment variables configured:
- ✅ Authentication is **bypassed** - you'll be automatically logged in as `dev@leobit.com`
- ✅ Mock CSV data is loaded from `/public/mock-quest-data.csv`
- ✅ All quest features, animations, and UI work normally
- ✅ No real OIDC provider or Google Sheets access needed

#### Environment Configuration

Create a `.env.local` file in the root directory. Leave it empty or with blank values for DEV mode:

```bash
# Leave these blank for local DEV mode with mock data
VITE_APP_AUTH_AUTHORITY=
VITE_APP_AUTH_REDIRECT_URI=
VITE_GOOGLE_SHEET_URL=
```

**To use real authentication and data** (if you have access):

```bash
VITE_APP_AUTH_AUTHORITY=https://your-oidc-authority.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:3000
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/your-sheet-id/export?format=csv
```

### Production Build

```bash
npm run build
npm run preview
```

**Note:** In production builds (`npm run build`), you **must** provide real OIDC and Google Sheets URLs via environment variables.

## Project Structure

```
src/
├── auth/              # Authentication system (NEW ARCHITECTURE)
│   ├── auth-provider.tsx       # Main auth provider with mode switching
│   ├── dev-auth-provider.tsx   # DEV mode mock auth provider
│   ├── AuthContext.tsx         # Centralized auth state abstraction
│   ├── authConfig.ts           # Auth mode configuration and validation
│   └── config.ts               # OIDC configuration
├── config/            # UI Configuration
│   └── uiConfig.ts             # Central UI configuration for all visual elements
├── services/          # Data service layer
│   ├── QuestDataService.ts     # Main data service implementation
│   ├── questDataServiceFactory.ts  # Service factory with environment detection
│   ├── types.ts                # Service interfaces and types
│   └── index.ts                # Service exports
├── domain/            # Domain layer with business logic
│   ├── FinishScreenService.ts  # Finish screen logic
│   ├── UserProgressService.ts  # User progress mapping
│   ├── TaskEvaluationService.ts # Task evaluation logic
│   └── AvatarService.ts        # Avatar URL generation
├── components/        # React components
├── hooks/            # Custom React hooks
│   └── useQuestData.tsx       # Data fetching hook (uses QuestDataService)
├── pages/            # Page components
├── helpers/          # Utility functions
└── consts/           # Constants and types

public/
└── mock-quest-data.csv    # Mock data for local development
```

## UI Configuration

The application now features **fully configurable UI components**. All visual elements can be customized through a central configuration file without touching component code.

**See [UI_CONFIGURATION.md](./UI_CONFIGURATION.md) for complete documentation.**

### Quick Configuration Guide:

- 🗺️ **Map & Background:** Change SVG map and background images
- 📍 **Task Positions:** Add/remove/reposition tasks dynamically
- ⭐ **Animations:** Configure stars, clouds, and character animations
- 🎯 **Step Markers:** Customize step images and shadows
- 🏆 **Finish Screens:** Replace finish screen images
- 👤 **Avatars/Pointers:** Configure colored pointers and fallback avatars

**Configuration File:** `/src/config/uiConfig.ts`

## Data Service Layer

The application now includes a **service layer** that abstracts data fetching and parsing:

- **QuestDataService**: Handles CSV fetching, parsing, and polling
- **Auto-configured**: Automatically detects DEV/PROD mode
- **Type-safe**: Full TypeScript support with interfaces
- **Extensible**: Easy to add new data sources (REST API, GraphQL, WebSocket)

See [QUEST_DATA_SERVICE.md](./QUEST_DATA_SERVICE.md) for detailed documentation.

### Key Features:
✅ Separation of concerns - components don't handle data fetching  
✅ Environment-based source switching (mock CSV vs Google Sheets)  
✅ Automatic polling every 3 minutes  
✅ Clean abstraction for future enhancements

## Development Notes

### Authentication Architecture

The application features a **robust, dual-mode authentication system** that works reliably in both development and production environments.

**See [AUTHENTICATION.md](./AUTHENTICATION.md) for complete authentication system documentation.**

#### Quick Overview

**Auth Modes:**

1. **DEV Mode** (Development)
   - Always authenticated - no OIDC required
   - Mock user: `dev@leobit.com`
   - No external dependencies
   - Perfect for local development and testing
   - Activated when: `import.meta.env.DEV === true` AND no `VITE_APP_AUTH_AUTHORITY` is set

2. **OIDC Mode** (Production)
   - Real OIDC authentication flow
   - Redirects to external identity provider
   - Requires valid OIDC configuration
   - Activated when: `VITE_APP_AUTH_AUTHORITY` is configured

#### How Routing & Protection Work

The application uses a **centralized authentication abstraction** (`AuthContext`) that provides consistent auth state to all components, regardless of the mode:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authMode: 'dev' | 'oidc';
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Key Components:**

- **`AuthProvider`**: Top-level provider that detects auth mode and sets up appropriate provider (mock or OIDC)
- **`AuthContext`**: Centralized auth state that all components consume via `useAuthContext()` hook
- **`ProtectedRoute`**: Route guard that ensures auth state is resolved before rendering protected content
- **`Login`**: Handles authentication flow for both modes

**Routing Flow:**

1. User navigates to `/quest` (protected route)
2. `ProtectedRoute` checks `isAuthLoading`:
   - If `true`: Shows loading spinner (prevents premature redirects)
   - If `false` and `!isAuthenticated`: Redirects to `/login?returnUrl=/quest`
   - If `false` and `isAuthenticated`: Renders quest page
3. After successful authentication, user is redirected back to original destination

#### Common Redirect Loop Causes & Prevention

The authentication system prevents redirect loops through several mechanisms:

**❌ Common Causes of Redirect Loops:**
1. Redirecting before auth state is fully loaded
2. Multiple components triggering redirects simultaneously
3. Login page redirecting while still in loading state
4. Protected route and login page both triggering redirects

**✅ How We Prevent Them:**

1. **Wait for Auth Resolution**: No redirects happen while `isAuthLoading === true`
   ```typescript
   if (isAuthLoading) return; // Early exit prevents premature redirects
   ```

2. **Single Source of Truth**: All components use `useAuthContext()` instead of directly accessing OIDC hooks

3. **Ref-Based Guards**: Login page uses `useRef` to track if signin was already initiated
   ```typescript
   const hasInitiatedSignin = useRef(false);
   if (!hasInitiatedSignin.current) {
     hasInitiatedSignin.current = true;
     signIn();
   }
   ```

4. **Replace Instead of Push**: Navigation uses `replace: true` to avoid polluting browser history
   ```typescript
   navigate(path, { replace: true });
   ```

5. **Conditional Redirects**: Only redirect when necessary
   ```typescript
   if (!isAuthenticated && currentPath !== PathsEnum.login) {
     navigate(PathsEnum.login);
   }
   ```

#### Configuration Validation

The system validates OIDC configuration at runtime:

- **Valid Config**: App starts normally
- **Invalid Config**: Shows clear error screen with instructions:
  ```
  ⚠️ Authentication Configuration Error
  
  OIDC mode is enabled but required environment variables are missing:
    - VITE_APP_AUTH_AUTHORITY
    - VITE_APP_AUTH_REDIRECT_URI
  
  Please set these values in your .env file or switch to DEV mode...
  ```

This prevents silent failures and makes configuration issues immediately obvious.

### DEV Mode vs Production

The app automatically detects when running in development mode (`import.meta.env.DEV`) and:
1. Uses `MockAuthProvider` if no `VITE_APP_AUTH_AUTHORITY` is set
2. Falls back to `/mock-quest-data.csv` if no `VITE_GOOGLE_SHEET_URL` is set
3. Provides console logs indicating which mode is active

This is **ONLY for local development**. Production builds always require real authentication and data sources.

### Mock Data Format

The mock CSV should follow this structure:

```csv
Email Address,Ім'я та прізвище,Соц мережі відмітки,1. Список справ,2. Пункт зі списку,...
user@leobit.com,User Name,0-3,task_values...
```

**Important:** Social network points (`Соц мережі відмітки`) must be 0-3 (matches colored pointer variants).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies

- React 18
- TypeScript
- Vite
- react-oidc-context (OIDC authentication)
- Framer Motion (animations)
- PapaParse (CSV parsing)
- PrimeReact (UI components)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
