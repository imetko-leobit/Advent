# Google Sheets CSV Data Contract

This document defines the expected structure and format of the Google Sheets CSV export used by the Well Being Quest application.

## Overview

The application fetches CSV data from a Google Sheets document at regular intervals (every 3 minutes by default). This CSV serves as the data source for user progress tracking.

## CSV Structure

### Header Row

The first row must contain column headers. The application uses these headers to identify and extract data.

### Required Columns

| Column Name | Type | Description | Validation Rules |
|------------|------|-------------|------------------|
| `Email Address` | String | User's email address | - Must contain `@` symbol<br>- Format: `username@domain.com`<br>- Used to derive user ID and fetch avatar |
| `Ім'я та прізвище` | String | User's full name (Ukrainian) | - If missing, email will be used as fallback display name |

### Optional Columns

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| `Соц мережі відмітки` | Number | 0 | Social network points<br>Used for avatar pointer color variation |

### Task Columns

Task columns follow a specific naming pattern:

**Pattern**: `^\d+\.` (digit followed by period)

**Examples**:
- `1. Список справ` (To-do List)
- `2. Пункт зі списку` (Task from List)
- `3. Прогулянка на свіжому повітрі` (Fresh Air Walk)
- `4. Список вдячності` (Gratitude List)
- `5. Добра справа` (Good Deed)
- And so on...

**Values**:
- `null` or empty: Task not completed
- Any non-null value (typically a timestamp): Task completed

**Note**: The application counts completed tasks (non-null values) to determine user position.

## Data Types

### Email Address
- **Type**: String
- **Format**: `username@domain.com`
- **Example**: `john.doe@leobit.co`
- **Extraction**: User ID is extracted as the part before `@`

### Name
- **Type**: String
- **Format**: Free text (typically "First Last" in Ukrainian)
- **Example**: `Іван Петренко`

### Social Network Points
- **Type**: Number or null
- **Valid Range**: 0 or positive integers
- **Example**: `5`
- **Processing**: 
  - `null` → converted to `0`
  - Negative values → converted to `0`
  - Strings → parsed to integer, or `0` if invalid

### Task Completion
- **Type**: Mixed (typically timestamp or null)
- **Interpretation**:
  - `null` or `undefined` → Not completed
  - Any other value → Completed
- **Example**: `2024-12-18 10:30:00` (or any truthy value)

## Validation Rules

### Row-level Validation

1. **Email Required**: Every row must have a valid email address
2. **Email Format**: Email must contain `@` with parts before and after
3. **Task Column Detection**: Only columns matching `/^\d+\./` pattern are counted as tasks
4. **Task Ordering**: Task columns are sorted numerically by their leading digit

### CSV-level Validation

1. **Non-empty**: CSV must contain at least one data row (excluding header)
2. **Valid Rows Only**: Invalid rows (missing email) are filtered out
3. **Warnings**: Logged but don't block processing
   - Missing name (email used as fallback)
   - Invalid social network points (converted to 0)

## Error Handling

### Fetch Errors
- **Behavior**: Error logged to console, previous data retained
- **User Impact**: Map continues showing last valid data
- **No Application Crash**: Loading spinner stops

### Parse Errors
- **Behavior**: Error logged to console
- **User Impact**: Partial data may be shown if some rows are valid
- **Graceful Degradation**: Invalid rows are filtered out, valid rows are processed

### Missing Data
- **Missing Email**: Row is skipped entirely
- **Missing Name**: Email is used as display name
- **Missing Social Points**: Default to 0
- **Missing Task Values**: Treated as null (not completed)

## Column Order

**Column order does not matter**. The application identifies columns by their names, not by position.

## Backward Compatibility

### Adding New Columns
- ✅ **Safe**: New columns are ignored unless they match task pattern
- ✅ **Task Columns**: Can be added dynamically if they follow naming pattern

### Removing Columns
- ❌ **Breaking**: Removing required columns (`Email Address`, `Ім'я та прізвище`) breaks user data
- ✅ **Safe**: Removing optional columns (`Соц мережі відмітки`) is safe (defaults to 0)
- ⚠️ **Caution**: Removing task columns reduces user progress tracking

### Renaming Columns
- ❌ **Breaking**: Renaming any column breaks the data contract
- **Migration Required**: Code changes needed to support new column names

### Changing Data Types
- ⚠️ **Email to Non-String**: Would break user identification
- ⚠️ **Task Values**: Any non-null value works, but consistency recommended
- ⚠️ **Social Points to Non-Numeric**: Parsed to 0, may not be desired

## Example CSV

```csv
Email Address,Ім'я та прізвище,Соц мережі відмітки,1. Список справ,2. Пункт зі списку,3. Прогулянка на свіжому повітрі,4. Список вдячності,5. Добра справа
john.doe@leobit.co,Іван Петренко,5,2024-12-01,2024-12-02,2024-12-03,2024-12-04,2024-12-05
jane.smith@leobit.co,Олена Іваненко,3,2024-12-01,2024-12-02,,,
bob.jones@leobit.co,Петро Сидоренко,0,2024-12-01,,,,
```

### Interpretation

| User | Tasks Completed | Position |
|------|----------------|----------|
| john.doe | 5 | 5 |
| jane.smith | 2 | 2 |
| bob.jones | 1 | 1 |

## Configuration

The CSV schema is configured in `/src/config/questConfig.ts`:

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
};
```

## Validation API

The application provides validation functions in `/src/domain/csvValidation.ts`:

- `validateRow(row, index)` - Validates a single row
- `validateCsvData(data)` - Validates entire dataset
- `filterValidRows(data)` - Filters out invalid rows
- `sanitizeRow(row)` - Provides defaults for missing optional fields
- `processCsvData(data)` - Complete validation and sanitization pipeline

## Monitoring

### Console Logs

The application logs validation results to the browser console:

- **Warnings**: Missing optional fields, invalid social points
- **Errors**: Missing required fields, invalid email format

### Validation Statistics

After each fetch, the application reports:
- Total row count
- Valid row count
- Invalid row count
- List of errors
- List of warnings

## Best Practices

1. **Consistent Column Names**: Do not change column names without code deployment
2. **Data Validation**: Validate data in Google Sheets before it's consumed by the app
3. **Task Naming**: Keep task column naming consistent (1., 2., 3., etc.)
4. **Null Values**: Use `null` or empty for incomplete tasks, not text like "No" or "0"
5. **Email Format**: Ensure all emails are valid Leobit employee emails
6. **Testing**: Test CSV changes with a small dataset first

## Future Improvements

- [ ] Schema versioning support
- [ ] Custom fallback avatar images
- [ ] Configurable column names via environment variables
- [ ] CSV schema validation at fetch time
- [ ] Admin UI for schema configuration
- [ ] Support for multiple languages in column names
