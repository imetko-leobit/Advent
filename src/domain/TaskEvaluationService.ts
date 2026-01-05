/**
 * TaskEvaluationService
 * Handles task completion logic and position calculation
 */

import { RowData, UserProgress } from "./interfaces";

export class TaskEvaluationService {
  /**
   * Validates if an email is valid
   */
  private isValidEmail(email: string | null | undefined): boolean {
    return !!email && typeof email === "string" && email.includes("@");
  }

  /**
   * Extracts user ID from email
   */
  private extractUserId(email: string): string {
    return email.split("@")[0];
  }

  /**
   * Calculates current position based on completed tasks
   */
  private calculateTaskPosition(rowData: RowData): number {
    const tasksArray = Object.keys(rowData)
      .filter((key) => /^\d+\./.test(key))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const currentPosition = tasksArray.reduce((position, key) => {
      const value = (rowData as unknown as Record<string, string | number | null>)[key];
      return value !== null ? position + 1 : position;
    }, 0);

    return currentPosition > 0 ? currentPosition : 0;
  }

  /**
   * Evaluates user progress from raw row data
   */
  evaluateUserProgress(rowData: RowData): UserProgress | null {
    const email = rowData["Email Address"];

    // Filter out rows without email or with invalid email format
    if (!this.isValidEmail(email)) {
      return null;
    }

    const leobitUserId = this.extractUserId(email);
    const name = rowData[`Ім'я та прізвище`];
    const socialNetworkPoint = rowData["Соц мережі відмітки"] ?? 0;
    const taskNumber = this.calculateTaskPosition(rowData);

    return {
      taskNumber,
      id: leobitUserId,
      email,
      socialNetworkPoint,
      name,
    };
  }

  /**
   * Evaluates multiple users' progress from raw data
   */
  evaluateAllUsersProgress(rowsData: RowData[]): UserProgress[] {
    return rowsData
      .map((rowData) => this.evaluateUserProgress(rowData))
      .filter((progress): progress is UserProgress => progress !== null);
  }
}

// Export singleton instance
export const taskEvaluationService = new TaskEvaluationService();
