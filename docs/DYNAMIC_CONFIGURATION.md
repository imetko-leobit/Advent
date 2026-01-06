# Dynamic Configuration and Data Source Switching

This document describes how to use the dynamic configuration loading and data source switching features in the Well Being Quest application.

## Overview

The application now supports:

1. **Dynamic Quest Configuration** - Load different quest configurations at runtime without code changes
2. **Dynamic UI Configuration** - Switch map images, positions, and assets dynamically
3. **Runtime Data Source Switching** - Switch between Mock CSV, Google Sheets, and API data sources seamlessly

## Dynamic Configuration Loading

### Loading Quest Configuration from JSON

You can load a quest configuration from a JSON file:

```typescript
import { useConfig } from './context/ConfigContext';

function MyComponent() {
  const { loadQuestConfigFromJSON } = useConfig();
  
  const handleLoadConfig = async () => {
    const result = await loadQuestConfigFromJSON('/custom-quest-config.json');
    
    if (result.isValid) {
      console.log('Configuration loaded successfully!');
    } else {
      console.error('Configuration errors:', result.errors);
    }
  };
  
  return <button onClick={handleLoadConfig}>Load Custom Config</button>;
}
```

### Loading Quest Configuration from Object

You can also load configuration from a JavaScript object:

```typescript
import { useConfig } from './context/ConfigContext';

function MyComponent() {
  const { loadQuestConfigFromObject } = useConfig();
  
  const customConfig = {
    name: "My Custom Quest",
    taskCount: 10,
    // ... partial configuration
  };
  
  const handleLoadConfig = () => {
    const result = loadQuestConfigFromObject(customConfig);
    
    if (result.isValid) {
      console.log('Configuration loaded successfully!');
    }
  };
  
  return <button onClick={handleLoadConfig}>Load Custom Config</button>;
}
```

### Quest Configuration Format

A quest configuration JSON file should follow this structure:

```json
{
  "name": "My Custom Quest",
  "taskCount": 10,
  "tasks": [
    {
      "id": 0,
      "label": "Start",
      "type": "core"
    },
    {
      "id": 1,
      "label": "First Task",
      "type": "core"
    }
    // ... more tasks
  ],
  "finalTaskIds": [8, 9],
  "firstFinishTaskId": 8,
  "finalFinishTaskId": 9,
  "finishAnimations": {
    "finalFinish": {
      "top": "38%",
      "left": "245%"
    },
    "firstFinish": {
      "top": "130%",
      "left": "-75%"
    }
  }
}
```

**Note**: You only need to specify the fields you want to override. Missing fields will use default values from the base configuration.

### Loading UI Configuration

Similarly, you can load UI configuration (map images, positions, etc.):

```typescript
import { useConfig } from './context/ConfigContext';

function MyComponent() {
  const { loadUIConfigFromJSON, loadUIConfigFromObject } = useConfig();
  
  // From JSON file
  const loadFromJSON = async () => {
    await loadUIConfigFromJSON('/custom-ui-config.json');
  };
  
  // From object
  const loadFromObject = () => {
    loadUIConfigFromObject({
      map: {
        mapSvg: '/path/to/custom-map.svg',
        background: '/path/to/custom-background.svg',
      },
      // ... partial UI configuration
    });
  };
}
```

## Dynamic Data Source Switching

### Using the useDataSource Hook

The `useDataSource` hook enables runtime switching between different data sources:

```typescript
import { useDataSource } from './hooks/useDataSource';
import { DataSourceType } from './services/types';

function DataSourceManager() {
  const {
    currentData,
    isLoading,
    error,
    currentSourceType,
    switchDataSource,
    refreshData,
  } = useDataSource();
  
  const switchToMockCSV = async () => {
    await switchDataSource({
      type: DataSourceType.MOCK_CSV,
      url: '/mock-quest-data.csv',
    });
  };
  
  const switchToGoogleSheets = async () => {
    await switchDataSource({
      type: DataSourceType.GOOGLE_SHEETS,
      url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv',
    });
  };
  
  const switchToAPI = async () => {
    await switchDataSource({
      type: DataSourceType.API,
      url: 'https://api.example.com/quest-data',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
      },
    });
  };
  
  return (
    <div>
      <h2>Current Source: {currentSourceType}</h2>
      <p>Data Count: {currentData.length}</p>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      <button onClick={switchToMockCSV}>Use Mock CSV</button>
      <button onClick={switchToGoogleSheets}>Use Google Sheets</button>
      <button onClick={switchToAPI}>Use API</button>
      <button onClick={refreshData}>Refresh Data</button>
    </div>
  );
}
```

### Data Source Types

The application supports three data source types:

1. **MOCK_CSV** - Local CSV file (for development/testing)
   - URL should point to a CSV file (e.g., `/mock-quest-data.csv`)
   - No authentication required
   
2. **GOOGLE_SHEETS** - Google Sheets CSV export
   - URL should be the Google Sheets export URL ending with `/export?format=csv`
   - Sheet must be publicly accessible or use appropriate authentication
   
3. **API** - REST API endpoint
   - URL should be the API endpoint that returns quest data as JSON
   - Optional headers can be provided for authentication
   - Expected response format: Array of `IRowData` objects

