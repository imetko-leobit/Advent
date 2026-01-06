/**
 * Domain layer exports
 * Central export point for all domain services and interfaces
 */

// Interfaces
export * from "./interfaces";

// Quest Engine (Primary interface for quest business logic)
export * from "./quest";

// Legacy Services (kept for backward compatibility, prefer using QuestEngine)
export { taskEvaluationService, TaskEvaluationService } from "./TaskEvaluationService";
export { avatarService, AvatarService } from "./AvatarService";
export { finishScreenService, FinishScreenService } from "./FinishScreenService";
export { userProgressService, UserProgressService } from "./UserProgressService";
