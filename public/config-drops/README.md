# Quest Configuration Files

This directory contains JSON configuration files for different quest variants.

## Purpose

Quest configurations are now stored as JSON files that can be:
- Loaded dynamically at runtime
- Validated using Zod schema
- Swapped without rebuilding the application
- Added or modified without touching TypeScript code

## Available Configurations

### `default.json`
The standard Well Being Quest configuration with 15 tasks (0-14).
- Core tasks: To-do list, tasks from list, fresh air walk, gratitude list
- Extra tasks: Good deeds (multiple)
- Finish screens at tasks 9 and 14

### `extreme.json`
An extreme variant of the quest with 14 tasks (0-13).
- Themed around extreme wellness challenges
- Custom theme colors (red, yellow, green)
- Different task names and progression
- Optional map markers for extended features

## How to Add a New Configuration

1. Create a new JSON file in this directory (e.g., `summer.json`)
2. Follow the schema defined in `src/services/configSchema.ts`
3. Required fields:
   - `name`: Quest name
   - `taskCount`: Total number of tasks
   - `tasks`: Array of task objects with `id`, `label`, and `type`
   - `finalTaskIds`: Array of finish task IDs
   - `firstFinishTaskId`: ID of first finish screen
   - `finalFinishTaskId`: ID of final finish screen
   - `finishAnimations`: Animation coordinates for finish screens

4. Optional fields:
   - `title`: Alternative quest title
   - `theme`: Color theme (`primary`, `secondary`, `accent`)
   - `map`: Map configuration with `image` and `markers`
   - `rules`: Quest rules (`steps`, `maxDailyPoints`, `completionReward`)

## How to Use

### Via URL Parameter
Add `?quest=extreme` to the URL to load a specific configuration:
```
http://localhost:3000?quest=extreme
```

### Via ConfigDemo Component
Use the Config Demo UI to switch between configurations at runtime.

### Via Code
```typescript
import { useConfig } from './context/ConfigContext';

function MyComponent() {
  const { loadQuestConfigByKey } = useConfig();
  
  const loadExtreme = () => {
    loadQuestConfigByKey('extreme');
  };
}
```

## Validation

All configurations are validated against a Zod schema with the following checks:
- Task count matches tasks array length
- Task IDs are sequential (0, 1, 2, ...)
- Task types are valid ('core', 'extra', or 'finish')
- Final task IDs are within valid range
- Map markers (if present) have x/y coordinates between 0-100

Invalid configurations will fall back to the default TypeScript config with error messages.

## Notes

- The `/config-drops` folder at the root is the source of truth
- Files are copied to `/public/config-drops` during build
- Changes to JSON files require a browser refresh (no rebuild needed)
- In development, you can edit these files and refresh to see changes
- The last selected configuration is saved to localStorage

## See Also

- `src/services/configSchema.ts` - Validation schema
- `src/config/config.factory.ts` - Config loading logic
- `docs/DYNAMIC_CONFIGURATION.md` - Full documentation
