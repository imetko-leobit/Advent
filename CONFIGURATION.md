# Well Being Quest - Configuration Guide

This document describes all configurable values in the Well Being Quest application and how to modify them.

## Configuration Location

All configuration is centralized in: `/src/config/questConfig.ts`

## Configuration Sections

### 1. Quest Structure Configuration (`QUEST_CONFIG`)

Defines the core quest structure and progression rules.

```typescript
export const QUEST_CONFIG = {
  TOTAL_POSITIONS: 15,
  CORE_TASKS_COUNT: 5,
  FIRST_FINISH_THRESHOLD: 9,
  FINAL_COMPLETION_THRESHOLD: 14,
  START_POSITION: 0,
} as const;
```

#### Configuration Options

| Parameter | Type | Default | Description | Impact of Change |
|-----------|------|---------|-------------|------------------|
| `TOTAL_POSITIONS` | number | 15 | Total number of positions on the quest map (0-14) | Changing requires updating `taskPositions.ts` with new position coordinates |
| `CORE_TASKS_COUNT` | number | 5 | Number of core wellness tasks before extended tasks | Informational only, does not affect logic |
| `FIRST_FINISH_THRESHOLD` | number | 9 | Task position that triggers the first finish screen | Changes when first milestone celebration appears |
| `FINAL_COMPLETION_THRESHOLD` | number | 14 | Task position that triggers final completion screen | Changes when final celebration appears |
| `START_POSITION` | number | 0 | Starting position for users with no completed tasks | Should always be 0 |

#### Example: Adding a 6th Core Task

To change from 5 to 6 core tasks before showing first finish screen:

1. Update `FIRST_FINISH_THRESHOLD` from 9 to 10
2. Update Google Sheets to add the 6th task column
3. Verify task positions in `taskPositions.ts` are correct

### 2. Data Fetching Configuration (`DATA_CONFIG`)

Controls how data is fetched from Google Sheets.

```typescript
export const DATA_CONFIG = {
  POLLING_INTERVAL_MS: 180000,
  GOOGLE_SHEET_URL: import.meta.env.VITE_GOOGLE_SHEET_URL as string,
} as const;
```

#### Configuration Options

| Parameter | Type | Default | Description | Impact of Change |
|-----------|------|---------|-------------|------------------|
| `POLLING_INTERVAL_MS` | number | 180000 (3 min) | How often to fetch new data from Google Sheets | Lower = more frequent updates, higher server load<br>Higher = less frequent updates, lower server load |
| `GOOGLE_SHEET_URL` | string | From env var | URL to Google Sheets CSV export | Must be a publicly accessible CSV URL |

#### Environment Variables

Set in `.env` file:

```bash
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv
```

#### Example: Faster Updates

To update every 1 minute instead of 3:

```typescript
POLLING_INTERVAL_MS: 60000, // 1 minute
```

### 3. External API Configuration (`API_CONFIG`)

Defines external service URLs and endpoints.

```typescript
export const API_CONFIG = {
  EMPLOYEE_PHOTO_BASE_URL: "https://api.employee.leobit.co/photos-small",
  PHOTO_FILE_EXTENSION: ".png",
  FALLBACK_AVATAR_URL: "/fallback-avatar.svg",
} as const;
```

#### Configuration Options

| Parameter | Type | Default | Description | Impact of Change |
|-----------|------|---------|-------------|------------------|
| `EMPLOYEE_PHOTO_BASE_URL` | string | `https://api.employee.leobit.co/photos-small` | Base URL for employee photo API | Change if photo API URL changes or moves to different domain |
| `PHOTO_FILE_EXTENSION` | string | `.png` | File extension for photos | Change if photo format changes (e.g., `.jpg`, `.webp`) |
| `FALLBACK_AVATAR_URL` | string | `/fallback-avatar.svg` | URL for fallback avatar when photo fails to load | Change to use a different default avatar |

#### Helper Functions

```typescript
// Get full photo URL for a user
getEmployeePhotoUrl(userId: string): string

// Get fallback avatar URL
getFallbackAvatarUrl(): string
```

#### Example: Using Different Photo Service

To use a different photo service:

```typescript
EMPLOYEE_PHOTO_BASE_URL: "https://cdn.mycompany.com/avatars",
PHOTO_FILE_EXTENSION: ".jpg",
```

### 4. CSV Schema Configuration (`CSV_SCHEMA`)

Defines the expected structure of Google Sheets CSV data.

