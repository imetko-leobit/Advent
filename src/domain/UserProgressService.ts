/**
 * UserProgressService
 * Handles user progress mapping and position calculations
 */

import { uiConfig } from "../config";
import { TaskPosition, UserProgress, UserInGroup } from "./interfaces";
import { avatarService } from "./AvatarService";

export class UserProgressService {
  /**
   * Maps users to their task positions on the map
   * @param users - Array of user progress data
   * @param loggedUserId - ID of the currently logged-in user
   * @returns Array of task positions with users
   */
  mapUsersToPositions(users: UserProgress[], loggedUserId: string): TaskPosition[] {
    // Deep clone task positions from config to avoid mutating the original
    const mapTaskPositions: TaskPosition[] = JSON.parse(
      JSON.stringify(uiConfig.taskPositions)
    );

    // Initialize users array for each position
    mapTaskPositions.forEach(position => {
      position.users = [];
    });

    users.forEach((userData) => {
      const imageUrl = avatarService.generateAvatarUrl(userData.id);
      const { taskNumber, id, email, name, socialNetworkPoint } = userData;

      const isCurrentUserALoggedUser = userData.id === loggedUserId;
      const isUserAtTheStartPosition = taskNumber === 0;

      // It was decided that only the currently logged-in user should be visible 
      // at the starting position. This is done to prevent all users who wanted 
      // to take part in the quest but have not yet finished any tasks from being 
      // stacked at the beginning.
      if (isUserAtTheStartPosition && !isCurrentUserALoggedUser) {
        return;
      }

      mapTaskPositions[taskNumber].users.push({
        email,
        id,
        name,
        socialNetworkPoint,
        taskNumber,
        imageUrl,
      });
    });

    return mapTaskPositions;
  }

  /**
   * Filters users at a specific position, separating logged user if needed
   */
  filterUsersAtPosition(
    users: UserInGroup[],
    loggedUserId: string,
    shouldSeparateLoggedUser: boolean
  ): { regularUsers: UserInGroup[]; loggedUser: UserInGroup | undefined } {
    if (!shouldSeparateLoggedUser) {
      return {
        regularUsers: users,
        loggedUser: undefined,
      };
    }

    const regularUsers = users.filter((u) => u.id !== loggedUserId);
    const loggedUser = users.find((u) => u.id === loggedUserId);

    return {
      regularUsers,
      loggedUser,
    };
  }
}

// Export singleton instance
export const userProgressService = new UserProgressService();
