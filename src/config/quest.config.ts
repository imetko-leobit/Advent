/**
 * Quest Configuration
 * 
 * This file centralizes all quest-specific configuration including:
 * - Task definitions and metadata
 * - Final/finish task identifiers
 * - Task type classifications
 * - Finish screen animation coordinates
 * 
 * By modifying this file, developers can:
 * - Add or modify tasks without touching component logic
 * - Change finish screen behavior and animations
 * - Update task types and classifications
 * 
 * Used by:
 * - FinishScreenService: Determines finish screen logic and animations
 * - UserPointer: Handles user pointer animations for finish tasks
 * - StackedPointers: Filters and separates users at special tasks
 */

import { tasksEnum } from "../consts";

/**
 * Task type definitions
 */
export type TaskType = "core" | "extra" | "finish";

/**
 * Task configuration interface
 */
export interface TaskConfig {
  /** Unique task identifier (0-based index) */
  id: number;
  /** Human-readable task label */
  label: tasksEnum;
  /** Task type classification */
  type: TaskType;
}

/**
 * Animation coordinates for finish screen transitions
 */
export interface FinishAnimationCoordinates {
  /** Final finish task animation coordinates (task 14 - dzen screen) */
  finalFinish: {
    top: string;
    left: string;
  };
  /** First finish task animation coordinates (task 9 - finish screen) */
  firstFinish: {
    top: string;
    left: string;
  };
}

/**
 * Quest configuration interface
 */
export interface QuestConfig {
  /** Quest name/title */
  name: string;
  /** Total number of tasks in the quest */
  taskCount: number;
  /** Array of all task configurations */
  tasks: TaskConfig[];
  /** Array of task IDs that represent final/finish states */
  finalTaskIds: number[];
  /** First finish task ID (intermediate finish screen) */
  firstFinishTaskId: number;
  /** Final finish task ID (ultimate completion screen) */
  finalFinishTaskId: number;
  /** Animation coordinates for finish screen close actions */
  finishAnimations: FinishAnimationCoordinates;
}

/**
 * Well Being Quest Configuration
 * 
 * Modify these values to update quest behavior across the application
 */
export const questConfig: QuestConfig = {
  // Quest metadata
  name: "Well Being Quest",
  taskCount: 15, // Tasks 0-14 (0 is the starting position)

  // Task definitions
  // Each task has an id, label, and type classification
  tasks: [
    {
      id: 0,
      label: tasksEnum.initialPosition,
      type: "core",
    },
    {
      id: 1,
      label: tasksEnum.todoList,
      type: "core",
    },
    {
      id: 2,
      label: tasksEnum.taskFromList,
      type: "core",
    },
    {
      id: 3,
      label: tasksEnum.freshAirWalk,
      type: "core",
    },
    {
      id: 4,
      label: tasksEnum.gratitudeList,
      type: "core",
    },
    {
      id: 5,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 6,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 7,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 8,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 9,
      label: tasksEnum.goodDeed,
      type: "finish", // First finish screen (intermediate completion)
    },
    {
      id: 10,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 11,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 12,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 13,
      label: tasksEnum.goodDeed,
      type: "extra",
    },
    {
      id: 14,
      label: tasksEnum.goodDeed,
      type: "finish", // Final finish screen (ultimate completion - dzen)
    },
  ],

  /**
   * Final task IDs that trigger finish screens
   * Used by: FinishScreenService, StackedPointers, UserPointer
   */
  finalTaskIds: [9, 14],

  /**
   * First finish task ID (intermediate finish screen)
   * Task 9 shows the first "finish" screen
   * Used by: FinishScreenService, UserPointer
   */
  firstFinishTaskId: 9,

  /**
   * Final finish task ID (ultimate completion screen)
   * Task 14 shows the "dzen" screen (ultimate completion)
   * Used by: FinishScreenService
   */
  finalFinishTaskId: 14,

  /**
   * Animation coordinates for finish screen close actions
   * These coordinates define where the user pointer animates to when closing finish screens
   * Used by: FinishScreenService.getFinishAnimationCoordinates()
   */
  finishAnimations: {
    // Final finish task (14) - dzen screen close animation
    finalFinish: {
      top: "38%",
      left: "245%",
    },
    // First finish task (9) - finish screen close animation
    firstFinish: {
      top: "130%",
      left: "-75%",
    },
  },
};

/**
 * Helper function to check if a task is a finish task
 * @param taskId - The task ID to check
 * @returns True if the task is a finish task
 */
export const isFinishTask = (taskId: number): boolean => {
  // Guard against invalid task IDs
  if (taskId < 0 || taskId >= questConfig.taskCount) {
    console.warn(`[QuestConfig] isFinishTask called with invalid task ID: ${taskId}`);
    return false;
  }
  return questConfig.finalTaskIds.includes(taskId);
};

/**
 * Helper function to get task configuration by ID
 * @param taskId - The task ID to retrieve
 * @returns Task configuration or undefined if not found
 */
export const getTaskById = (taskId: number): TaskConfig | undefined => {
  // Guard against invalid task IDs
  if (taskId < 0 || taskId >= questConfig.taskCount) {
    console.warn(`[QuestConfig] getTaskById called with invalid task ID: ${taskId}`);
    return undefined;
  }
  return questConfig.tasks.find(task => task.id === taskId);
};

/**
 * Helper function to get all tasks of a specific type
 * @param type - The task type to filter by
 * @returns Array of tasks matching the type
 */
export const getTasksByType = (type: TaskType): TaskConfig[] => {
  if (!type) {
    console.warn(`[QuestConfig] getTasksByType called with invalid type: ${type}`);
    return [];
  }
  return questConfig.tasks.filter(task => task.type === type);
};
