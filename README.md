# Well Being Quest

A gamified wellness tracking application that helps teams visualize and celebrate their wellness journey together. Built with modern web technologies and designed for maximum reusability and configurability.

## 📖 Table of Contents

- [What is Well Being Quest?](#what-is-well-being-quest)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Authentication Modes](#authentication-modes)
- [Data Layer & Sources](#data-layer--sources)
- [Dynamic Configuration & Data Switching](#dynamic-configuration--data-switching)
- [Quest Logic & Progression](#quest-logic--progression)
- [UI Customization](#ui-customization)
- [Project Structure](#project-structure)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Advanced Topics](#advanced-topics)

---

## What is Well Being Quest?

**Well Being Quest** is an interactive wellness tracking application that transforms daily wellness activities into an engaging quest journey. Users complete wellness tasks (like creating to-do lists, taking walks, practicing gratitude) and their progress is visualized on an animated quest map.

### Key Features

- 🗺️ **Interactive Quest Map** - Visual representation of user progress with animated characters
- 🎯 **Gamified Progress** - Track wellness activities as quest milestones
- 👥 **Social Competition** - See where teammates are on their wellness journey
- 🎨 **Fully Configurable UI** - Replace maps, assets, and animations without code changes
- 🔐 **Flexible Authentication** - Works with or without OIDC (perfect for local development)
- 📊 **Multiple Data Sources** - Supports Google Sheets, mock data, or custom APIs

### Design Goals

After recent refactoring, the application is built with these principles:

✅ **Reusability** - Components and logic can be reused for different quests or brands  
✅ **Configurability** - UI elements, maps, and assets are configurable via central config  
✅ **DEV/PROD Separation** - Works seamlessly in development without external dependencies  
✅ **No Infrastructure Lock-in** - No hard dependency on any specific company's infrastructure  
✅ **Clean Architecture** - Domain logic separated from UI, services abstracted from components

---

## Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **No OIDC provider needed** for local development
- **No Google Sheets access needed** for local development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Advent

# Install dependencies
npm install
```

### Running Locally (DEV Mode)

The easiest way to get started - **no configuration needed**:

```bash
npm run dev
```

That's it! Open your browser to `http://localhost:5173` and you'll see:

✅ **Auto-authentication** - You're logged in as `dev@leobit.com`  
✅ **Mock data loaded** - Sample users and progress from `/public/mock-quest-data.csv`  
✅ **Full functionality** - All animations, quest logic, and UI features work  
✅ **No external services** - Everything runs locally

### Running with Real Authentication & Data

If you have access to OIDC and Google Sheets:

1. Create `.env.local` file:

```bash
VITE_APP_AUTH_AUTHORITY=https://your-oidc-authority.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
```

2. Run the application:

```bash
npm run dev
```

The app will automatically detect the configuration and use real OIDC authentication and Google Sheets data.

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

**⚠️ Note:** Production builds require real authentication and data source configuration.

---

## Environment Configuration

The application uses environment variables for configuration. All variables are optional in DEV mode.

### Environment Variables Reference

| Variable | Required | Default (DEV) | Description |
|----------|----------|---------------|-------------|
| `VITE_APP_AUTH_AUTHORITY` | Production only | `undefined` | OIDC authority URL (e.g., `https://auth.example.com`) |
| `VITE_APP_AUTH_REDIRECT_URI` | Production only | `undefined` | OAuth redirect URI (e.g., `http://localhost:5173`) |
| `VITE_GOOGLE_SHEET_URL` | Production only | `/mock-quest-data.csv` | Google Sheets CSV export URL |

### Configuration Modes

#### 1. DEV Mode (No Configuration)

Leave `.env.local` empty or don't create it at all:

```bash
# .env.local - can be empty or omitted entirely
```

**Result:**
- Authentication bypassed (auto-login as `dev@leobit.com`)
- Mock CSV data loaded from `/public/mock-quest-data.csv`
- Perfect for development, testing, and demos

#### 2. DEV Mode with Real Data

Use real authentication but keep everything else local:

```bash
# .env.local
VITE_APP_AUTH_AUTHORITY=https://your-oidc.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
# Leave VITE_GOOGLE_SHEET_URL empty to use mock data
```

#### 3. Production Mode

All variables must be set:

```bash
# .env.production
VITE_APP_AUTH_AUTHORITY=https://your-oidc.com
VITE_APP_AUTH_REDIRECT_URI=https://your-domain.com
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET/export?format=csv
```

### Example .env.local Files

**Minimal (for local development):**
```bash
# Nothing needed! Just run npm run dev
```

**With OIDC (for testing authentication):**
```bash
VITE_APP_AUTH_AUTHORITY=https://dev.auth.example.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
```

**Full configuration (production-like):**
```bash
VITE_APP_AUTH_AUTHORITY=https://auth.example.com
VITE_APP_AUTH_REDIRECT_URI=https://wellbeing.example.com
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/1ABC.../export?format=csv
```

---

## Authentication Modes

The application features a **dual-mode authentication system** that works reliably in both development and production.

### DEV Mode Authentication

**When it activates:**
- Running with `npm run dev` (Vite development mode)
- AND `VITE_APP_AUTH_AUTHORITY` is not set

**How it works:**
- Automatically logs you in as `dev@leobit.com`
- No redirects, no external auth provider needed
- User state immediately available
- Same interface as OIDC mode (components don't know the difference)

**Perfect for:**
- Local development
- Testing UI changes
- Demo presentations
- Running without internet

### OIDC Mode Authentication

**When it activates:**
- When `VITE_APP_AUTH_AUTHORITY` is configured

**How it works:**
- Full OAuth 2.0 / OIDC authentication flow
- Redirects to external identity provider
- Secure token-based authentication
- Session management with refresh tokens

**Required for:**
- Production deployments
- Real user authentication
- Access to protected resources

### How to Switch Between Modes

Simply set or unset the `VITE_APP_AUTH_AUTHORITY` variable:

**Enable DEV Mode:**
```bash
# Remove or comment out the authority
# VITE_APP_AUTH_AUTHORITY=
```

**Enable OIDC Mode:**
```bash
VITE_APP_AUTH_AUTHORITY=https://your-oidc.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
```

Restart your dev server after changing `.env.local`.

### Authentication Flow

**DEV Mode Flow:**
```
1. App loads
2. MockAuthProvider activates
3. User immediately authenticated as dev@leobit.com
4. Quest page renders
```

**OIDC Mode Flow:**
```
1. App loads
2. User not authenticated → redirect to /login
3. Login initiates OIDC flow
4. Redirect to identity provider
5. User authenticates
6. Redirect back to app with tokens
7. Quest page renders
```

### Configuration Validation

The app validates authentication configuration on startup:

**Valid configuration:**
- App starts normally

**Invalid configuration:**
- OIDC mode enabled but missing required variables
- Shows error screen with clear instructions
- Prevents silent failures

**Error Example:**
```
⚠️ Authentication Configuration Error

OIDC mode is enabled but required environment variables are missing:
  • VITE_APP_AUTH_AUTHORITY
  • VITE_APP_AUTH_REDIRECT_URI

Please set these in your .env.local file or remove VITE_APP_AUTH_AUTHORITY
to use DEV mode with mock authentication.
```

---

## Data Layer & Sources

The application uses a **service layer architecture** that abstracts data fetching from UI components.

### Architecture Overview

```
┌─────────────────────┐
│   React Components  │
│   (Quest.tsx, etc.) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   useQuestData Hook │  ← React hook for data access
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ QuestDataService    │  ← Service layer (abstraction)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Data Sources      │
│ • Mock CSV          │
│ • Google Sheets     │
│ • Future: REST API  │
└─────────────────────┘
```

### Supported Data Sources

#### 1. Mock CSV (Development)

**Location:** `/public/mock-quest-data.csv`

**When used:**
- DEV mode when `VITE_GOOGLE_SHEET_URL` is not set
- Automatic fallback for local development

**Advantages:**
- No external dependencies
- Fast and reliable
- Easy to modify for testing
- Perfect for development

#### 2. Google Sheets (Production)

**Configuration:**
```bash
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv
```

**When used:**
- When `VITE_GOOGLE_SHEET_URL` is configured
- Recommended for production

**Advantages:**
- Non-technical users can update data
- Real-time updates via polling
- No database setup needed

#### 3. API Provider (New!)

**Configuration:**
```bash
# Use via runtime switching or custom provider
# See Dynamic Configuration section below
```

**When used:**
- Via runtime data source switching
- When custom API endpoint is needed
- For advanced integration scenarios

**Advantages:**
- Full control over data format and authentication
- Real-time updates via API polling
- Can integrate with existing backend systems
- Supports custom headers for authentication

**Expected API Response:**
```json
[
  {
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://example.com/avatar.jpg",
    "taskNumber": 5
  }
]
```

#### 4. Future Extensions

The service layer is designed to support additional data sources:
- GraphQL endpoints
- WebSocket for real-time updates
- Local storage / IndexedDB
- Custom database connections

### Data Polling Behavior

The application automatically polls for data updates:

**Default interval:** 3 minutes (180,000ms)

**Polling process:**
1. Initial fetch when component mounts
2. Automatic refetch every 3 minutes
3. Data updates trigger UI re-render
4. Polling stops when component unmounts

**Configuration:**
```typescript
// In src/services/questDataServiceFactory.ts
const DEFAULT_POLLING_INTERVAL = 180000; // 3 minutes
```

### Expected Data Schema

The CSV data must follow this structure:

**Required columns:**
- `Email Address` - User email (must contain @)
- `Ім'я та прізвище` - User's full name
- `Соц мережі відмітки` - Social network points (0-3)

**Task columns:**
- `1. Список справ` - First task
- `2. Пункт зі списку` - Second task
- `3. Прогулянка на свіжому повітрі` - Third task
- ... (add more tasks as needed)

**Example CSV:**
```csv
Email Address,Ім'я та прізвище,Соц мережі відмітки,1. Список справ,2. Пункт зі списку,3. Прогулянка на свіжому повітрі
dev@leobit.com,Dev User,3,1,1,1
alice@example.com,Alice Cooper,2,1,1,
bob@example.com,Bob Smith,1,1,,
```

**Data validation:**
- Rows without valid email addresses are filtered out
- Empty task cells (null values) indicate incomplete tasks
- Social network points must be 0-3 (determines pointer color)

### Adding a New Data Source

To add a new data source (e.g., REST API):

1. Update `DataSourceType` enum in `/src/services/types.ts`
2. Add new configuration in `QuestDataService.ts`
3. Implement fetch logic in `fetchData()` method
4. Update factory in `questDataServiceFactory.ts`

---

## Dynamic Configuration & Data Switching

The application now supports **dynamic configuration loading** and **runtime data source switching**, enabling you to:

- Load different quest configurations without code changes
- Switch map images and UI assets on the fly
- Change data sources at runtime (Mock CSV ↔ Google Sheets ↔ API)
- Test different configurations without rebuilding

### Dynamic Quest Configuration

Load custom quest configurations from JSON files or JavaScript objects:

**Example: Loading from JSON**
```typescript
import { useConfig } from './context/ConfigContext';

const { loadQuestConfigFromJSON } = useConfig();

// Load a custom quest configuration
await loadQuestConfigFromJSON('/custom-quest-config.json');
```

**Example: Loading from Object**
```typescript
const customConfig = {
  name: "Summer Wellness Challenge",
  taskCount: 12,
  // ... partial configuration
};

loadQuestConfigFromObject(customConfig);
```

**Configuration Format:**
```json
{
  "name": "My Custom Quest",
  "taskCount": 10,
  "tasks": [
    { "id": 0, "label": "Start", "type": "core" },
    { "id": 1, "label": "First Task", "type": "core" }
  ],
  "finalTaskIds": [8, 9],
  "firstFinishTaskId": 8,
  "finalFinishTaskId": 9
}
```

Only specify fields you want to override - missing fields use defaults.

### Runtime Data Source Switching

Switch between different data sources without restarting the app:

```typescript
import { useDataSource } from './hooks/useDataSource';

const { switchDataSource } = useDataSource();

// Switch to Mock CSV
await switchDataSource({
  type: DataSourceType.MOCK_CSV,
  url: '/mock-quest-data.csv',
});

// Switch to Google Sheets
await switchDataSource({
  type: DataSourceType.GOOGLE_SHEETS,
  url: 'https://docs.google.com/.../export?format=csv',
});

// Switch to API
await switchDataSource({
  type: DataSourceType.API,
  url: 'https://api.example.com/quest-data',
  headers: { 'Authorization': 'Bearer TOKEN' },
});
```

### Supported Data Sources

**1. Mock CSV** - Local CSV file for development/testing
**2. Google Sheets** - Google Sheets CSV export (production)
**3. API** - REST API endpoint returning JSON

The API provider expects this response format:
```json
[
  {
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://example.com/avatar.jpg",
    "taskNumber": 5
  }
]
```

### Configuration Validation & Fallback

All configurations are automatically validated:

- Invalid configurations fall back to defaults
- Errors are logged with detailed messages
- Application continues running in DEV mode
- User-friendly error messages displayed

### Interactive Demo

The application includes a built-in demo component to test these features:

1. Import `ConfigDemo` component in your page
2. Click "🎮 Show Config Demo" button
3. Try loading configurations and switching data sources
4. View real-time state updates and error handling

**See full documentation:** [`/docs/DYNAMIC_CONFIGURATION.md`](/docs/DYNAMIC_CONFIGURATION.md)

---

## Quest Logic & Progression

This section explains **how the quest works conceptually** - the rules and logic behind user progression, without diving into code.

### How Users Progress

1. **Starting Point** - All users begin at position 0 (the start)
2. **Complete Tasks** - Users complete wellness tasks (tracked in spreadsheet/data source)
3. **Move Forward** - Each completed task moves the user one position forward on the map
4. **Visual Representation** - User's avatar/pointer shows their current position
5. **Reach Finish** - Special screens appear at milestone positions

### Task Completion Rules

**Task counting:**
- Each task column in the data represents one quest step
- Any non-null value in a task column = task completed
- Null/empty value = task not yet completed

**Position calculation:**
- Count all completed tasks (non-null task columns)
- User's position = number of completed tasks
- Position determines where user appears on the map

**Example:**
```
User: alice@example.com
Tasks: [✓, ✓, ✓, -, -]  (3 completed, 2 incomplete)
Position: 3  (appears at task position 3 on map)
```

### User Positioning on Map

**Visual representation:**
- Each task position on the map has coordinates (configured in `uiConfig.ts`)
- Users are grouped by position - all users at position 5 appear together
- User pointers are colored based on social network points (0=red, 1=yellow, 2=cyan, 3=green, etc.)

**Pointer colors:**
The "Social network points" (Соц мережі відмітки) column determines pointer color:
- 0 = Red pointers
- 1 = Yellow pointers
- 2 = Cyan pointers
- 3 = Green pointers

Each color has multiple variants to distinguish users at the same position.

### Special Tasks & Finish States

The quest has **special milestone tasks** that trigger finish screens:

**Task 9 (First Finish):**
- Shows a "finish" screen for the logged-in user
- Celebrates reaching the halfway point
- Other users continue normally

**Task 14 (Final Finish):**
- Shows a "dzen" (zen/meditation) screen
- Indicates quest completion
- Special celebration for completing all tasks

**Logged User Separation:**
- At special tasks (9 and 14), the logged-in user is shown separately
- Creates a personalized experience
- Highlights the user's achievement

### Finish Screen Logic

**When finish screens appear:**
1. User must be logged in (not other users)
2. User must be at a special task position (9 or 14)
3. Appropriate finish screen is displayed based on position

**Screen types:**
- **"finish"** - Position 9-13 (you've reached the finish line!)
- **"dzen"** - Position 14 (final completion, zen state)

### Task Validation

**Valid tasks:**
- Must have a column in the data starting with a number (e.g., "1. Task Name")
- Columns are sorted numerically
- Any non-null value counts as completion

**Ignored data:**
- Rows without valid email addresses
- Columns not matching task pattern
- Metadata columns (name, social points, etc.)

---

## UI Customization

One of the key features after refactoring is **full UI configurability**. You can completely rebrand the application without touching component code.

### Central Configuration File

**Location:** `/src/config/uiConfig.ts`

This single file contains all UI configuration:
- Map SVG and background
- Task positions and coordinates
- Step marker images
- Animation elements (stars, clouds, character)
- Finish screen assets
- Pointer/avatar configurations

### What You Can Customize

#### 🗺️ Map & Background

Replace the quest map with your own SVG:

```typescript
// Import your new map
import MyCustomMap from "../assets/map/MyMap.svg";

// Update configuration
map: {
  background: QuestBackground,  // Background image
  mapSvg: MyCustomMap,           // Your custom map
}
```

#### 📍 Task Positions

Add, remove, or reposition tasks on the map:

```typescript
taskPositions: [
  {
    taskTitle: tasksEnum.initialPosition,
    taskNumber: 0,
    cxPointers: 15.8,   // X coordinate (%) for user pointers
    cyPointers: 21,     // Y coordinate (%) for user pointers
    cxStep: 16.5,       // X coordinate (%) for step marker
    cyStep: 32.5,       // Y coordinate (%) for step marker
  },
  // Add more task positions...
]
```

**Coordinates are percentages** (0-100) relative to the map SVG dimensions.

#### 🎯 Step Markers

Customize the step number images:

```typescript
steps: {
  images: [
    zeroStep,     // Step 0 image
    firstStep,    // Step 1 image
    secondStep,   // Step 2 image
    // ... add more steps
  ],
  shadow: {
    green: GreenStepShadow,      // Shadow for early steps
    purple: PurpleStepShadow,    // Shadow for later steps
    greenThreshold: 10,          // Tasks 0-9 use green, 10+ use purple
  },
}
```

#### ⭐ Animations

Configure stars, clouds, and character animations:

```typescript
animations: {
  stars: [
    { top: "80%", left: "60%", height: "3%", width: "3%", duration: 1.2 },
    { top: "15%", left: "85%", height: "2%", width: "2%", duration: 1.5 },
    // Add more stars...
  ],
  clouds: [
    { 
      top: "25%", left: "70%", height: "5%", width: "5%", 
      duration: 5, translateFrom: "-40%", translateTo: "20%" 
    },
    // Add more clouds...
  ],
  character: {
    image: GirlSvg,
    shadow: Shadow,
    position: { left: "79.3%", bottom: "24.9%" },
    // ... animation settings
  },
}
```

#### 🏆 Finish Screens

Replace finish screen images:

```typescript
finishScreens: {
  finish: FinishScreenSVG,   // Shown at position 9
  dzen: DzenScreenSVG,       // Shown at position 14
}
```

#### 👤 Pointers & Avatars

Configure colored pointers for different social network point levels:

```typescript
pointers: {
  colored: [
    // Social network point level 0
    [zero_red, zero_yellow, zero_cyan, zero_green, zero_orange, zero_purple],
    // Social network point level 1
    [one_red, one_yellow, one_cyan, one_green, one_orange, one_purple],
    // ... more levels
  ],
}
```

### How to Make Changes

**Step 1: Add Your Assets**
Place new images/SVGs in `/src/assets/` directory:
- Maps → `/src/assets/map/`
- Steps → `/src/assets/steps/`
- Animations → `/src/assets/star/`, `/src/assets/clouds/`, etc.

**Step 2: Import Assets**
At the top of `/src/config/uiConfig.ts`:
```typescript
import MyNewAsset from "../assets/folder/MyNewAsset.svg";
```

**Step 3: Update Configuration**
Change the config to use your new asset:
```typescript
map: {
  mapSvg: MyNewAsset,  // Updated
}
```

**Step 4: Test Changes**
```bash
npm run dev
```

Changes are hot-reloaded immediately!

### Reusing for Different Quests

To rebrand for a different quest or organization:

1. **Replace visual assets** - Map, steps, animations, finish screens
2. **Update task positions** - Adjust coordinates for new map layout
3. **Modify task names** - Update `tasksEnum` in `/src/consts/enums.ts`
4. **Update data schema** - Change CSV column headers to match new tasks
5. **Replace colors** - Update pointer colors if needed

**No component code changes required!**

### Advanced Customization

For more advanced UI customization, see:
- **Full UI Configuration Guide:** `/docs/UI_CONFIGURATION.md`
- **Task configuration:** `/src/consts/enums.ts`
- **Color schemes:** `/src/consts/colors.ts`

---

## Project Structure

Understanding the project structure helps you navigate and extend the application.

### High-Level Directory Structure

```
Advent/
├── public/                  # Static assets
│   └── mock-quest-data.csv  # Mock data for development
├── src/
│   ├── auth/               # Authentication system
│   ├── config/             # UI configuration
│   ├── domain/             # Business logic (framework-independent)
│   ├── services/           # Data service layer
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── assets/             # Images, SVGs, icons
│   ├── consts/             # Constants and enums
│   ├── helpers/            # Utility functions
│   └── router/             # React Router configuration
└── docs/                    # Technical documentation
```

### Directory Responsibilities

#### `/src/auth/` - Authentication System

**Purpose:** Handle user authentication in both DEV and OIDC modes

**Key files:**
- `AuthContext.tsx` - Centralized auth state abstraction
- `auth-provider.tsx` - Top-level provider with mode detection
- `dev-auth-provider.tsx` - Mock authentication for DEV mode
- `authConfig.ts` - Configuration validation and mode detection
- `config.ts` - OIDC configuration

**When to modify:**
- Adding new authentication providers
- Changing auth flow behavior
- Adding auth-related features

#### `/src/config/` - UI Configuration

**Purpose:** Central configuration for all UI elements

**Key files:**
- `uiConfig.ts` - Main UI configuration (maps, positions, animations, assets)

**When to modify:**
- Changing visual assets
- Repositioning tasks
- Adding/removing animation elements
- Rebranding the application

#### `/src/domain/` - Business Logic Layer

**Purpose:** Core quest logic, independent of React and UI

**Key files:**
- `TaskEvaluationService.ts` - Task completion and position calculation
- `UserProgressService.ts` - User positioning and grouping
- `FinishScreenService.ts` - Finish screen logic and special tasks
- `AvatarService.ts` - Avatar URL generation
- `interfaces.ts` - Domain type definitions

**When to modify:**
- Changing quest progression rules
- Adding new task evaluation logic
- Modifying finish screen behavior
- Updating business rules

**Design principle:** Domain layer has **no dependencies** on React, OIDC, or UI frameworks

#### `/src/services/` - Data Service Layer

**Purpose:** Abstract data fetching from components

**Key files:**
- `QuestDataService.ts` - Main data service implementation
- `questDataServiceFactory.ts` - Factory with auto-configuration
- `types.ts` - Service interfaces and types

**When to modify:**
- Adding new data sources
- Changing polling behavior
- Modifying data transformation logic

#### `/src/components/` - React Components

**Purpose:** Reusable UI components

**Structure:**
- Each component in its own directory
- Colocated styles and logic
- Props-based configuration

**When to modify:**
- Adding new UI components
- Updating component behavior
- Styling changes

#### `/src/pages/` - Page Components

**Purpose:** Top-level route pages

**Key pages:**
- `Quest.tsx` - Main quest map page
- `Login.tsx` - Authentication page

**When to modify:**
- Adding new pages/routes
- Changing page-level logic

#### `/src/hooks/` - Custom React Hooks

**Purpose:** Reusable React logic

**Key hooks:**
- `useQuestData.tsx` - Data fetching with polling
- Other custom hooks for shared logic

**When to modify:**
- Adding new shared React logic
- Creating reusable state management

#### `/src/assets/` - Visual Assets

**Purpose:** Images, SVGs, icons, and other static assets

**Structure:**
- `/map/` - Map SVGs
- `/steps/` - Step number images
- `/pointers/` - Colored pointer variants
- `/finish-screens/` - Finish screen images
- `/star/`, `/clouds/` - Animation assets

**When to modify:**
- Replacing visual assets
- Adding new images/icons

#### `/src/consts/` - Constants & Enums

**Purpose:** Application-wide constants and type definitions

**Key files:**
- `enums.ts` - Task names, user data keys, finish types
- `interfaces.ts` - TypeScript interfaces
- `colors.ts` - Color definitions

**When to modify:**
- Adding new task types
- Updating data structure
- Defining new constants

### Module Dependencies

**Dependency flow (simplified):**
```
Components → Hooks → Services → External APIs
     ↓
  Domain Layer (independent)
```

**Key principles:**
- Components don't directly fetch data (use hooks)
- Hooks use services (not direct API calls)
- Domain layer has no UI dependencies
- Services can be swapped without changing components

---

## Common Issues & Troubleshooting

### Authentication Issues

#### Issue: Redirect Loop After Login

**Symptoms:**
- Browser keeps redirecting between `/login` and `/quest`
- Infinite redirect cycle
- Console errors about navigation

**Causes:**
- Auth state not fully loaded before redirecting
- Multiple components triggering redirects simultaneously

**Solutions:**

1. **Check environment variables:**
   ```bash
   # Make sure both are set or both are empty
   VITE_APP_AUTH_AUTHORITY=https://your-oidc.com
   VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
   ```

2. **Clear browser storage:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

**Prevention:**
The current architecture prevents redirect loops by:
- Waiting for auth state resolution before redirecting
- Using ref guards to prevent duplicate sign-in attempts
- Using `replace: true` for navigation

#### Issue: "No Authority or MetadataUrl Configured"

**Symptoms:**
- Error screen on app startup
- Message about missing OIDC configuration

**Cause:**
OIDC mode is partially configured (only authority set, not redirect URI, or vice versa)

**Solution:**

**Option 1: Use DEV mode (recommended for development)**
```bash
# .env.local - remove or comment out
# VITE_APP_AUTH_AUTHORITY=
# VITE_APP_AUTH_REDIRECT_URI=
```

**Option 2: Complete OIDC configuration**
```bash
# .env.local - set BOTH variables
VITE_APP_AUTH_AUTHORITY=https://your-oidc.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
```

Restart dev server after changing `.env.local`.

### Data & Map Issues

#### Issue: Empty Map or No Users Visible

**Symptoms:**
- Map renders but no user pointers appear
- No avatars or progress indicators

**Possible causes:**

1. **No data loaded:**
   - Check browser console for fetch errors
   - Verify `/public/mock-quest-data.csv` exists
   - Check `VITE_GOOGLE_SHEET_URL` is correct

2. **Invalid data format:**
   - Email addresses must contain `@`
   - CSV must have required columns
   - Task columns must start with numbers

**Solutions:**

1. **Verify mock data exists:**
   ```bash
   ls public/mock-quest-data.csv
   ```

2. **Check browser console:**
   - Look for `[QuestDataService]` logs
   - Check for CSV parsing errors

3. **Validate CSV format:**
   ```csv
   Email Address,Ім'я та прізвище,Соц мережі відмітки,1. Список справ
   test@example.com,Test User,0,1
   ```

4. **Test with simple data:**
   - Replace CSV with minimal example
   - Add one user with one completed task
   - Verify it appears on map

#### Issue: Broken Avatars or Missing Assets

**Symptoms:**
- Missing step numbers
- No pointer images
- Broken map background

**Causes:**
- Asset import errors
- Wrong file paths in `uiConfig.ts`
- Missing asset files

**Solutions:**

1. **Check asset imports in `/src/config/uiConfig.ts`:**
   ```typescript
   // Verify imports resolve correctly
   import MapSvg from "../assets/map/Map.svg";
   ```

2. **Verify asset files exist:**
   ```bash
   ls src/assets/map/
   ls src/assets/steps/
   ls src/assets/pointers/
   ```

3. **Check browser console for 404 errors**

4. **Rebuild application:**
   ```bash
   npm run dev
   ```

### Build & Performance Issues

#### Issue: Build Fails

**Symptoms:**
- `npm run build` fails with TypeScript errors
- Build process stops with errors

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Fix type errors** in reported files

3. **Clean and rebuild:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

#### Issue: Slow Development Server

**Symptoms:**
- Page loads slowly
- Hot reload is slow

**Solutions:**

1. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Check data polling interval:**
   - Default is 3 minutes
   - Reduce for development if needed (in `questDataServiceFactory.ts`)

### Data Polling Issues

#### Issue: Data Not Updating

**Symptoms:**
- User progress doesn't update
- Changes in Google Sheets not reflected

**Causes:**
- Polling not started
- Fetch errors
- CORS issues with Google Sheets

**Solutions:**

1. **Check polling is active:**
   - Browser console should show periodic fetch logs
   - Look for `[QuestDataService]` messages

2. **Verify Google Sheets URL:**
   ```bash
   # Must end with /export?format=csv
   VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv
   ```

3. **Check CORS configuration:**
   - Google Sheets must be publicly accessible
   - Or properly configured for CORS

4. **Test URL directly:**
   - Open `VITE_GOOGLE_SHEET_URL` in browser
   - Should download CSV file

### Environment Variable Issues

#### Issue: Environment Variables Not Working

**Symptoms:**
- Changes to `.env.local` have no effect
- Variables show as undefined

**Solutions:**

1. **Restart dev server** (required after changing `.env.local`):
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

2. **Verify variable names** start with `VITE_`:
   ```bash
   # ✅ Correct
   VITE_APP_AUTH_AUTHORITY=...
   
   # ❌ Wrong - won't work
   APP_AUTH_AUTHORITY=...
   ```

3. **Check file name** is exactly `.env.local` (not `.env` or `.env.development`)

4. **Verify file location** is in project root (same level as `package.json`)

---

## Advanced Topics

For detailed technical documentation, see the `/docs` folder:

### Detailed Documentation

- **[Authentication System](/docs/AUTHENTICATION.md)** - Complete auth architecture, OIDC integration, redirect loop prevention
- **[UI Configuration Guide](/docs/UI_CONFIGURATION.md)** - Comprehensive guide to customizing all visual elements
- **[Quest Data Service](/docs/QUEST_DATA_SERVICE.md)** - Data service layer, API reference, extending with new sources
- **[Domain Layer](/docs/DOMAIN_LAYER_REFACTORING.md)** - Business logic architecture and services
- **[Service Layer Implementation](/docs/SERVICE_LAYER_IMPLEMENTATION.md)** - Service layer design patterns

### Development Workflow

**Typical development workflow:**

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Make changes** to components, config, or domain logic

3. **Test in browser** - Changes hot-reload automatically

4. **Run linter:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build:**
   ```bash
   npm run preview
   ```

### Extending the Application

#### Adding a New Task

1. Update task enum in `/src/consts/enums.ts`:
   ```typescript
   export enum tasksEnum {
     // ... existing tasks
     newTask = "6. New Task Name",
   }
   ```

2. Add task position in `/src/config/uiConfig.ts`:
   ```typescript
   taskPositions: [
     // ... existing positions
     {
       taskTitle: tasksEnum.newTask,
       taskNumber: 6,
       cxPointers: 50,
       cyPointers: 50,
       cxStep: 51,
       cyStep: 60,
     },
   ]
   ```

3. Add step image to `/src/config/uiConfig.ts`:
   ```typescript
   steps: {
     images: [
       // ... existing steps
       sixthStep,
     ],
   }
   ```

4. Update CSV data structure:
   ```csv
   Email Address,...,6. New Task Name
   user@example.com,...,1
   ```

#### Adding a New Data Source

See `/docs/QUEST_DATA_SERVICE.md` for detailed instructions on:
- Creating a custom data service
- Implementing new data sources (REST API, GraphQL, WebSocket)
- Extending the service factory

#### Customizing Domain Logic

Domain services can be extended:

1. **TaskEvaluationService** - Change how tasks are counted or validated
2. **UserProgressService** - Modify how users are positioned or grouped
3. **FinishScreenService** - Add new special tasks or finish conditions
4. **AvatarService** - Change avatar URL generation

All services are in `/src/domain/` and can be modified independently.

### Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **react-oidc-context** - OIDC authentication
- **Framer Motion** - Animations
- **PapaParse** - CSV parsing
- **PrimeReact** - UI components
- **React Router** - Routing

### Scripts Reference

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production (outputs to /dist)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2015+ support required
- No IE11 support

---

## Contributing

When contributing to this project:

1. Maintain the separation of concerns (UI, domain, services)
2. Keep domain logic independent of React
3. Use the service layer for data access
4. Update documentation when adding features
5. Test in both DEV and OIDC modes
6. Ensure changes work with mock and real data sources

---

## License

[Add your license information here]

---

## Support

For issues, questions, or contributions:
- Open an issue in the repository
- Review documentation in `/docs` folder
- Check troubleshooting section above

---

**Happy Questing! 🎯**
