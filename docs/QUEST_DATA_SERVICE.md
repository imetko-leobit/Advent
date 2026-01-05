# Quest Data Service Layer

## Overview

The Quest Data Service provides an abstraction layer for fetching and managing quest participant data. It decouples data operations from UI components and hooks, making it easy to switch between different data sources (mock CSV, Google Sheets, or future APIs).

## Architecture

```
┌─────────────────┐
│   Components    │
│   (Quest.tsx)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Hooks       │
│ (useQuestData)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ QuestDataService│  ◄── Service Layer (Abstraction)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Sources   │
│ (CSV/Sheets/API)│
└─────────────────┘
```

## Key Components

### 1. QuestDataService

The main service class that handles all data operations.

**Features:**
- Fetches data from configurable sources
- Parses CSV data into typed objects
- Manages polling for automatic updates
- Caches data for immediate access

### 2. Service Factory

`createQuestDataService()` - Factory function that automatically configures the service based on environment variables.

### 3. Types and Interfaces

- `IQuestDataService` - Interface defining service contract
- `DataSourceType` - Enum for data source types (MOCK_CSV, GOOGLE_SHEETS)
- `QuestDataServiceConfig` - Configuration interface

## Usage

### Basic Usage

```typescript
import { createQuestDataService } from '../services';

// Create service instance (auto-configured based on environment)
const service = createQuestDataService();

// Start polling and receive updates
service.startPolling((data) => {
  console.log('Received updated data:', data);
});

// Cleanup when done
service.stopPolling();
```

### In React Hook

```typescript
import { useEffect, useRef, useState } from 'react';
import { createQuestDataService } from '../services';
import { IRowData } from '../consts';

export const useQuestData = () => {
  const [data, setData] = useState<IRowData[]>([]);
  const serviceRef = useRef(createQuestDataService());

  useEffect(() => {
    const service = serviceRef.current;
    
    service.startPolling((updatedData) => {
      setData(updatedData);
    });

    return () => {
      service.stopPolling();
    };
  }, []);

  return { data };
};
```

### Custom Configuration

```typescript
import { createQuestDataService, DataSourceType } from '../services';

// Override default configuration
const service = createQuestDataService({
  dataSourceType: DataSourceType.MOCK_CSV,
  dataSourceUrl: '/custom-data.csv',
  pollingIntervalMs: 60000, // 1 minute
});
```

## Environment Configuration

### DEV Mode (Local Development)

**Without Google Sheets URL:**
```bash
# .env.local (leave empty or omit VITE_GOOGLE_SHEET_URL)
VITE_GOOGLE_SHEET_URL=
```

Result:
- Uses `/mock-quest-data.csv` from public folder
- Logs: `[QuestDataService] Using mock CSV data for local development`

### Production Mode

**With Google Sheets URL:**
```bash
# .env.production
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/your-sheet-id/export?format=csv
```

Result:
- Fetches data from Google Sheets
- Polls every 3 minutes for updates

## Data Source Switching

The service automatically determines the data source based on environment variables:

| Environment | VITE_GOOGLE_SHEET_URL | Data Source Used |
|-------------|----------------------|------------------|
| DEV         | Not set              | `/mock-quest-data.csv` |
| DEV         | Set                  | Google Sheets URL |
| Production  | Not set              | Error (required in prod) |
| Production  | Set                  | Google Sheets URL |

## API Reference

### IQuestDataService Interface

```typescript
interface IQuestDataService {
  // Get currently cached data
  getData(): IRowData[];

  // Start automatic polling with callback
  startPolling(callback: (data: IRowData[]) => void): void;

  // Stop automatic polling
  stopPolling(): void;

  // Manually fetch fresh data
  fetchData(): Promise<IRowData[]>;

  // Get service configuration
  getConfig(): QuestDataServiceConfig;
}
```

### Methods

#### `getData()`
Returns the currently cached data without fetching.

**Returns:** `IRowData[]`

#### `startPolling(callback)`
Begins automatic data polling. Fetches immediately, then at regular intervals.

**Parameters:**
- `callback: (data: IRowData[]) => void` - Called when new data is received

**Default Interval:** 3 minutes (180000ms)

#### `stopPolling()`
Stops automatic polling and clears callbacks.

#### `fetchData()`
Manually fetches fresh data from the configured source.

**Returns:** `Promise<IRowData[]>`

#### `getConfig()`
Returns the current service configuration.

**Returns:** `QuestDataServiceConfig`

## Data Flow

1. **Service Creation**
   ```
   createQuestDataService() → Auto-detects environment → Creates QuestDataService instance
   ```

2. **Polling Started**
   ```
   startPolling(callback) → Fetch initial data → Set up interval timer
   ```

