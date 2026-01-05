import { IdTokenClaims } from "oidc-client-ts";
import { IRowData, IUserDataWithPostition, tasksEnum } from "../consts";
import { initialMapTaskPositions } from "../consts/taskPositions";

export const positionMapper = (
  jsonData: IRowData[]
): IUserDataWithPostition[] => {
  const dataWithUserPosition = jsonData
    .filter((rowData: IRowData) => rowData["Email Address"]) // Filter out rows without email
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

const userDataMapper = (
  users: IUserDataWithPostition[],
  loggedUser: IdTokenClaims
) => {
  const mapTaskPositions = JSON.parse(JSON.stringify(initialMapTaskPositions));

  users.forEach((userData) => {
    const imageUrl = `https://api.employee.leobit.co/photos-small/${userData.id}.png`;
    const { taskNumber, id, email, name, socialNetworkPoint } = userData;

    const isCurrentUserALoggedUser = userData.id === loggedUser.sub;
    const isUserAtTheStartPosition = taskNumber === 0;

    //It was decided that only the currently logged-in user should be visible at the starting position. This is done to prevent all users who wanted to take part in the quest but have not yet finished any tasks from being stacked at the beginning.
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
