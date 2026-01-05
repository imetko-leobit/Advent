# Domain Layer

This directory contains the business logic layer for the Well Being Quest application. The domain layer is independent of UI components, React, and external dependencies like OIDC.

## Structure

- **interfaces.ts** - Core domain type definitions and interfaces
- **TaskEvaluationService.ts** - Handles task completion logic and user progress evaluation
- **UserProgressService.ts** - Manages user positioning and map task assignments
- **AvatarService.ts** - Generates avatar URLs for users
- **FinishScreenService.ts** - Handles finish screen logic and special task rules
- **index.ts** - Central export point for all domain services

## Services

### TaskEvaluationService

Responsible for:
- Validating user email addresses
- Extracting user IDs from emails
- Calculating task completion positions
- Evaluating user progress from raw data

**Key Methods:**
- `evaluateUserProgress(rowData)` - Evaluates a single user's progress
- `evaluateAllUsersProgress(rowsData)` - Evaluates all users' progress

### UserProgressService

Responsible for:
- Mapping users to their task positions on the map
- Filtering users at specific positions
- Separating logged-in users when needed (for special tasks)

**Key Methods:**
- `mapUsersToPositions(users, loggedUserId)` - Maps users to map positions
- `filterUsersAtPosition(users, loggedUserId, shouldSeparate)` - Filters users at a position

### AvatarService

Responsible for:
- Generating avatar URLs for users

**Key Methods:**
- `generateAvatarUrl(userId)` - Generates the avatar URL for a user

### FinishScreenService

Responsible for:
- Identifying special tasks (tasks 9 and 14)
- Determining finish screen types
- Calculating animation coordinates for finish screens

**Key Methods:**
- `isSpecialTask(taskNumber)` - Checks if a task is special
- `shouldSeparateUser(taskNumber, isLoggedUser)` - Determines if a user should be shown separately
- `getFinishScreenConfig(taskNumber, isLoggedUser)` - Gets finish screen configuration
- `getFinishAnimationCoordinates(screenType, taskNumber)` - Gets animation coordinates

## Usage

All services are exported as singleton instances:

```typescript
import { 
  taskEvaluationService, 
  userProgressService, 
  avatarService, 
  finishScreenService 
} from '../domain';

// Use the services
const users = taskEvaluationService.evaluateAllUsersProgress(jsonData);
const positions = userProgressService.mapUsersToPositions(users, loggedUserId);
```

## Design Principles

1. **Independence** - Domain layer does not depend on UI framework (React) or OIDC
2. **Testability** - All functions accept data as parameters, no global state
3. **Reusability** - Services can be used across different UI implementations
4. **Clear Separation** - Business logic is separated from presentation logic
5. **Type Safety** - Strong TypeScript typing throughout

## Migration Notes

The domain layer uses type aliases to maintain compatibility with existing interfaces:
- `UserProgress` → `IUserDataWithPostition`
- `UserInGroup` → `IUserInGroupData`
- `TaskPosition` → `IMapTaskPosition`
- `RowData` → `IRowData`

This allows the domain layer to work seamlessly with existing code while providing a clear abstraction layer.