### API Provider Format

When using the API data source, the endpoint should return JSON in this format:

```json
[
  {
    "email": "user1@example.com",
    "name": "User One",
    "picture": "https://example.com/avatar1.jpg",
    "taskNumber": 5
  },
  {
    "email": "user2@example.com",
    "name": "User Two",
    "picture": "https://example.com/avatar2.jpg",
    "taskNumber": 3
  }
]
```

## Configuration Validation and Fallback

### Automatic Validation

All loaded configurations are automatically validated. If validation fails:

1. Errors are logged to the console
2. The application falls back to the default configuration
3. A user-friendly error message is displayed (if configured)

### Handling Validation Errors

```typescript
const { loadQuestConfigFromJSON } = useConfig();

const result = await loadQuestConfigFromJSON('/custom-config.json');

if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
  console.warn('Configuration warnings:', result.warnings);
  // Configuration has been automatically fallen back to defaults
}
```

### DEV Mode Fallback

If configuration loading fails and DEV mode fallback is enabled, the application will:

1. Use default quest configuration
2. Use default UI configuration
3. Continue running normally
4. Log warnings about the fallback

You can check if the application is running in fallback mode:

```typescript
import { useConfig } from './context/ConfigContext';

function MyComponent() {
  const { questConfig, errors, warnings } = useConfig();
  
  const isFallback = errors.length > 0;
  
  return (
    <div>
      {isFallback && (
        <div className="warning">
          Running with default configuration due to errors:
          <ul>
            {errors.map(err => <li key={err}>{err}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

You can configure the default data source using environment variables:

```bash
# Use Mock CSV (default in DEV mode)
VITE_DEV_MODE=true

# Use Google Sheets
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv

# Use API (add custom environment variable)
VITE_API_ENDPOINT=https://api.example.com/quest-data
```

## Best Practices

### 1. Validate Before Deployment

Always validate custom configurations before deploying:

```typescript
import { validateQuestConfig } from './utils/configValidator';

const customConfig = { /* ... */ };
const validation = validateQuestConfig(customConfig);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### 2. Handle Loading States

Always handle loading states when switching data sources:

```typescript
const { isLoading, switchDataSource } = useDataSource();

return (
  <div>
    {isLoading ? (
      <LoadingSpinner />
    ) : (
      <QuestMap />
    )}
  </div>
);
```

### 3. Use Partial Configurations

Only override the fields you need to change:

```typescript
// Good - only override what's needed
loadQuestConfigFromObject({
  name: "Custom Quest",
  taskCount: 12,
});

// Avoid - unnecessary duplication
loadQuestConfigFromObject({
  name: "Custom Quest",
  taskCount: 12,
  tasks: [/* all 12 tasks */],
  // ... all other fields
});
```

### 4. Provide Fallback UI

Always provide user feedback when configuration fails:

```typescript
const { errors } = useConfig();

if (errors.length > 0) {
  return <ConfigErrorMessage errors={errors} />;
}
```

## Examples

### Example 1: Loading a Custom Quest

```typescript
// Load a custom quest configuration from a JSON file
const result = await loadQuestConfigFromJSON('/campaigns/summer-wellness.json');

if (result.isValid) {
  console.log('Loaded summer wellness quest!');
}
```

### Example 2: Switching Data Sources

```typescript
// Start with mock data for testing
await switchDataSource({
  type: DataSourceType.MOCK_CSV,
  url: '/test-data.csv',
});

// Switch to production Google Sheets when ready
await switchDataSource({
  type: DataSourceType.GOOGLE_SHEETS,
  url: process.env.VITE_GOOGLE_SHEET_URL,
});
```

### Example 3: Custom Map and Assets

```typescript
// Load a custom UI configuration with new map
loadUIConfigFromObject({
  map: {
    mapSvg: '/maps/winter-quest.svg',
    background: '/backgrounds/snow.svg',
  },
  taskPositions: [
    // Custom positions for the new map
    { taskNumber: 0, cxPointers: 10, cyPointers: 20, cxStep: 15, cyStep: 25 },
    // ... more positions
  ],
});
```

## Troubleshooting

### Configuration Won't Load

1. Check the JSON file is valid (use a JSON validator)
2. Verify the URL is accessible (check network tab in browser)
3. Check console for validation errors
4. Ensure required fields are present

### Data Source Switch Fails

1. Verify the URL is accessible
2. Check API response format matches expected format
3. For API sources, verify authentication headers are correct
4. Check browser console for network errors

### Quest Doesn't Update After Config Change

1. Ensure you're using the `useConfig` hook to access current config
2. Verify configuration was loaded successfully (check `isValid`)
3. Try refreshing the page if state is stale
4. Check that components are properly subscribing to config changes

## See Also

- [Configuration Validator](/src/utils/configValidator.ts) - Validation logic
- [Config Loader](/src/utils/configLoader.ts) - Loading utilities
- [Data Source Hook](/src/hooks/useDataSource.tsx) - Data source management
- [Quest Config](/src/config/quest.config.ts) - Default quest configuration
- [UI Config](/src/config/uiConfig.ts) - Default UI configuration
