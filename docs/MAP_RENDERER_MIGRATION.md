# MapRenderer Migration Guide

## Overview

This document explains the refactoring of map-related UI components to introduce the `MapRenderer` abstraction, making the system more reusable and configuration-driven.

## What Changed?

### Before: Monolithic SVGMap Component

Previously, the `SVGMap` component (`/src/components/Map.tsx`) contained all logic in a single component:
- Map rendering
- Loading states
- Quest-specific logic (finish screens, user filtering)
- User positioning
- Hover interactions
- Animation placement

This made it tightly coupled to the specific quest implementation.

### After: Separation of Concerns

Now we have two components:

1. **MapRenderer** (new) - Pure, reusable rendering component
   - Located: `/src/components/MapRenderer/`
   - Responsibility: Render map and position elements
   - Knowledge: Only coordinates and visual layout

2. **SVGMap** (refactored) - Quest-specific wrapper
   - Located: `/src/components/Map.tsx`
   - Responsibility: Quest business logic
   - Knowledge: Tasks, users, finish screens, interactions

## Architecture Changes

### Component Hierarchy

```
Quest Page (quest.tsx)
    ↓
SVGMap (Quest Wrapper)
    ↓
MapRenderer (Pure Renderer)
    ↓ (children)
Stars, Clouds, Girl
```

### Data Flow

**Before:**
```tsx
<SVGMap tableData={questData} />
  // SVGMap had direct knowledge of:
  // - IMapTaskPosition structure
  // - Task numbers and order
  // - Finish task logic
  // - User filtering rules
```

**After:**
```tsx
<SVGMap tableData={questData} />
  // SVGMap transforms quest data to generic positions
  ↓
<MapRenderer 
  positions={positions}  // Generic MapPosition[]
  renderAtPointers={...}  // Callback for quest logic
  renderAtSteps={...}     // Callback for quest logic
/>
```

## Interface Changes

### New Interfaces

#### MapPosition
Generic position interface (no quest knowledge):
```typescript
interface MapPosition {
  id: string | number;      // Unique identifier
  cxPointers: number;       // X coordinate for pointers (%)
  cyPointers: number;       // Y coordinate for pointers (%)
  cxStep: number;           // X coordinate for step (%)
  cyStep: number;           // Y coordinate for step (%)
}
```

#### MapRendererProps
Configuration-driven rendering:
```typescript
interface MapRendererProps {
  mapImage: string;
  positions: MapPosition[];
  loading?: boolean;
  children?: ReactNode;
  overlayContent?: ReactNode;
  loadingIndicator?: ReactNode;
  renderAtPointers?: (props: PositionRenderProps) => ReactNode;
  renderAtSteps?: (props: PositionRenderProps) => ReactNode;
}
```

### Data Transformation

SVGMap now transforms quest-specific data to generic positions:

```typescript
// In SVGMap
const positions: MapPosition[] = tableData
  ? tableData.map((group) => ({
      id: `${group.taskNumber}`,
      cxPointers: group.cxPointers,
      cyPointers: group.cyPointers,
      cxStep: group.cxStep,
      cyStep: group.cyStep,
    }))
  : [];
```

## Benefits

### 1. Reusability
- MapRenderer can be used for any map-based application
- No dependency on quest-specific types or logic
- Easy to create different quest types

### 2. Testability
- MapRenderer can be tested in isolation
- Clear input/output contracts
- Mock callbacks for testing interactions

### 3. Maintainability
- Clear separation of rendering vs business logic
- Changes to quest rules don't affect MapRenderer
- Changes to map rendering don't affect quest logic

### 4. Configurability
- All visual elements controlled via props
- Easy to swap maps and assets
- Flexible positioning system

## Migration Examples

### Example 1: Creating a New Quest Map

**Old approach** (required modifying SVGMap):
```tsx
// Had to modify Map.tsx directly
// Hard to reuse for different quests
```

**New approach** (reuse MapRenderer):
```tsx
// Create new quest wrapper
export const ChristmasQuestMap: FC<Props> = ({ questData }) => {
  const positions = questData.map(transformToPosition);
  
  return (
    <MapRenderer
      mapImage="/christmas-map.svg"
      positions={positions}
      renderAtPointers={({ index }) => (
        <ChristmasPointer data={questData[index]} />
      )}
      renderAtSteps={({ index }) => (
        <SnowflakeMarker position={index} />
      )}
    >
      <Snowflakes />
      <Reindeers />
    </MapRenderer>
  );
};
```

### Example 2: Custom Loading Indicator

**Before:**
```tsx
// Loading indicator was hardcoded in SVGMap
<ProgressSpinner ... />
```

**After:**
```tsx
<MapRenderer
  loading={isLoading}
  loadingIndicator={<CustomSpinner text="Loading quest..." />}
  {...otherProps}
/>
```

### Example 3: Different Map for Different Environments

```tsx
const mapImage = isDev 
  ? '/maps/dev-simple-map.svg'
  : '/maps/production-detailed-map.svg';

<MapRenderer
  mapImage={mapImage}
  positions={positions}
  {...otherProps}
/>
```

## Backward Compatibility

✅ **No breaking changes** to existing code:
- Quest page still uses `<SVGMap />` component
- All props remain the same
- All functionality preserved
- All animations and interactions work

The refactoring is **internal only** - external usage is unchanged.

## Code Organization

### File Structure

