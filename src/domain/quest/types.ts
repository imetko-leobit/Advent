/**
 * Quest Domain Types
 * 
 * Core type definitions for the quest domain logic.
 * These types represent the business entities and rules independent of UI.
 */

import { IRowData, IUserDataWithPostition, IUserInGroupData, IMapTaskPosition } from "../../consts";

/**
 * Raw row data from data provider (CSV/Google Sheets)
 */
export type QuestRowData = IRowData;

/**
 * User progress data with current position
 */
export type QuestUserProgress = IUserDataWithPostition;

/**
 * User data within a position group
 */
export type QuestUserInGroup = IUserInGroupData;

/**
 * Task position on the map with users
 */
export type QuestTaskPosition = IMapTaskPosition;

/**
 * Finish screen configuration
 */
export interface QuestFinishConfig {
  type: string;
  taskNumber: number;
  shouldShow: boolean;
}

/**
 * Animation coordinates
 */
export interface QuestAnimationCoordinates {
  top: string;
  left: string;
}

/**
 * Grouped users result
 */
export interface GroupedUsers {
  regularUsers: QuestUserInGroup[];
  loggedUser: QuestUserInGroup | undefined;
}

/**
 * Quest state for a user
 */
export interface QuestUserState {
  userId: string;
  email: string;
  name: string;
  taskNumber: number;
  socialNetworkPoint: number;
  isFinished: boolean;
  finishState?: QuestFinishConfig;
}