```typescript
export const CSV_SCHEMA = {
  REQUIRED_COLUMNS: {
    EMAIL: "Email Address",
    NAME: "Ім'я та прізвище",
  },
  OPTIONAL_COLUMNS: {
    SOCIAL_NETWORK_POINTS: "Соц мережі відмітки",
  },
  TASK_COLUMN_PATTERN: /^\d+\./,
} as const;
```

#### Configuration Options

| Parameter | Type | Default | Description | Impact of Change |
|-----------|------|---------|-------------|------------------|
| `REQUIRED_COLUMNS.EMAIL` | string | "Email Address" | Column name for user email in CSV | **Breaking change** - must match Google Sheets exactly |
| `REQUIRED_COLUMNS.NAME` | string | "Ім'я та прізвище" | Column name for user name in CSV | **Breaking change** - must match Google Sheets exactly |
| `OPTIONAL_COLUMNS.SOCIAL_NETWORK_POINTS` | string | "Соц мережі відмітки" | Column name for social points | Change if column is renamed in Sheets |
| `TASK_COLUMN_PATTERN` | RegExp | `/^\d+\./` | Pattern to identify task columns | Change to support different task naming convention |

#### Example: English Column Names

To use English column names:

```typescript
REQUIRED_COLUMNS: {
  EMAIL: "Email Address", // Already English
  NAME: "Full Name",
},
OPTIONAL_COLUMNS: {
  SOCIAL_NETWORK_POINTS: "Social Points",
},
```

**Important**: Google Sheets must use the same column names!

### 5. UI Configuration (`UI_CONFIG`)

Controls UI behavior and display preferences.

```typescript
export const UI_CONFIG = {
  MAX_AVATARS_BEFORE_MODAL: 5,
  MAX_AVATARS_IN_TOOLTIP: 5,
  AVATAR_STACK_OFFSET_LARGE: 10,
  AVATAR_STACK_OFFSET_SMALL: 2,
} as const;
```

#### Configuration Options

| Parameter | Type | Default | Description | Impact of Change |
|-----------|------|---------|-------------|------------------|
| `MAX_AVATARS_BEFORE_MODAL` | number | 5 | Max avatars to show inline before requiring modal | Lower = modal appears sooner<br>Higher = more avatars shown inline |
| `MAX_AVATARS_IN_TOOLTIP` | number | 5 | Max avatars to show in tooltip | Controls tooltip display behavior |
| `AVATAR_STACK_OFFSET_LARGE` | number | 10 | Stacking offset in pixels for < 10 users | Affects visual spacing of avatars |
| `AVATAR_STACK_OFFSET_SMALL` | number | 2 | Stacking offset in pixels for >= 10 users | Affects visual spacing of avatars |

#### Example: Show More Avatars Inline

To show up to 8 avatars inline before opening modal:

```typescript
MAX_AVATARS_BEFORE_MODAL: 8,
```

## Related Configuration Files

### Task Positions (`src/consts/taskPositions.ts`)

Defines the visual coordinates for each task position on the SVG map.

**Structure**:
```typescript
export const initialMapTaskPositions: IMapTaskPosition[] = [
  {
    taskTitle: tasksEnum.initialPosition,
    taskNumber: 0,
    cxPointers: 15.8,  // X coordinate for user pointers (%)
    cyPointers: 21,    // Y coordinate for user pointers (%)
    cxStep: 16.5,      // X coordinate for step icon (%)
    cyStep: 32.5,      // Y coordinate for step icon (%)
    users: [],
  },
  // ... 14 more positions
];
```

**Changing**: Requires careful measurement of SVG coordinates. Use visual editor to determine new positions.

### Task Enums (`src/consts/enums.ts`)

Defines task names and other enumerations.

```typescript
export enum tasksEnum {
  initialPosition = "Старт",
  todoList = "1. Список справ",
  taskFromList = "2. Пункт зі списку",
  // ...
}
```

**Changing**: Task names can be changed for display purposes, but must coordinate with Google Sheets column names.

## Environment Variables

Set in `.env` file at project root:

```bash
# Required
VITE_GOOGLE_SHEET_URL=https://docs.google.com/.../export?format=csv
VITE_APP_AUTH_AUTHORITY=https://auth.example.com
VITE_APP_AUTH_REDIRECT_URI=https://quest.example.com

# Optional (if different from defaults)
# Add any environment-specific overrides here
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_SHEET_URL` | Public URL to Google Sheets CSV export | `https://docs.google.com/spreadsheets/d/abc123/export?format=csv` |
| `VITE_APP_AUTH_AUTHORITY` | OIDC authentication server URL | `https://auth.leobit.co` |
| `VITE_APP_AUTH_REDIRECT_URI` | URL to redirect to after authentication | `https://quest.leobit.co` |