```
src/
├── components/
│   ├── Map.tsx                    # SVGMap (quest wrapper)
│   ├── MapRenderer/               # NEW
│   │   ├── MapRenderer.tsx        # Pure renderer component
│   │   ├── index.ts               # Exports
│   │   └── README.md              # Component documentation
│   ├── Step/
│   ├── StackedPointers/
│   └── ...
```

### Import Changes

**In SVGMap (Map.tsx):**
```typescript
// Added import
import { MapRenderer, MapPosition } from "./MapRenderer";
```

**For new quest implementations:**
```typescript
import { MapRenderer } from "../components/MapRenderer";
import type { MapPosition } from "../components/MapRenderer";
```

## Testing Strategy

### Unit Tests for MapRenderer

```typescript
// Test pure rendering
it('renders map with positions', () => {
  const positions = [
    { id: 1, cxPointers: 10, cyPointers: 20, cxStep: 15, cyStep: 25 }
  ];
  
  render(
    <MapRenderer 
      mapImage="/test-map.svg" 
      positions={positions} 
    />
  );
  
  expect(screen.getByAltText('Map')).toBeInTheDocument();
});

// Test loading state
it('shows loading indicator when loading', () => {
  render(
    <MapRenderer 
      mapImage="/map.svg" 
      positions={[]} 
      loading={true}
      loadingIndicator={<div>Loading...</div>}
    />
  );
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// Test callbacks
it('calls renderAtPointers for each position', () => {
  const renderAtPointers = jest.fn();
  const positions = [{ id: 1, ...coords }];
  
  render(
    <MapRenderer 
      mapImage="/map.svg" 
      positions={positions}
      renderAtPointers={renderAtPointers}
    />
  );
  
  expect(renderAtPointers).toHaveBeenCalledWith({
    position: positions[0],
    index: 0
  });
});
```

### Integration Tests for SVGMap

Test the quest-specific logic:
- User positioning
- Finish screen triggers
- Hover interactions
- Modal opening

## Performance Considerations

### Optimizations Preserved

- ✅ Memoization of user groups
- ✅ Efficient position calculations
- ✅ Lazy rendering of tooltips/modals

### New Optimization Opportunities

With separated concerns, you can now:
- Memoize MapRenderer renders independently
- Optimize quest logic without affecting rendering
- Lazy load different map images

## Future Enhancements

### Potential MapRenderer Features

1. **Touch/Mobile Support**
   ```typescript
   interface MapRendererProps {
     onPositionTap?: (position: MapPosition) => void;
     enablePinchZoom?: boolean;
   }
   ```

2. **Zoom/Pan Controls**
   ```typescript
   interface MapRendererProps {
     enableZoom?: boolean;
     zoomLevel?: number;
     onZoomChange?: (level: number) => void;
   }
   ```

3. **Accessibility**
   ```typescript
   interface MapPosition {
     ariaLabel?: string;
     ariaDescription?: string;
   }
   ```

4. **Animation Support**
   ```typescript
   interface MapRendererProps {
     animatePositions?: boolean;
     animationDuration?: number;
   }
   ```

## Common Patterns

### Pattern 1: Conditional Rendering Based on Quest Rules

```typescript
// In SVGMap
renderAtSteps={({ index }) => {
  const group = tableData[index];
  const isSpecialTask = finishScreenService.isSpecialTask(group.taskNumber);
  
  return isSpecialTask ? (
    <SpecialStep group={group} />
  ) : (
    <NormalStep group={group} />
  );
}}
```

### Pattern 2: Dynamic Position Calculation

```typescript
// In SVGMap
const positions = useMemo(() => {
  return tableData?.map((group) => ({
    id: `${group.taskNumber}`,
    // Apply dynamic offset based on some rule
    cxPointers: group.cxPointers + calculateOffset(group),
    cyPointers: group.cyPointers,
    cxStep: group.cxStep,
    cyStep: group.cyStep,
  })) ?? [];
}, [tableData]);
```

### Pattern 3: Overlay Management

```typescript
// In SVGMap
const overlayContent = useMemo(() => {
  if (showFinishScreen) {
    return <FinishScreen onClose={handleClose} />;
  }
  if (showTutorial) {
    return <Tutorial />;
  }
  return null;
}, [showFinishScreen, showTutorial]);

<MapRenderer overlayContent={overlayContent} {...props} />
```

## Troubleshooting

### Issue: Positions not rendering

**Cause:** Missing `id` field in positions
**Solution:** Ensure each position has a unique `id`:
```typescript
positions.map((pos, idx) => ({ ...pos, id: pos.id || idx }))
```

### Issue: Callbacks not working

**Cause:** Callbacks recreated on every render
**Solution:** Use `useCallback`:
```typescript
const renderAtPointers = useCallback(({ index }) => {
  // ...
}, [dependencies]);
```

### Issue: Children not visible

**Cause:** Z-index conflicts
**Solution:** Ensure children use appropriate z-index values

## Related Documentation

- [MapRenderer README](/src/components/MapRenderer/README.md)
- [UI Configuration Guide](/docs/UI_CONFIGURATION.md)
- [Quest Configuration](/src/config/quest.config.ts)

## Questions?

If you have questions about this refactoring or need help migrating custom code, please:
1. Review the MapRenderer README
2. Check this migration guide
3. Look at the SVGMap implementation as a reference
4. Open an issue with your specific use case
