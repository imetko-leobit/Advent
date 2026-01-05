/**
 * Domain layer interfaces
 * These interfaces represent the core business entities
 * Independent of UI framework and external dependencies
 */

import { IRowData, IUserDataWithPostition, IUserInGroupData, IMapTaskPosition } from "../consts";

/**
 * Represents a user's position and progress in the quest
 * This is an alias for the existing IUserDataWithPostition interface
 */
export type UserProgress = IUserDataWithPostition;

/**
 * Represents a user within a specific task position group
 * This is an alias for the existing IUserInGroupData interface
 */
export type UserInGroup = IUserInGroupData;

/**
 * Represents a task position on the map with all users at that position
 * This is an alias for the existing IMapTaskPosition interface
 */
export type TaskPosition = IMapTaskPosition;

/**
 * Raw row data from CSV/data source
 * This is an alias for the existing IRowData interface
 */
export type RowData = IRowData;

/**
 * Finish screen configuration
 */
export interface FinishScreenConfig {
  type: string;
  taskNumber: number;
  shouldShow: boolean;
}

/**
 * Animation coordinates for finish animations
 */
export interface AnimationCoordinates {
  top: string;
  left: string;
}