### Creating `.env` File

1. Copy `.env.example` to `.env`
2. Fill in all required values
3. Never commit `.env` to version control

## Configuration Best Practices

### 1. Document Changes

When changing configuration:
- Update this document if adding new config
- Document why the change was made
- Test thoroughly before deploying

### 2. Version Configuration

Consider versioning configuration for major changes:

```typescript
export const QUEST_CONFIG_VERSION = "1.0.0";
```

### 3. Validate Configuration

Add runtime validation for critical config:

```typescript
if (QUEST_CONFIG.FIRST_FINISH_THRESHOLD >= QUEST_CONFIG.TOTAL_POSITIONS) {
  throw new Error("Invalid configuration: First finish threshold too high");
}
```

### 4. Environment-Specific Config

For different environments (dev, staging, prod), use environment variables:

```typescript
export const DATA_CONFIG = {
  POLLING_INTERVAL_MS: 
    import.meta.env.DEV ? 30000 : 180000, // Faster polling in dev
  // ...
};
```

## Configuration Change Checklist

Before changing configuration:

- [ ] Understand the impact of the change
- [ ] Check if Google Sheets needs updates
- [ ] Check if `taskPositions.ts` needs updates
- [ ] Update documentation
- [ ] Test in development environment
- [ ] Verify build succeeds
- [ ] Verify linting passes
- [ ] Test with real data
- [ ] Deploy to staging first
- [ ] Monitor for errors after production deployment

## Common Configuration Scenarios

### Scenario 1: Adding a New Task

**Required Changes**:
1. Update Google Sheets with new task column (e.g., "6. New Task")
2. Update `QUEST_CONFIG.TOTAL_POSITIONS` (if needed)
3. Add new position to `taskPositions.ts` with SVG coordinates
4. Test with real data

### Scenario 2: Changing Finish Screen Triggers

**Required Changes**:
1. Update `QUEST_CONFIG.FIRST_FINISH_THRESHOLD`
2. Update `QUEST_CONFIG.FINAL_COMPLETION_THRESHOLD`
3. Test finish screen displays at correct positions

### Scenario 3: Changing Column Names

**Required Changes**:
1. Update Google Sheets column names
2. Update `CSV_SCHEMA.REQUIRED_COLUMNS` or `CSV_SCHEMA.OPTIONAL_COLUMNS`
3. Test CSV parsing with new column names
4. Deploy changes simultaneously with Sheets update

### Scenario 4: Different Photo Service

**Required Changes**:
1. Update `API_CONFIG.EMPLOYEE_PHOTO_BASE_URL`
2. Update `API_CONFIG.PHOTO_FILE_EXTENSION` (if needed)
3. Verify photo URLs are correctly constructed
4. Test with sample user IDs

## Troubleshooting Configuration Issues

### Issue: Users not appearing on map

**Check**:
- Is `CSV_SCHEMA.REQUIRED_COLUMNS.EMAIL` correct?
- Does Google Sheets have matching column name?
- Check browser console for validation errors

### Issue: Wrong finish screen appearing

**Check**:
- Are `FIRST_FINISH_THRESHOLD` and `FINAL_COMPLETION_THRESHOLD` correct?
- Do they match actual task count?

### Issue: Data not updating

**Check**:
- Is `DATA_CONFIG.GOOGLE_SHEET_URL` accessible?
- Is `DATA_CONFIG.POLLING_INTERVAL_MS` reasonable?
- Check browser console for fetch errors

### Issue: Photos not loading

**Check**:
- Is `API_CONFIG.EMPLOYEE_PHOTO_BASE_URL` correct?
- Is `API_CONFIG.PHOTO_FILE_EXTENSION` correct?
- Check network tab for 404 errors
- Verify fallback avatar is working

## Migration Guide

When upgrading from old hardcoded values to configuration:

### Before
```typescript
// Hardcoded in component
if (taskNumber === 9) {
  showFinishScreen();
}
```

### After
```typescript
// Using configuration
import { QUEST_CONFIG } from '../config/questConfig';
import { isFirstFinishMilestone } from '../domain/questRules';

if (isFirstFinishMilestone(taskNumber)) {
  showFinishScreen();
}
```

## Further Reading

- [QUEST_RULES.md](./QUEST_RULES.md) - Business rules documentation
- [CSV_SCHEMA.md](./CSV_SCHEMA.md) - Data contract documentation
- [TECHNICAL_ASSESSMENT.md](./TECHNICAL_ASSESSMENT.md) - Technical architecture overview
