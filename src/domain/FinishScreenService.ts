/**
 * FinishScreenService
 * Handles finish screen and special task logic
 */

import { finishScreenTypes } from "../consts";
import { AnimationCoordinates, FinishScreenConfig } from "./interfaces";

export class FinishScreenService {
  /**
   * Special task numbers that trigger finish screens
   */
  private readonly FIRST_FINISH_TASK = 9;
  private readonly FINAL_FINISH_TASK = 14;

  /**
   * Checks if a task is a special task (finish screen task)
   */
  isSpecialTask(taskNumber: number): boolean {
    return taskNumber === this.FIRST_FINISH_TASK || taskNumber === this.FINAL_FINISH_TASK;
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

    if (taskNumber >= this.FIRST_FINISH_TASK && taskNumber < this.FINAL_FINISH_TASK) {
      return {
        type: finishScreenTypes.finish,
        taskNumber,
        shouldShow: true,
      };
    }

    if (taskNumber === this.FINAL_FINISH_TASK) {
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
      return {
        top: "38%",
        left: "245%",
      };
    }

    if (screenType === finishScreenTypes.finish && taskNumber === this.FIRST_FINISH_TASK) {
      return {
        top: "130%",
        left: "-75%",
      };
    }

    return null;
  }
}

// Export singleton instance
export const finishScreenService = new FinishScreenService();