3. **Data Update Cycle**
   ```
   Timer triggers → fetchData() → Parse CSV → Update cache → Call callback
   ```

4. **Cleanup**
   ```
   stopPolling() → Clear interval → Clear callbacks
   ```

## Benefits

### 1. **Separation of Concerns**
- Components don't know about data sources
- Parsing logic isolated in service
- Easy to test components independently

### 2. **Flexibility**
- Switch data sources via environment variables
- No code changes needed for DEV/PROD
- Easy to add new data sources in the future

### 3. **Type Safety**
- TypeScript interfaces ensure type safety
- Clear contracts between layers
- Compile-time error detection

### 4. **Maintainability**
- Single place for data logic
- Easier to debug and modify
- Consistent behavior across app

### 5. **Reusability**
- Service can be used by multiple components
- Shared caching reduces redundant requests
- Consistent polling behavior

## Future Enhancements

The service layer is designed to support future improvements:

1. **REST API Support**
   ```typescript
   export enum DataSourceType {
     MOCK_CSV = "MOCK_CSV",
     GOOGLE_SHEETS = "GOOGLE_SHEETS",
     REST_API = "REST_API",  // New source
   }
   ```

2. **GraphQL Support**
   - Add GraphQL client integration
   - Query specific user data

3. **WebSocket Support**
   - Real-time updates instead of polling
   - Reduce server load

4. **Caching Strategy**
   - Local storage persistence
   - Stale-while-revalidate pattern

5. **Error Recovery**
   - Retry logic
   - Exponential backoff
   - Fallback data sources

## Migration Guide

### Before (Old Approach)

```typescript
// useQuestData.tsx - Directly fetches and parses
const fetchData = async () => {
  const response = await fetch(url);
  const csvData = await response.text();
  Papa.parse(csvData, {
    complete: (result) => setJsonData(result.data),
  });
};
```

### After (Service Layer)

```typescript
// useQuestData.tsx - Uses service
const service = createQuestDataService();
service.startPolling((data) => setJsonData(data));
```

## Troubleshooting

### No data appearing

**Check:**
1. Environment variable `VITE_GOOGLE_SHEET_URL` is set correctly
2. Mock CSV file exists at `/public/mock-quest-data.csv`
3. Console for error messages from `[QuestDataService]`

### Polling not working

**Check:**
1. `startPolling()` was called with a valid callback
2. Component cleanup calls `stopPolling()`
3. No errors in CSV parsing (check console)

### Wrong data source

**Check:**
1. Environment mode (DEV vs production)
2. Environment variables loaded correctly
3. Service configuration: `service.getConfig()`

## Examples

### Example 1: Get User Position

```typescript
import { createQuestDataService } from '../services';
import { positionMapper } from '../helpers/userDataMapper';

const getUserPosition = async (email: string) => {
  const service = createQuestDataService();
  const data = await service.fetchData();
  const positions = positionMapper(data);
  
  return positions.find(user => user.email === email);
};
```

### Example 2: Manual Refresh

```typescript
const refreshData = async () => {
  const service = createQuestDataService();
  const freshData = await service.fetchData();
  console.log('Refreshed data:', freshData);
};
```

### Example 3: Custom Polling Interval

```typescript
// Poll every 1 minute instead of 3
const service = createQuestDataService({
  pollingIntervalMs: 60000,
});
```

## Testing

### Unit Testing the Service

```typescript
import { QuestDataService, DataSourceType } from '../services';

describe('QuestDataService', () => {
  it('should fetch and parse CSV data', async () => {
    const service = new QuestDataService({
      dataSourceType: DataSourceType.MOCK_CSV,
      dataSourceUrl: '/test-data.csv',
    });

    const data = await service.fetchData();
    expect(data).toBeInstanceOf(Array);
  });

  it('should call callback on polling', (done) => {
    const service = new QuestDataService({
      dataSourceType: DataSourceType.MOCK_CSV,
      dataSourceUrl: '/test-data.csv',
      pollingIntervalMs: 100,
    });

    service.startPolling((data) => {
      expect(data).toBeDefined();
      service.stopPolling();
      done();
    });
  });
});
```

## Summary

The Quest Data Service layer provides:

✅ **Clean abstraction** - Components don't handle data fetching  
✅ **Environment flexibility** - DEV/PROD switching is automatic  
✅ **Type safety** - Full TypeScript support  
✅ **Maintainability** - Single source of truth for data logic  
✅ **Extensibility** - Ready for future data sources  
✅ **Consistency** - Uniform data handling across the app

Ready for Stage 3: Domain layer / Business logic extraction 🎯
