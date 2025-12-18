# Well Being Quest - Rules Specification

## Overview

This document defines the core business rules for the Well Being Quest application. These rules govern how users progress through the quest, how their position is calculated, and when completion states are triggered.

## Quest Lifecycle

### States

1. **Start** - User has registered but not completed any tasks (position 0)
2. **In Progress** - User has completed 1 or more tasks (positions 1-13)
3. **First Milestone** - User has completed 9 tasks (position 9)
4. **Completed** - User has completed all 14 tasks (position 14)

### State Transitions

```
Start (0) → In Progress (1-8) → First Milestone (9) → In Progress (10-13) → Completed (14)
```

## Task Model

### Task Structure

- **Total Positions**: 15 (indexed 0-14)
  - Position 0: Start position (no tasks completed)
  - Positions 1-5: Core wellness tasks
  - Positions 6-14: Extended "good deed" tasks

### Core Tasks (Positions 1-5)

1. **1. Список справ** (To-do List)
2. **2. Пункт зі списку** (Task from List)
3. **3. Прогулянка на свіжому повітрі** (Fresh Air Walk)
4. **4. Список вдячності** (Gratitude List)
5. **5. Добра справа** (Good Deed)

### Extended Tasks (Positions 6-14)

All extended tasks share the same title: **"5. Добра справа"** (Good Deed)

These are additional iterations of the good deed task to encourage continued participation.

### Task Completion Rules

- Tasks are identified by column names in Google Sheets that match the pattern: `/^\d+\./` (digit followed by period)
- A task is considered **completed** if its value in the CSV is **non-null**
- Tasks are counted in order by their numeric prefix (sorted numerically)
- User position = count of completed tasks
- Task completion order is not enforced by the application (external system responsibility)

## Position Calculation Rules

### Algorithm

1. Extract all columns matching the task pattern from CSV row
2. Sort columns numerically by their leading digit
3. Count how many task columns have non-null values
4. User position = count of completed tasks (0-14)

### Position Mapping

```typescript
completedTaskCount = 0 → position = 0  (Start)
completedTaskCount = 1 → position = 1  (Task 1)
completedTaskCount = 2 → position = 2  (Task 2)
...
completedTaskCount = 14 → position = 14 (All tasks complete)
```

### Special Cases

- If a user has no completed tasks: position = 0
- Maximum position is capped at 14 (even if more tasks exist in data)

## User Visibility Rules

### Position 0 Visibility

**Rule**: Only the currently logged-in user is visible at position 0 (start position).

**Rationale**: To prevent cluttering the start of the map with users who registered but haven't started any tasks.

**Implementation**:
- When mapping users to positions, filter out users at position 0 unless their ID matches the logged-in user's ID

### Other Positions

All users are visible at positions 1-14, regardless of logged-in status.

## Finish Conditions and Special States

### First Milestone (Position 9)

**Trigger**: User reaches position 9 (completed 9 tasks)

**Behavior**:
- Show "Finish" screen to the logged-in user
- User avatar animates to a special location on the map
- Screen type: `finishScreenTypes.finish`

**Significance**: User has completed all 5 core tasks + 4 extended tasks

### Final Completion (Position 14)

**Trigger**: User reaches position 14 (completed 14 tasks)

**Behavior**:
- Show "Dzen" completion screen to the logged-in user
- User avatar animates to a different special location
- Screen type: `finishScreenTypes.dzen`

**Significance**: User has completed the entire quest

### Finish Screen Display Rules

- Finish screens only show for the **logged-in user**
- Finish screens show only **once per session** (until page refresh)
- User can close the finish screen to continue viewing the map
- After closing, avatar returns to normal position on map

## Social Network Points

### Definition

Users can earn social network points by sharing or mentioning the quest on social media platforms.

### Storage

- Stored in CSV column: "Соц мережі відмітки"
- Type: Number or null
- Default: 0 if null

### Impact

Social network points affect the visual appearance of the user's avatar pointer (color variation).

## Data Source: Google Sheets

### CSV Structure

**Required Columns**:
- `Email Address`: User's email address (format: `username@domain`)
- `Ім'я та прізвище`: User's full name

**Optional Columns**:
- `Соц мережі відмітки`: Social network points (numeric)

**Task Columns**:
- Pattern: `^\d+\.` (e.g., "1. Task name", "2. Another task")
- Values: timestamp or null
- Completed if non-null

### User Identity

**User ID Extraction**:
```
Email: john.doe@leobit.co
User ID: john.doe
```

User ID is the part of the email before the `@` symbol.

### Employee Photos

Photos are fetched from: `https://api.employee.leobit.co/photos-small/{userId}.png`

## Completed Quest Definition

A quest is considered **completed** when:
1. User's task position = 14
2. "Dzen" completion screen has been shown
3. All 14 tasks have non-null values in the data source

## Error Handling Rules

### Data Fetch Failures

- Log error to console
- Stop loading indicator
- Do not crash application
- Previous data remains displayed

### CSV Parse Errors

- Log error to console
- Stop loading indicator
- Do not crash application

### Missing User Data

- **Missing email**: Skip user (cannot identify)
- **Missing name**: Use email as fallback
- **Missing social points**: Default to 0

### Missing Avatar Photos

- If photo URL fails to load, browser shows broken image
- **TODO**: Implement fallback avatar image

## Configuration

All configurable values are centralized in `/src/config/questConfig.ts`:

- `QUEST_CONFIG.TOTAL_POSITIONS`: 15
- `QUEST_CONFIG.CORE_TASKS_COUNT`: 5
- `QUEST_CONFIG.FIRST_FINISH_THRESHOLD`: 9
- `QUEST_CONFIG.FINAL_COMPLETION_THRESHOLD`: 14
- `QUEST_CONFIG.START_POSITION`: 0
- `DATA_CONFIG.POLLING_INTERVAL_MS`: 180000 (3 minutes)
- `CSV_SCHEMA.REQUIRED_COLUMNS`: Email, Name
- `CSV_SCHEMA.TASK_COLUMN_PATTERN`: `/^\d+\./`

## Assumptions

1. **Data Source**: Google Sheets is the authoritative data source
2. **Task Order**: External system (manual entry) ensures logical task completion order
3. **Data Freshness**: 3-minute polling interval is acceptable for near-real-time updates
4. **User Base**: All users are Leobit employees with valid employee photos
5. **Language**: UI and data are primarily in Ukrainian
6. **Single Session**: No cross-device state synchronization
7. **Network**: Continuous internet connectivity required

## Future Considerations

- Add schema validation for CSV data
- Implement fallback avatar images
- Add configurable task structure (not hardcoded)
- Support for internationalization
- Offline support with local caching
- Mobile-friendly touch interactions
