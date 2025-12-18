/**
 * Quest Business Rules Module
 * 
 * This module contains all business logic for the Well Being Quest.
 * It centralizes rules that were previously scattered across components and helpers.
 * 
 * See QUEST_RULES.md for detailed documentation of these rules.
 */

import { QUEST_CONFIG } from "../config/questConfig";
import { finishScreenTypes } from "../consts/enums";

/**
 * Determines if a task number represents the start position
 */
export function isStartPosition(taskNumber: number): boolean {
  return taskNumber === QUEST_CONFIG.START_POSITION;
}

/**
 * Determines if a task number represents the first finish milestone
 */
export function isFirstFinishMilestone(taskNumber: number): boolean {
  return taskNumber === QUEST_CONFIG.FIRST_FINISH_THRESHOLD;
}

/**
 * Determines if a task number represents the final completion
 */
export function isFinalCompletion(taskNumber: number): boolean {
  return taskNumber === QUEST_CONFIG.FINAL_COMPLETION_THRESHOLD;
}

/**
 * Determines if a task number triggers any finish screen
 */
export function triggersFinishScreen(taskNumber: number): boolean {
  return isFirstFinishMilestone(taskNumber) || isFinalCompletion(taskNumber);
}

/**
 * Determines if a user should be visible at a given position
 * 
 * Rule: Users at position 0 (start) are hidden unless they are the logged-in user
 * 
 * @param taskNumber - The user's current task position
 * @param userId - The user's ID
 * @param loggedUserId - The logged-in user's ID
 * @returns true if user should be visible, false if should be hidden
 */
export function shouldShowUser(
  taskNumber: number,
  userId: string,
  loggedUserId?: string
): boolean {
  if (!isStartPosition(taskNumber)) {
    return true; // Always show users not at start position
  }
  
  return userId === loggedUserId; // Only show logged-in user at start position
}

/**
 * Determines the appropriate finish screen type for a given task number
 * 
 * @param taskNumber - The user's current task position
 * @returns The finish screen type or null if no finish screen should be shown
 */
export function getFinishScreenType(taskNumber: number): string | null {
  if (isFirstFinishMilestone(taskNumber)) {
    return finishScreenTypes.finish;
  }
  
  if (isFinalCompletion(taskNumber)) {
    return finishScreenTypes.dzen;
  }
  
  return null;
}

/**
 * Determines if a finish screen should be shown for the logged-in user
 * 
 * @param taskNumber - The user's task position
 * @param isLoggedUser - Whether this is the logged-in user
 * @returns true if finish screen should be displayed
 */
export function shouldShowFinishScreen(
  taskNumber: number,
  isLoggedUser: boolean
): boolean {
  return isLoggedUser && triggersFinishScreen(taskNumber);
}

/**
 * Counts the number of completed tasks from a task data object
 * 
 * @param tasks - Object with task keys and completion values
 * @param taskKeys - Array of task keys in order
 * @returns Number of completed tasks (non-null values)
 */
export function countCompletedTasks(
  tasks: Record<string, unknown>,
  taskKeys: string[]
): number {
  return taskKeys.reduce((count, key) => {
    return tasks[key] !== null ? count + 1 : count;
  }, 0);
}

/**
 * Validates if a task position is within valid bounds
 * 
 * @param position - The position to validate
 * @returns true if position is valid (0 to TOTAL_POSITIONS - 1)
 */
export function isValidPosition(position: number): boolean {
  return (
    position >= QUEST_CONFIG.START_POSITION &&
    position < QUEST_CONFIG.TOTAL_POSITIONS
  );
}

/**
 * Normalizes a task position to ensure it's within valid bounds
 * 
 * @param position - The position to normalize
 * @returns A valid position (clamped to valid range)
 */
export function normalizePosition(position: number): number {
  if (position < QUEST_CONFIG.START_POSITION) {
    return QUEST_CONFIG.START_POSITION;
  }
  
  if (position >= QUEST_CONFIG.TOTAL_POSITIONS) {
    return QUEST_CONFIG.TOTAL_POSITIONS - 1;
  }
  
  return position;
}

/**
 * Determines if a user has completed the quest
 * 
 * @param taskNumber - The user's current task position
 * @returns true if quest is completed
 */
export function isQuestCompleted(taskNumber: number): boolean {
  return taskNumber === QUEST_CONFIG.FINAL_COMPLETION_THRESHOLD;
}

/**
 * Determines if a user has reached the first milestone
 * 
 * @param taskNumber - The user's current task position
 * @returns true if first milestone reached
 */
export function hasReachedFirstMilestone(taskNumber: number): boolean {
  return taskNumber >= QUEST_CONFIG.FIRST_FINISH_THRESHOLD;
}

/**
 * Gets progress information for a user
 * 
 * @param taskNumber - The user's current task position
 * @returns Progress information object
 */
export function getUserProgress(taskNumber: number): {
  position: number;
  isAtStart: boolean;
  hasStarted: boolean;
  hasReachedMilestone: boolean;
  isCompleted: boolean;
  completionPercentage: number;
} {
  const normalizedPosition = normalizePosition(taskNumber);
  const maxTasks = QUEST_CONFIG.TOTAL_POSITIONS - 1; // Exclude position 0
  
  return {
    position: normalizedPosition,
    isAtStart: isStartPosition(normalizedPosition),
    hasStarted: normalizedPosition > QUEST_CONFIG.START_POSITION,
    hasReachedMilestone: hasReachedFirstMilestone(normalizedPosition),
    isCompleted: isQuestCompleted(normalizedPosition),
    completionPercentage: (normalizedPosition / maxTasks) * 100,
  };
}
