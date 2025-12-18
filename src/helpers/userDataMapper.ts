import { IdTokenClaims } from "oidc-client-ts";
import { IRowData, IUserDataWithPostition } from "../consts";
import { initialMapTaskPositions } from "../consts/taskPositions";
import { 
  extractUserIdFromEmail, 
  extractTaskColumns, 
  parseSocialNetworkPoints 
} from "../domain/csvValidation";
import { countCompletedTasks, normalizePosition } from "../domain/questRules";
import { CSV_SCHEMA, getEmployeePhotoUrl } from "../config/questConfig";

export const positionMapper = (
  jsonData: IRowData[]
): IUserDataWithPostition[] => {
  const dataWithUserPosition = jsonData.map((rowData: IRowData) => {
    const email = rowData[CSV_SCHEMA.REQUIRED_COLUMNS.EMAIL];
    const leobitUserId = extractUserIdFromEmail(email) || email.split("@")[0];

    const name = rowData[CSV_SCHEMA.REQUIRED_COLUMNS.NAME] || email;
    const socialNetworkPoint = parseSocialNetworkPoints(
      rowData[CSV_SCHEMA.OPTIONAL_COLUMNS.SOCIAL_NETWORK_POINTS]
    );

    const tasksArray = extractTaskColumns(rowData);

    const currentPosition = countCompletedTasks(rowData as unknown as Record<string, unknown>, tasksArray);

    return {
      taskNumber: normalizePosition(currentPosition),
      id: leobitUserId,
      email,
      socialNetworkPoint,
      name,
    };
  });

  return dataWithUserPosition;
};

const userDataMapper = (
  users: IUserDataWithPostition[],
  loggedUser: IdTokenClaims
) => {
  const mapTaskPositions = JSON.parse(JSON.stringify(initialMapTaskPositions));

  users.forEach((userData) => {
    const imageUrl = getEmployeePhotoUrl(userData.id);
    const { taskNumber, id, email, name, socialNetworkPoint } = userData;

    const isCurrentUserALoggedUser = userData.id === loggedUser.sub;
    const isUserAtTheStartPosition = taskNumber === 0;

    // Rule: Only the logged-in user is visible at the starting position.
    // This prevents cluttering the start with users who haven't completed any tasks.
    if (isUserAtTheStartPosition && !isCurrentUserALoggedUser) return;

    mapTaskPositions[taskNumber].users.push({
      email,
      id,
      name,
      socialNetworkPoint,
      taskNumber,
      imageUrl: imageUrl,
    });
  });

  return mapTaskPositions;
};

export const usersDataMapper = (jsonData: IRowData[], user: IdTokenClaims) => {
  const dataWithCurrentPosition = positionMapper(jsonData);

  const usersMappedData = userDataMapper(dataWithCurrentPosition, user);

  return usersMappedData;
};
