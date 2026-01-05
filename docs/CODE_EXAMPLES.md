# Code Examples - Before & After Refactoring

This document shows concrete examples of how the code changed during the domain layer refactoring.

## Example 1: User Data Mapper

### BEFORE (userDataMapper.ts)
```typescript
// 77 lines of mixed concerns
export const positionMapper = (jsonData: IRowData[]): IUserDataWithPostition[] => {
  const dataWithUserPosition = jsonData
    .filter((rowData: IRowData) => {
      const email = rowData["Email Address"];
      // Filter out rows without email or with invalid email format
      return email && typeof email === "string" && email.includes("@");
    })
    .map((rowData: IRowData) => {
      const email = rowData["Email Address"];
      const leobitUserId = email.split("@")[0];
      const name = rowData[`Ім'я та прізвище`];
      const socialNetworkPoint = rowData["Соц мережі відмітки"] ?? 0;
      
      const tasksArray = Object.keys(rowData)
        .filter((key) => /^\d+\./.test(key))
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      
      const currentPosition = tasksArray.reduce((position, key) => {
        return rowData[key as tasksEnum] !== null ? position + 1 : position;
      }, 0);
      
      return {
        taskNumber: currentPosition > 0 ? currentPosition : 0,
        id: leobitUserId,
        email,
        socialNetworkPoint,
        name,
      };
    });
  
  return dataWithUserPosition;
};

const userDataMapper = (users: IUserDataWithPostition[], loggedUser: IdTokenClaims) => {
  const mapTaskPositions = JSON.parse(JSON.stringify(initialMapTaskPositions));
  
  users.forEach((userData) => {
    const imageUrl = `https://api.employee.leobit.co/photos-small/${userData.id}.png`;
    // ... more logic
  });
  
  return mapTaskPositions;
};
```

### AFTER (userDataMapper.ts)
```typescript
// 28 lines - delegates to domain services
import { taskEvaluationService, userProgressService } from "../domain";

export const positionMapper = (jsonData: IRowData[]): IUserDataWithPostition[] => {
  return taskEvaluationService.evaluateAllUsersProgress(jsonData);
};

export const usersDataMapper = (jsonData: IRowData[], user: IdTokenClaims) => {
  const dataWithCurrentPosition = taskEvaluationService.evaluateAllUsersProgress(jsonData);
  const usersMappedData = userProgressService.mapUsersToPositions(
    dataWithCurrentPosition,
    user.sub
  );
  return usersMappedData;
};
```

## Example 2: Stacked Pointers Component

### BEFORE (StackedPointers.tsx)
```typescript
const filterUserPointers = () => {
  const loggedUserId = user?.profile.sub;
  // Hardcoded special task numbers
  if (group.taskNumber === 9 || group.taskNumber === 14) {
    const filteredUsers = group.users.filter((u) => u.id !== loggedUserId);
    const findLoggedUser = group.users.find((u) => u.id == loggedUserId);
    setUsersWithoutLoggedUser(filteredUsers);
    setLoggedUser(findLoggedUser);
  } else {
    setUsersWithoutLoggedUser(group.users);
  }
};
```

### AFTER (StackedPointers.tsx)
```typescript
import { finishScreenService, userProgressService } from "../../domain";

const filterUserPointers = () => {
  const loggedUserId = user?.profile.sub;
  if (!loggedUserId) return;
  
  // Business logic delegated to domain service
  const shouldSeparate = finishScreenService.isSpecialTask(group.taskNumber);
  const { regularUsers, loggedUser: foundLoggedUser } = 
    userProgressService.filterUsersAtPosition(
      group.users,
      loggedUserId,
      shouldSeparate
    );
  
  setUsersWithoutLoggedUser(regularUsers);
  setLoggedUser(foundLoggedUser);
};
```

## Example 3: User Pointer Component

### BEFORE (UserPointer.tsx)
```typescript
const handleFinishScreenType = useCallback(() => {
  if (loggedUser) {
    // Hardcoded logic for finish screens
    if (taskNumber >= 9 && taskNumber < 14) {
      setFinishScreenType(finishScreenTypes.finish);
      if (taskNumber === 9) {
        setLoggedUserTaskNumber(taskNumber);
      }
    } else if (taskNumber === 14) {
      setFinishScreenType(finishScreenTypes.dzen);
    }
  }
}, [loggedUser, taskNumber]);

