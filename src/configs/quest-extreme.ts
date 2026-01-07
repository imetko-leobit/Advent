/**
 * Well Being Extreme Quest Configuration
 * 
 * A high-intensity wellness quest with extreme challenges and rewards
 */

import { tasksEnum } from "../consts";
import { QuestConfig } from "../config/quest.config";

/**
 * Extreme Quest Configuration
 * Features intense challenges, rapid progression, and extreme rewards
 */
export const extremeQuestConfig: QuestConfig = {
  // Quest metadata
  name: "WELL BEING EXTREME QUEST",
  taskCount: 15, // Tasks 0-14 (0 is the starting position)

  // Task definitions
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
   */
  finalTaskIds: [9, 14],

  /**
   * First finish task ID (intermediate finish screen)
   * Task 9 shows the first "finish" screen
   */
  firstFinishTaskId: 9,

  /**
   * Final finish task ID (ultimate completion screen)
   * Task 14 shows the "dzen" screen (ultimate completion)
   */
  finalFinishTaskId: 14,

  /**
   * Animation coordinates for finish screen close actions
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
 * Export as default for consistency with factory pattern
 */
export default extremeQuestConfig;

/**
 * Extreme Quest UI Theme Configuration
 * Note: These are exported for reference but not yet integrated into the UI rendering
 */
export const extremeQuestTheme = {
  primary: "#ff3b30", // Red - intense and energetic
  secondary: "#ffd60a", // Yellow - bright and motivating
  accent: "#4cd964", // Green - success and achievement
};

/**
 * Extreme Quest Map Configuration
 * Note: This is exported for reference but not yet integrated into the UI rendering
 */
export const extremeQuestMap = {
  image: "/assets/maps/extreme-map.svg",
  markers: [
    { id: 1, label: "Extreme Start", x: 10, y: 85, difficulty: "extreme" },
    { id: 2, label: "Power Challenge 1", x: 18, y: 72, difficulty: "hard" },
    { id: 3, label: "Intensity Peak", x: 25, y: 58, difficulty: "extreme" },
    { id: 4, label: "Endurance Test", x: 35, y: 45, difficulty: "hard" },
    { id: 5, label: "Mental Fortress", x: 42, y: 62, difficulty: "extreme" },
    { id: 6, label: "Speed Run", x: 38, y: 35, difficulty: "medium" },
    { id: 7, label: "Focus Zone", x: 30, y: 22, difficulty: "hard" },
    { id: 8, label: "Breakthrough Point", x: 48, y: 15, difficulty: "extreme" },
    { id: 9, label: "Victory Checkpoint", x: 62, y: 28, difficulty: "extreme" },
    { id: 10, label: "Elite Challenge", x: 55, y: 48, difficulty: "hard" },
    { id: 11, label: "Champion's Path", x: 65, y: 65, difficulty: "extreme" },
    { id: 12, label: "Ultimate Trial", x: 78, y: 58, difficulty: "extreme" },
    { id: 13, label: "Legendary Route", x: 82, y: 42, difficulty: "extreme" },
    { id: 14, label: "Supreme Summit", x: 75, y: 25, difficulty: "ultimate" },
  ],
};

/**
 * Extreme Quest Rules and Scoring
 * Note: This is exported for reference but not yet integrated into the scoring system
 */
export const extremeQuestRules = {
  maxDailyPoints: 7, // Higher daily limit for extreme challenges
  bonusThreshold: 20, // Points required for bonus rewards
  completionReward: "🏆 Super Finisher Badge",
  streakMultiplier: 2.0, // Double points for consecutive days
  perfectDayBonus: 5, // Bonus points for completing all daily tasks
  difficultyMultipliers: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    extreme: 3.0,
    ultimate: 5.0,
  },
};
