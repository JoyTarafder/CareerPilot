import {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesRequest,
  UpdateNotificationPreferencesRequestSchema,
  ReminderDispatchResult,
  DispatchedReminderItem,
} from '@careerpilot/contracts';
import { INotificationsRepository } from './notifications.repository.js';
import { IApplicationsRepository } from '../applications/applications.repository.js';
import { IAuthRepository } from '../auth/auth.repository.js';
import { ValidationError } from '../../core/errors.js';

export class NotificationsService {
  constructor(
    private readonly repo: INotificationsRepository,
    private readonly applicationsRepo: IApplicationsRepository,
    private readonly authRepo: IAuthRepository
  ) {}

  async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    return this.repo.getPreferences(userId);
  }

  async updatePreferences(
    userId: string,
    rawRequest: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    const parsed = UpdateNotificationPreferencesRequestSchema.safeParse(rawRequest);
    if (!parsed.success) {
      throw new ValidationError('Invalid notification preferences payload', parsed.error.flatten().fieldErrors);
    }

    const current = await this.repo.getPreferences(userId);
    const merged = {
      ...current.preferences,
      ...parsed.data,
    };

    return this.repo.savePreferences(userId, merged);
  }

  async dispatchReminders(targetUserId?: string, daysWindow = 7): Promise<ReminderDispatchResult> {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + daysWindow * 24 * 60 * 60 * 1000);

    const items: DispatchedReminderItem[] = [];
    let sentCount = 0;
    let skippedCount = 0;

    // Scan applications for reminders
    const userIdsToScan: string[] = [];
    if (targetUserId) {
      userIdsToScan.push(targetUserId);
    }

    for (const uid of userIdsToScan) {
      const user = await this.authRepo.findUserById(uid);
      const recipientEmail = user?.email || 'candidate@careerpilot.dev';
      const prefs = (await this.repo.getPreferences(uid)).preferences;

      const upcomingApps = await this.applicationsRepo.getReminders(uid, now, futureLimit);

      for (const app of upcomingApps) {
        if (app.followUpDate && app.followUpDate >= now && app.followUpDate <= futureLimit) {
          const isEnabled = prefs.emailFollowUpReminders;
          const status = isEnabled ? 'SENT' : 'SKIPPED_BY_PREFERENCE';
          if (isEnabled) sentCount++;
          else skippedCount++;

          items.push({
            applicationId: app.id,
            company: app.company,
            role: app.role,
            reminderType: 'FOLLOW_UP',
            scheduledDateUtc: app.followUpDate.toISOString(),
            recipientEmail,
            status,
          });
        }

        if (app.interviewDate && app.interviewDate >= now && app.interviewDate <= futureLimit) {
          const isEnabled = prefs.emailInterviewReminders;
          const status = isEnabled ? 'SENT' : 'SKIPPED_BY_PREFERENCE';
          if (isEnabled) sentCount++;
          else skippedCount++;

          items.push({
            applicationId: app.id,
            company: app.company,
            role: app.role,
            reminderType: 'INTERVIEW',
            scheduledDateUtc: app.interviewDate.toISOString(),
            recipientEmail,
            status,
          });
        }
      }
    }

    return {
      processedCount: items.length,
      sentCount,
      skippedCount,
      dispatchedAt: new Date().toISOString(),
      items,
    };
  }
}
