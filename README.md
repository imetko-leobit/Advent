# Well Being Quest (Advent App)

An interactive gamified wellness tracking application designed to encourage employees to complete wellness tasks and track their progress on a visual quest map.

## Quick Start

### Prerequisites
- Node.js 19+ (as specified in `.gitlab-ci.yml`)
- npm or yarn package manager
- Access to an OIDC identity provider
- Google Sheets with quest data (see `OIDC_CONFIGURATION.md` for schema)

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   **Required variables:**
   - `VITE_APP_AUTH_AUTHORITY` - Your OIDC provider URL
   - `VITE_APP_AUTH_REDIRECT_URI` - Callback URL (e.g., `http://localhost:3000/login`)
   - `VITE_GOOGLE_SHEET_URL` - Google Sheets CSV export URL
   
   See [`.env.example`](.env.example) for detailed descriptions and examples.

3. **Configure OIDC Provider**
   
   Before running the application, you must configure your OIDC provider:
   - Register the client ID: `leobit.quest.web`
   - Add allowed redirect URIs (e.g., `http://localhost:3000/login`)
   - Configure the `quest` scope (custom scope required by the application)
   - Enable PKCE (Proof Key for Code Exchange)
   
   For complete OIDC setup instructions, see **[OIDC_CONFIGURATION.md](OIDC_CONFIGURATION.md)**

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The application will start at `http://localhost:3000` (configurable in `vite.config.ts`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## Authentication

This application uses **OpenID Connect (OIDC)** for authentication via `react-oidc-context` and `oidc-client-ts`.

### Common Authentication Issues

**Error: "No authority or metadataUrl configured on settings"**
- Cause: `VITE_APP_AUTH_AUTHORITY` is not set in your `.env.local` file
- Solution: Set the environment variable and restart the dev server

**Error: "Invalid redirect_uri"**
- Cause: The redirect URI is not registered in your OIDC provider
- Solution: Add the exact URL to your OIDC provider's allowed redirect URIs

For comprehensive troubleshooting, see **[OIDC_CONFIGURATION.md](OIDC_CONFIGURATION.md)**

## Documentation

- **[OIDC_CONFIGURATION.md](OIDC_CONFIGURATION.md)** - Complete OIDC authentication setup guide
- **[CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md)** - High-level application architecture and analysis
- **[TECHNICAL_ASSESSMENT.md](TECHNICAL_ASSESSMENT.md)** - Detailed technical review and recommendations
- **[.env.example](.env.example)** - Environment variable configuration template

## Technology Stack

- **Framework:** React 18.2 with TypeScript 5.2
- **Build Tool:** Vite 5.0
- **Authentication:** OIDC (react-oidc-context 3.0, oidc-client-ts 3.0)
- **UI Components:** PrimeReact 10.3
- **Animations:** Framer Motion 11.0
- **Routing:** React Router DOM 6.22
- **Data Processing:** PapaParse 5.4 (CSV parsing)

## Project Structure

```
src/
├── auth/              # OIDC authentication configuration
├── components/        # Reusable React components
├── pages/             # Page-level components (Login, Quest)
├── router/            # React Router configuration
├── hooks/             # Custom React hooks
├── context/           # React Context providers
├── helpers/           # Utility functions and data mappers
├── consts/            # Constants, enums, types
└── assets/            # Static assets (SVG, images)
```

## Vite + React + TypeScript

This project uses Vite for fast development and optimized production builds.

Currently, two official Vite plugins are available for React:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

This project uses `@vitejs/plugin-react`.

## Expanding the ESLint Configuration

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