// Hardcoded special task checks in render
const moveLoggedUserToFinish =
  loggedUser &&
  finishCoordinates &&
  (user.taskNumber === 9 || user.taskNumber === 14);
```

### AFTER (UserPointer.tsx)
```typescript
import { finishScreenService } from "../../domain";

const handleFinishScreenType = useCallback(() => {
  if (!loggedUser) return;
  
  // Business logic delegated to domain service
  const finishConfig = finishScreenService.getFinishScreenConfig(
    taskNumber,
    loggedUser
  );
  
  if (finishConfig.shouldShow) {
    setFinishScreenType(finishConfig.type);
    if (finishConfig.taskNumber === 9) {
      setLoggedUserTaskNumber(finishConfig.taskNumber);
    }
  }
}, [loggedUser, taskNumber]);

// Clean check using domain service
const moveLoggedUserToFinish =
  loggedUser &&
  finishCoordinates &&
  finishScreenService.isSpecialTask(taskNumber);
```

## Example 4: Map Component

### BEFORE (Map.tsx)
```typescript
const handleCloseClick = () => {
  // Hardcoded coordinate logic
  if (finishScreenType === finishScreenTypes.dzen) {
    setUserPointerFinishAnimationCoordintes({
      top: "38%",
      left: "245%",
    });
  }
  if (finishScreenType === finishScreenTypes.finish && loggedUserTaskNumber === 9) {
    setUserPointerFinishAnimationCoordintes({
      top: "130%",
      left: "-75%",
    });
  }
  setFinishScreenType("");
  setFirstFinishScreenShow(false);
};
```

### AFTER (Map.tsx)
```typescript
import { finishScreenService } from "../domain";

const handleCloseClick = () => {
  // Business logic delegated to domain service
  const coordinates = finishScreenService.getFinishAnimationCoordinates(
    finishScreenType,
    loggedUserTaskNumber
  );
  
  if (coordinates) {
    setUserPointerFinishAnimationCoordintes(coordinates);
  }
  
  setFinishScreenType("");
  setFirstFinishScreenShow(false);
};
```

## Domain Layer Services

### TaskEvaluationService
```typescript
export class TaskEvaluationService {
  evaluateUserProgress(rowData: RowData): UserProgress | null {
    // Validates email
    // Extracts user ID
    // Calculates task position
    // Returns structured user progress
  }
  
  evaluateAllUsersProgress(rowsData: RowData[]): UserProgress[] {
    return rowsData
      .map((rowData) => this.evaluateUserProgress(rowData))
      .filter((progress): progress is UserProgress => progress !== null);
  }
}
```

### FinishScreenService
```typescript
export class FinishScreenService {
  private readonly FIRST_FINISH_TASK = 9;
  private readonly FINAL_FINISH_TASK = 14;
  
  isSpecialTask(taskNumber: number): boolean {
    return taskNumber === this.FIRST_FINISH_TASK || 
           taskNumber === this.FINAL_FINISH_TASK;
  }
  
  getFinishScreenConfig(taskNumber: number, isLoggedUser: boolean): FinishScreenConfig {
    // Returns finish screen configuration based on task number and user
  }
  
  getFinishAnimationCoordinates(screenType: string, taskNumber: number): AnimationCoordinates | null {
    // Returns animation coordinates for finish screen close action
  }
}
```

## Key Improvements

1. **Reduced Complexity**: userDataMapper.ts went from 77 lines to 28 lines (-64%)
2. **No Magic Numbers**: Special task numbers (9, 14) now checked via `isSpecialTask()`
3. **Testable**: All business logic can be tested independently
4. **Reusable**: Services can be used across different components
5. **Maintainable**: Changes to business rules happen in one place
6. **Type-Safe**: Strong TypeScript typing throughout
