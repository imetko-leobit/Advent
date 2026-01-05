/**
 * AvatarService
 * Handles avatar URL generation
 */

export class AvatarService {
  private readonly baseUrl = "https://api.employee.leobit.co/photos-small";

  /**
   * Generates avatar URL for a user
   */
  generateAvatarUrl(userId: string): string {
    return `${this.baseUrl}/${userId}.png`;
  }
}

// Export singleton instance
export const avatarService = new AvatarService();
