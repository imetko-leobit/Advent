import { IdTokenClaims } from "oidc-client-ts";
import { IRowData, IUserDataWithPostition } from "../consts";
import { questEngine } from "../domain";

/**
 * Legacy mapper for backward compatibility
 * Maps raw row data to user position data
 * @deprecated Use questEngine.evaluateAllUsersProgress instead
 */
export const positionMapper = (
  jsonData: IRowData[]
): IUserDataWithPostition[] => {
  return questEngine.evaluateAllUsersProgress(jsonData);
};

/**
 * Maps users with position data to map task positions
 * Now uses QuestEngine for all business logic
 */
export const usersDataMapper = (
  jsonData: IRowData[], 
  user: IdTokenClaims,
  taskPositions: Array<{ taskNumber: number; cxPointers: number; cyPointers: number; cxStep: number; cyStep: number; }>
) => {
  // Evaluate all users' progress using QuestEngine
  const usersProgress = questEngine.evaluateAllUsersProgress(jsonData);
  
  // Group users by their positions on the map
  const usersMappedData = questEngine.groupUsersByPosition(
    usersProgress,
    user.sub,
    taskPositions
  );

  return usersMappedData;
};
