import { IdTokenClaims } from "oidc-client-ts";
import { IRowData, IUserDataWithPostition } from "../consts";
import { taskEvaluationService, userProgressService } from "../domain";

/**
 * Legacy mapper for backward compatibility
 * Maps raw row data to user position data
 * @deprecated Use taskEvaluationService.evaluateAllUsersProgress instead
 */
export const positionMapper = (
  jsonData: IRowData[]
): IUserDataWithPostition[] => {
  return taskEvaluationService.evaluateAllUsersProgress(jsonData);
};

/**
 * Maps users with position data to map task positions
 * Now uses domain services for business logic
 */
export const usersDataMapper = (jsonData: IRowData[], user: IdTokenClaims) => {
  const dataWithCurrentPosition = taskEvaluationService.evaluateAllUsersProgress(jsonData);
  const usersMappedData = userProgressService.mapUsersToPositions(
    dataWithCurrentPosition,
    user.sub
  );

  return usersMappedData;
};
