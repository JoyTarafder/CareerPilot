import { z } from 'zod';
import { SupportedLocaleSchema } from './i18n.js';

export const NotificationPreferencesSchema = z.object({
  emailFollowUpReminders: z.boolean().default(true),
  emailInterviewReminders: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
  locale: SupportedLocaleSchema.default('en'),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const UpdateNotificationPreferencesRequestSchema = NotificationPreferencesSchema.partial();
export type UpdateNotificationPreferencesRequest = z.infer<typeof UpdateNotificationPreferencesRequestSchema>;

export interface NotificationPreferencesResponse {
  userId: string;
  preferences: NotificationPreferences;
  updatedAt: string;
}

export interface DispatchedReminderItem {
  applicationId: string;
  company: string;
  role: string;
  reminderType: 'FOLLOW_UP' | 'INTERVIEW';
  scheduledDateUtc: string;
  recipientEmail: string;
  status: 'SENT' | 'SKIPPED_BY_PREFERENCE';
}

export interface ReminderDispatchResult {
  processedCount: number;
  sentCount: number;
  skippedCount: number;
  dispatchedAt: string;
  items: DispatchedReminderItem[];
}
