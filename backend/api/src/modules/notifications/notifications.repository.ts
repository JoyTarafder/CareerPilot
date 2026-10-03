import { PrismaClient } from '@prisma/client';
import {
  NotificationPreferences,
  NotificationPreferencesResponse,
} from '@careerpilot/contracts';

export interface INotificationsRepository {
  getPreferences(userId: string): Promise<NotificationPreferencesResponse>;
  savePreferences(userId: string, prefs: NotificationPreferences): Promise<NotificationPreferencesResponse>;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailFollowUpReminders: true,
  emailInterviewReminders: true,
  weeklyDigest: true,
  locale: 'en',
};

export class PrismaNotificationsRepository implements INotificationsRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    const latestEvent = await this.prisma.auditEvent.findFirst({
      where: {
        userId,
        action: 'NOTIFICATION_PREFERENCES_UPDATED',
        targetType: 'USER_PREFERENCES',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestEvent || !latestEvent.metadata) {
      return {
        userId,
        preferences: { ...DEFAULT_PREFERENCES },
        updatedAt: new Date().toISOString(),
      };
    }

    const meta = latestEvent.metadata as any;
    return {
      userId,
      preferences: {
        emailFollowUpReminders: meta.emailFollowUpReminders ?? true,
        emailInterviewReminders: meta.emailInterviewReminders ?? true,
        weeklyDigest: meta.weeklyDigest ?? true,
        locale: meta.locale === 'bn' ? 'bn' : 'en',
      },
      updatedAt: latestEvent.createdAt.toISOString(),
    };
  }

  async savePreferences(userId: string, prefs: NotificationPreferences): Promise<NotificationPreferencesResponse> {
    const event = await this.prisma.auditEvent.create({
      data: {
        userId,
        action: 'NOTIFICATION_PREFERENCES_UPDATED',
        targetType: 'USER_PREFERENCES',
        metadata: prefs as any,
      },
    });

    return {
      userId,
      preferences: prefs,
      updatedAt: event.createdAt.toISOString(),
    };
  }
}

export class InMemoryNotificationsRepository implements INotificationsRepository {
  private preferences = new Map<string, { preferences: NotificationPreferences; updatedAt: string }>();

  async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    const record = this.preferences.get(userId);
    if (!record) {
      return {
        userId,
        preferences: { ...DEFAULT_PREFERENCES },
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      userId,
      preferences: { ...record.preferences },
      updatedAt: record.updatedAt,
    };
  }

  async savePreferences(userId: string, prefs: NotificationPreferences): Promise<NotificationPreferencesResponse> {
    const updatedAt = new Date().toISOString();
    this.preferences.set(userId, { preferences: prefs, updatedAt });
    return {
      userId,
      preferences: { ...prefs },
      updatedAt,
    };
  }
}
