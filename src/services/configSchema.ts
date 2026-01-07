/**
 * Configuration Schema using Zod
 * 
 * Defines validation schemas for quest configurations
 * Uses Zod for runtime type validation with fallback to manual validation
 */

import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Task type schema
 */
const taskTypeSchema = z.enum(['core', 'extra', 'finish']);

/**
 * Task configuration schema
 */
const taskConfigSchema = z.object({
  id: z.number().int().min(0),
  label: z.string().min(1),
  type: taskTypeSchema,
});

/**
 * Finish animation coordinates schema
 */
const finishAnimationCoordinatesSchema = z.object({
  top: z.string(),
  left: z.string(),
});

/**
 * Finish animations schema
 */
const finishAnimationsSchema = z.object({
  finalFinish: finishAnimationCoordinatesSchema,
  firstFinish: finishAnimationCoordinatesSchema,
});

/**
 * Optional theme schema (for extended configs)
 */
const themeSchema = z.object({
  primary: z.string().optional(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
}).optional();

/**
 * Optional map marker schema
 */
const mapMarkerSchema = z.object({
  id: z.number(),
  label: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

/**
 * Optional map schema
 */
const mapSchema = z.object({
  image: z.string().optional(),
  markers: z.array(mapMarkerSchema).optional(),
}).optional();

/**
 * Optional rules schema
 */
const rulesSchema = z.object({
  steps: z.number().optional(),
  maxDailyPoints: z.number().optional(),
  completionReward: z.string().optional(),
}).optional();

/**
 * Complete quest configuration schema
 */
export const questConfigSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  taskCount: z.number().int().positive(),
  tasks: z.array(taskConfigSchema),
  finalTaskIds: z.array(z.number().int().min(0)),
  firstFinishTaskId: z.number().int().min(0),
  finalFinishTaskId: z.number().int().min(0),
  finishAnimations: finishAnimationsSchema,
  // Extended fields (optional)
  theme: themeSchema,
  map: mapSchema,
  rules: rulesSchema,
}).refine(
  (data) => data.tasks.length === data.taskCount,
  {
    message: 'Task count must match tasks array length',
    path: ['taskCount'],
  }
).refine(
  (data) => data.tasks.every((task, index) => task.id === index),
  {
    message: 'Task IDs must be sequential and match their array index',
    path: ['tasks'],
  }
).refine(
  (data) => data.finalTaskIds.every(id => id >= 0 && id < data.taskCount),
  {
    message: 'All final task IDs must be within valid range',
    path: ['finalTaskIds'],
  }
).refine(
  (data) => data.firstFinishTaskId >= 0 && data.firstFinishTaskId < data.taskCount,
  {
    message: 'First finish task ID must be within valid range',
    path: ['firstFinishTaskId'],
  }
).refine(
  (data) => data.finalFinishTaskId >= 0 && data.finalFinishTaskId < data.taskCount,
  {
    message: 'Final finish task ID must be within valid range',
    path: ['finalFinishTaskId'],
  }
).refine(
  (data) => {
    // Validate map markers if present
    if (data.map?.markers) {
      return data.map.markers.every(marker => 
        marker.x >= 0 && marker.x <= 100 && 
        marker.y >= 0 && marker.y <= 100
      );
    }
    return true;
  },
  {
    message: 'Map markers must have x and y coordinates between 0 and 100',
    path: ['map', 'markers'],
  }
);

/**
 * Type inferred from the schema
 */
export type QuestConfigSchemaType = z.infer<typeof questConfigSchema>;

/**
 * Validate quest configuration using Zod
 * 
 * @param data - The configuration data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateQuestConfigWithZod(data: unknown): {
  success: boolean;
  data?: QuestConfigSchemaType;
  errors?: string[];
} {
  try {
    const result = questConfigSchema.safeParse(data);
    
    if (result.success) {
      logger.info('ConfigSchema', 'Configuration validated successfully with Zod');
      return {
        success: true,
        data: result.data,
      };
    } else {
      const errors = result.error.issues.map((err) => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      logger.error('ConfigSchema', 'Validation failed', { errors });
      
      return {
        success: false,
        errors,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('ConfigSchema', 'Zod validation error', error);
    
    return {
      success: false,
      errors: [`Validation error: ${errorMessage}`],
    };
  }
}

/**
 * Manual validation fallback (if Zod is unavailable or fails)
 * This provides basic validation without Zod
 */
export function validateQuestConfigManual(data: unknown): {
  success: boolean;
  data?: unknown;
  errors?: string[];
} {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      errors: ['Configuration must be an object'],
    };
  }
  
  const config = data as Record<string, unknown>;
  
  // Required fields
  if (!config.name || typeof config.name !== 'string' || config.name.length === 0) {
    errors.push('name: Required field, must be a non-empty string');
  }
  
  if (!config.taskCount || typeof config.taskCount !== 'number' || config.taskCount <= 0) {
    errors.push('taskCount: Required field, must be a positive number');
  }
  
  if (!Array.isArray(config.tasks)) {
    errors.push('tasks: Required field, must be an array');
  } else {
    // Validate tasks array
    if (config.tasks.length !== config.taskCount) {
      errors.push('taskCount: Must match tasks array length');
    }
    
    config.tasks.forEach((task: unknown, index: number) => {
      if (!task || typeof task !== 'object') {
        errors.push(`tasks[${index}]: Must be an object`);
        return;
      }
      
      const t = task as Record<string, unknown>;
      
      if (typeof t.id !== 'number' || t.id !== index) {
        errors.push(`tasks[${index}].id: Must be ${index}`);
      }
      
      if (!t.label || typeof t.label !== 'string') {
        errors.push(`tasks[${index}].label: Required field, must be a string`);
      }
      
      if (!t.type || !['core', 'extra', 'finish'].includes(t.type as string)) {
        errors.push(`tasks[${index}].type: Must be 'core', 'extra', or 'finish'`);
      }
    });
  }
  
  if (!Array.isArray(config.finalTaskIds)) {
    errors.push('finalTaskIds: Required field, must be an array');
  }
  
  if (typeof config.firstFinishTaskId !== 'number') {
    errors.push('firstFinishTaskId: Required field, must be a number');
  }
  
  if (typeof config.finalFinishTaskId !== 'number') {
    errors.push('finalFinishTaskId: Required field, must be a number');
  }
  
  if (!config.finishAnimations || typeof config.finishAnimations !== 'object') {
    errors.push('finishAnimations: Required field, must be an object');
  } else {
    const fa = config.finishAnimations as Record<string, unknown>;
    
    if (!fa.finalFinish || typeof fa.finalFinish !== 'object') {
      errors.push('finishAnimations.finalFinish: Required field');
    }
    
    if (!fa.firstFinish || typeof fa.firstFinish !== 'object') {
      errors.push('finishAnimations.firstFinish: Required field');
    }
  }
  
  // Validate map markers if present
  if (config.map && typeof config.map === 'object') {
    const map = config.map as Record<string, unknown>;
    
    if (map.markers && Array.isArray(map.markers)) {
      map.markers.forEach((marker: unknown, index: number) => {
        if (!marker || typeof marker !== 'object') {
          return;
        }
        
        const m = marker as Record<string, unknown>;
        
        if (typeof m.x === 'number' && (m.x < 0 || m.x > 100)) {
          errors.push(`map.markers[${index}].x: Must be between 0 and 100`);
        }
        
        if (typeof m.y === 'number' && (m.y < 0 || m.y > 100)) {
          errors.push(`map.markers[${index}].y: Must be between 0 and 100`);
        }
      });
    }
  }
  
  if (errors.length > 0) {
    logger.error('ConfigSchema', 'Manual validation failed', { errors });
    return {
      success: false,
      errors,
    };
  }
  
  logger.info('ConfigSchema', 'Configuration validated successfully with manual validation');
  
  return {
    success: true,
    data: config,
  };
}
