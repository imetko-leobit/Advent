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
├── auth/              # Authentication providers and config
│   ├── auth-provider.tsx       # Main auth provider (switches between real/mock)
│   ├── dev-auth-provider.tsx   # DEV-only mock auth provider
│   └── config.ts               # OIDC configuration
├── components/        # React components
├── hooks/            # Custom React hooks
│   └── useQuestData.tsx       # Data fetching (supports mock CSV)
├── pages/            # Page components
├── helpers/          # Utility functions
└── consts/           # Constants and types

public/
└── mock-quest-data.csv    # Mock data for local development
```

## Development Notes

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
