/**
 * Configuration Validator
 * Validates quest configuration at startup to fail fast with clear error messages
 */

import { questConfig, QuestConfig } from "../config/quest.config";

export interface ConfigValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationError[];
}

/**
 * Validates the quest configuration
 * Ensures all required fields are present and consistent
 */
export function validateQuestConfig(config: QuestConfig = questConfig): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];
  const warnings: ConfigValidationError[] = [];

  // Validate task count
  if (!config.taskCount || config.taskCount <= 0) {
    errors.push({
      field: "taskCount",
      message: "Task count must be a positive number",
      severity: "error",
    });
  }

  // Validate tasks array exists
  if (!config.tasks || !Array.isArray(config.tasks)) {
    errors.push({
      field: "tasks",
      message: "Tasks array is required and must be an array",
      severity: "error",
    });
    // Cannot continue validation without tasks
    return { isValid: false, errors, warnings };
  }

  // Validate task count matches tasks array length
  if (config.tasks.length !== config.taskCount) {
    errors.push({
      field: "tasks",
      message: `Task count (${config.taskCount}) does not match tasks array length (${config.tasks.length})`,
      severity: "error",
    });
  }

  // Validate each task
  config.tasks.forEach((task, index) => {
    if (task.id !== index) {
      errors.push({
        field: `tasks[${index}].id`,
        message: `Task ID (${task.id}) does not match expected index (${index})`,
        severity: "error",
      });
    }

    if (!task.label) {
      errors.push({
        field: `tasks[${index}].label`,
        message: `Task at index ${index} is missing a label`,
        severity: "error",
      });
    }

    if (!task.type || !["core", "extra", "finish"].includes(task.type)) {
      errors.push({
        field: `tasks[${index}].type`,
        message: `Task at index ${index} has invalid type: ${task.type}`,
        severity: "error",
      });
    }
  });

  // Validate final task IDs
  if (!config.finalTaskIds || !Array.isArray(config.finalTaskIds)) {
    errors.push({
      field: "finalTaskIds",
      message: "Final task IDs must be an array",
      severity: "error",
    });
  } else {
    config.finalTaskIds.forEach((taskId) => {
      if (taskId < 0 || taskId >= config.taskCount) {
        errors.push({
          field: "finalTaskIds",
          message: `Final task ID ${taskId} is out of range (0-${config.taskCount - 1})`,
          severity: "error",
        });
      }
    });
  }

  // Validate first finish task ID
  if (
    config.firstFinishTaskId < 0 ||
    config.firstFinishTaskId >= config.taskCount
  ) {
    errors.push({
      field: "firstFinishTaskId",
      message: `First finish task ID ${config.firstFinishTaskId} is out of range (0-${config.taskCount - 1})`,
      severity: "error",
    });
  }

  // Validate final finish task ID
  if (
    config.finalFinishTaskId < 0 ||
    config.finalFinishTaskId >= config.taskCount
  ) {
    errors.push({
      field: "finalFinishTaskId",
      message: `Final finish task ID ${config.finalFinishTaskId} is out of range (0-${config.taskCount - 1})`,
      severity: "error",
    });
  }

  // Validate finish task IDs contain the configured finish tasks
  if (config.finalTaskIds && Array.isArray(config.finalTaskIds)) {
    if (!config.finalTaskIds.includes(config.firstFinishTaskId)) {
      warnings.push({
        field: "firstFinishTaskId",
        message: `First finish task ID ${config.firstFinishTaskId} is not in finalTaskIds array`,
        severity: "warning",
      });
    }

    if (!config.finalTaskIds.includes(config.finalFinishTaskId)) {
      warnings.push({
        field: "finalFinishTaskId",
        message: `Final finish task ID ${config.finalFinishTaskId} is not in finalTaskIds array`,
        severity: "warning",
      });
    }
  }

  // Validate finish animations
  if (!config.finishAnimations) {
    errors.push({
      field: "finishAnimations",
      message: "Finish animations configuration is required",
      severity: "error",
    });
  } else {
    if (!config.finishAnimations.finalFinish) {
      errors.push({
        field: "finishAnimations.finalFinish",
        message: "Final finish animation coordinates are required",
        severity: "error",
      });
    }
    if (!config.finishAnimations.firstFinish) {
      errors.push({
        field: "finishAnimations.firstFinish",
        message: "First finish animation coordinates are required",
        severity: "error",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Throws an error if configuration is invalid
 * Should be called at application startup
 */
export function assertValidConfig(config: QuestConfig = questConfig): void {
  const result = validateQuestConfig(config);

  if (result.warnings.length > 0) {
    // Use console.warn for startup warnings to ensure visibility
    // before the logger is fully initialized
    console.warn("[ConfigValidator] Configuration warnings:");
    result.warnings.forEach((warning) => {
      console.warn(`  - ${warning.field}: ${warning.message}`);
    });
  }

  if (!result.isValid) {
    // Use console.error for startup errors to ensure visibility
    // before the logger is fully initialized
    console.error("[ConfigValidator] Configuration validation failed:");
    result.errors.forEach((error) => {
      console.error(`  - ${error.field}: ${error.message}`);
    });
    throw new Error(
      "Quest configuration is invalid. Please check the configuration in src/config/quest.config.ts"
    );
  }
}
