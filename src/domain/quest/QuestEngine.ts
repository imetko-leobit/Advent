/**
 * QuestEngine - Central Quest Domain Service
 * 
 * This is the single source of truth for all quest business rules.
 * It consolidates logic from TaskEvaluationService, UserProgressService, and FinishScreenService.
 * 
 * All quest behavior is controlled through this engine:
 * - User progress calculation
 * - Position determination
 * - Finish state logic
 * - User visibility rules
 * - Special task handling
 * 
 * The engine is pure - no React, no hooks, no side effects.
 */

import { questConfig } from "../../config";
import { avatarService } from "../AvatarService";
import {
  QuestRowData,
  QuestUserProgress,
  QuestUserInGroup,
  QuestTaskPosition,
  QuestFinishConfig,
  QuestAnimationCoordinates,
  GroupedUsers,
} from "./types";
import { finishScreenTypes } from "../../consts";

export class QuestEngine {
  /**
   * Validates if an email is valid
   */
  private isValidEmail(email: string | null | undefined): boolean {
    return !!email && typeof email === "string" && email.includes("@");
  }

  /**
   * Extracts user ID from email
   */
  private extractUserId(email: string): string {
    return email.split("@")[0];
  }

  /**
   * Calculates current position based on completed tasks
   * Returns the number of completed tasks (position in quest)
   */
  private calculateTaskPosition(rowData: QuestRowData): number {
    const tasksArray = Object.keys(rowData)
      .filter((key) => /^\d+\./.test(key))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const currentPosition = tasksArray.reduce((position, key) => {
      const value = (rowData as unknown as Record<string, string | number | null>)[key];
      return value !== null ? position + 1 : position;
    }, 0);

    return currentPosition > 0 ? currentPosition : 0;
  }

  /**
   * Gets user progress from raw row data
   * Returns null if the user data is invalid
   */
  getUserProgress(rowData: QuestRowData): QuestUserProgress | null {
    const email = rowData["Email Address"];

    // Filter out rows without email or with invalid email format
    if (!this.isValidEmail(email)) {
      return null;
    }

    const userId = this.extractUserId(email);
    const name = rowData[`Ім'я та прізвище`];
    const socialNetworkPoint = rowData["Соц мережі відмітки"] ?? 0;
    const taskNumber = this.calculateTaskPosition(rowData);

    return {
      taskNumber,
      id: userId,
      email,
      socialNetworkPoint,
      name,
    };
  }

  /**
   * Gets the current position (task number) for a user
   */
  getUserPosition(user: QuestUserProgress): number {
    return user.taskNumber;
  }

  /**
   * Checks if the user has finished the quest
   * A user is considered finished if they reached any of the final tasks
   */
  isQuestFinished(user: QuestUserProgress): boolean {
    return questConfig.finalTaskIds.includes(user.taskNumber);
  }

  /**
   * Gets the finish state configuration for a user
   * Returns configuration for finish screens based on task number
   */
  getFinishState(user: QuestUserProgress, isLoggedUser: boolean): QuestFinishConfig {
    if (!isLoggedUser) {
      return {
        type: "",
        taskNumber: 0,
        shouldShow: false,
      };
    }

    const taskNumber = user.taskNumber;

    // First finish screen (intermediate completion)
    if (taskNumber >= questConfig.firstFinishTaskId && taskNumber < questConfig.finalFinishTaskId) {
      return {
        type: finishScreenTypes.finish,
        taskNumber,
        shouldShow: true,
      };
    }

    // Final finish screen (ultimate completion - dzen)
    if (taskNumber === questConfig.finalFinishTaskId) {
      return {
        type: finishScreenTypes.dzen,
        taskNumber,
        shouldShow: true,
      };
    }

    return {
      type: "",
      taskNumber: 0,
      shouldShow: false,
    };
  }

  /**
   * Filters and returns visible users
   * 
   * Special rule: Only the logged-in user should be visible at the start position (task 0).
   * This prevents all users who haven't started from being stacked at the beginning.
   */
  getVisibleUsers(users: QuestUserProgress[], loggedUserId: string): QuestUserProgress[] {
    return users.filter((user) => {
      const isCurrentUserLoggedIn = user.id === loggedUserId;
      const isAtStartPosition = user.taskNumber === 0;

      // Hide users at start position unless they are the logged-in user
      if (isAtStartPosition && !isCurrentUserLoggedIn) {
        return false;
      }

      return true;
    });
  }

  /**
   * Groups users by their task positions on the map
   * Returns an array of task positions with users assigned to each
   * 
   * @param users - Array of user progress data
   * @param loggedUserId - ID of the currently logged-in user
   * @param taskPositions - Task positions from config (can be with or without users array)
   */
  groupUsersByPosition(
    users: QuestUserProgress[],
    loggedUserId: string,
    taskPositions: Partial<QuestTaskPosition>[]
  ): QuestTaskPosition[] {
    // Deep clone task positions from config to avoid mutation
    const positions: QuestTaskPosition[] = JSON.parse(JSON.stringify(taskPositions));

    // Initialize users array for each position
    positions.forEach((position) => {
      position.users = [];
    });

    // Filter visible users first
    const visibleUsers = this.getVisibleUsers(users, loggedUserId);

    // Assign users to their positions
    visibleUsers.forEach((userData) => {
      const imageUrl = avatarService.generateAvatarUrl(userData.id);
      const { taskNumber, id, email, name, socialNetworkPoint } = userData;

      // Guard against invalid task numbers
      if (taskNumber < 0 || taskNumber >= positions.length) {
        console.warn(
          `[QuestEngine] User ${id} has invalid task number ${taskNumber}. Valid range: 0-${positions.length - 1}`
        );
        return; // Skip this user
      }

      positions[taskNumber].users.push({
        email,
        id,
        name,
        socialNetworkPoint,
        taskNumber,
        imageUrl,
      });
    });

    return positions;
  }

  /**
   * Determines if a user should be separated from others at a task position
   * Logged users at special tasks (finish tasks) should be shown separately
   */
  shouldSeparateUser(taskNumber: number, userId: string, loggedUserId: string): boolean {
    const isLoggedUser = userId === loggedUserId;
    const isSpecialTask = questConfig.finalTaskIds.includes(taskNumber);
    return isLoggedUser && isSpecialTask;
  }

  /**
   * Checks if a task is a special/finish task
   */
  isSpecialTask(taskNumber: number): boolean {
    return questConfig.finalTaskIds.includes(taskNumber);
  }

  /**
   * Filters users at a specific position
   * Optionally separates the logged user from others
   */
  filterUsersAtPosition(
    users: QuestUserInGroup[],
    loggedUserId: string,
    shouldSeparate: boolean
  ): GroupedUsers {
    if (!shouldSeparate) {
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

  /**
   * Gets animation coordinates for finish screen close actions
   */
  getFinishAnimationCoordinates(
    screenType: string,
    taskNumber: number
  ): QuestAnimationCoordinates | null {
    if (screenType === finishScreenTypes.dzen) {
      return questConfig.finishAnimations.finalFinish;
    }

    if (screenType === finishScreenTypes.finish && taskNumber === questConfig.firstFinishTaskId) {
      return questConfig.finishAnimations.firstFinish;
    }

    return null;
  }

  /**
   * Evaluates progress for all users from raw data
   */
  evaluateAllUsersProgress(rowsData: QuestRowData[]): QuestUserProgress[] {
    return rowsData
      .map((rowData) => this.getUserProgress(rowData))
      .filter((progress): progress is QuestUserProgress => progress !== null);
  }
}

// Export singleton instance
export const questEngine = new QuestEngine();
