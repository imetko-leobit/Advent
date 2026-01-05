/**
 * FinishScreenService
 * Handles finish screen and special task logic
 */

import { finishScreenTypes } from "../consts";
import { questConfig } from "../config";
import { AnimationCoordinates, FinishScreenConfig } from "./interfaces";

export class FinishScreenService {
  /**
   * Checks if a task is a special task (finish screen task)
   * Uses quest configuration to determine finish tasks
   */
  isSpecialTask(taskNumber: number): boolean {
    return questConfig.finalTaskIds.includes(taskNumber);
  }

  /**
   * Determines if a user should be separated from other users
   * (logged user at special tasks should be shown separately)
   */
  shouldSeparateUser(taskNumber: number, isLoggedUser: boolean): boolean {
    return isLoggedUser && this.isSpecialTask(taskNumber);
  }

  /**
   * Gets the finish screen configuration for a user
   */
  getFinishScreenConfig(taskNumber: number, isLoggedUser: boolean): FinishScreenConfig {
    if (!isLoggedUser) {
      return {
        type: "",
        taskNumber: 0,
        shouldShow: false,
      };
    }

    if (taskNumber >= questConfig.firstFinishTaskId && taskNumber < questConfig.finalFinishTaskId) {
      return {
        type: finishScreenTypes.finish,
        taskNumber,
        shouldShow: true,
      };
    }

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
   * Gets animation coordinates for finish screen close action
   */
  getFinishAnimationCoordinates(
    screenType: string,
    taskNumber: number
  ): AnimationCoordinates | null {
    if (screenType === finishScreenTypes.dzen) {
      return questConfig.finishAnimations.finalFinish;
    }

    if (screenType === finishScreenTypes.finish && taskNumber === questConfig.firstFinishTaskId) {
      return questConfig.finishAnimations.firstFinish;
    }

    return null;
  }
}

// Export singleton instance
export const finishScreenService = new FinishScreenService();
