import { PrismaClient } from '@prisma/client';
import { AIQuotaStatusResponse, AdminCostMetricsResponse } from '@careerpilot/contracts';

export interface IWritingRepository {
  checkAndIncrementQuota(userId: string, limit?: number): Promise<{ allowed: boolean; status: AIQuotaStatusResponse }>;
  getQuotaStatus(userId: string, limit?: number): Promise<AIQuotaStatusResponse>;
  recordMetric(success: boolean, estimatedTokens?: number): Promise<void>;
  getAdminMetrics(): Promise<AdminCostMetricsResponse>;
  getResumeSnapshot(userId: string, resumeVersionId: string): Promise<any | null>;
  getJobExtractedData(userId: string, jobId: string): Promise<any | null>;
}

export class PrismaWritingRepository implements IWritingRepository {
  private readonly defaultLimit = 50;

  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  private getDailyReset(): Date {
    const d = new Date();
    d.setUTCHours(23, 59, 59, 999);
    return d;
  }

  async checkAndIncrementQuota(
    userId: string,
    limit = this.defaultLimit
  ): Promise<{ allowed: boolean; status: AIQuotaStatusResponse }> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const count = await this.prisma.auditEvent.count({
      where: {
        userId,
        action: 'AI_WRITING_REQUEST',
        createdAt: { gte: todayStart },
      },
    });

    const resetAt = this.getDailyReset().toISOString();
    if (count >= limit) {
      return {
        allowed: false,
        status: {
          dailyLimit: limit,
          usedToday: count,
          remainingToday: 0,
          resetAt,
        },
      };
    }

    // Log the request in audit event
    await this.prisma.auditEvent.create({
      data: {
        userId,
        action: 'AI_WRITING_REQUEST',
        targetType: 'AI_WRITING',
      },
    });

    const usedToday = count + 1;
    return {
      allowed: true,
      status: {
        dailyLimit: limit,
        usedToday,
        remainingToday: Math.max(0, limit - usedToday),
        resetAt,
      },
    };
  }

  async getQuotaStatus(userId: string, limit = this.defaultLimit): Promise<AIQuotaStatusResponse> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const count = await this.prisma.auditEvent.count({
      where: {
        userId,
        action: 'AI_WRITING_REQUEST',
        createdAt: { gte: todayStart },
      },
    });

    return {
      dailyLimit: limit,
      usedToday: count,
      remainingToday: Math.max(0, limit - count),
      resetAt: this.getDailyReset().toISOString(),
    };
  }

  async recordMetric(success: boolean, estimatedTokens = 400): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        action: success ? 'AI_METRIC_SUCCESS' : 'AI_METRIC_FAILURE',
        targetType: 'AI_METRIC',
        metadata: { estimatedTokens },
      },
    });
  }

  async getAdminMetrics(): Promise<AdminCostMetricsResponse> {
    const [successCount, failCount] = await Promise.all([
      this.prisma.auditEvent.count({ where: { action: 'AI_METRIC_SUCCESS' } }),
      this.prisma.auditEvent.count({ where: { action: 'AI_METRIC_FAILURE' } }),
    ]);

    const total = successCount + failCount;
    const estimatedTokens = total * 450;
    // Gemini 2.5 Flash free tier cost = $0.00; display estimated value at standard rate ($0.075 / 1M tokens)
    const estimatedCostUsd = parseFloat(((estimatedTokens / 1_000_000) * 0.075).toFixed(4));

    return {
      totalRequests: total,
      successfulRequests: successCount,
      failedRequests: failCount,
      estimatedTokens,
      estimatedCostUsd,
    };
  }

  async getResumeSnapshot(userId: string, resumeVersionId: string): Promise<any | null> {
    const version = await this.prisma.resumeVersion.findFirst({
      where: {
        id: resumeVersionId,
        resume: { userId },
      },
      select: { contentSnapshot: true },
    });
    return version ? version.contentSnapshot : null;
  }

  async getJobExtractedData(userId: string, jobId: string): Promise<any | null> {
    const job = await this.prisma.jobDescription.findFirst({
      where: { id: jobId, userId },
      select: { title: true, company: true, extractedData: true },
    });
    return job;
  }
}

// In-Memory Repository for hermetic testing
export class InMemoryWritingRepository implements IWritingRepository {
  public userUsage: Map<string, { count: number; date: string }> = new Map();
  public userResumes: Map<string, { userId: string; contentSnapshot: any }> = new Map();
  public userJobs: Map<string, { userId: string; title: string; company?: string; extractedData: any }> = new Map();
  public totalSuccess = 0;
  public totalFailure = 0;

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]!;
  }

  private getDailyReset(): string {
    const d = new Date();
    d.setUTCHours(23, 59, 59, 999);
    return d.toISOString();
  }

  async checkAndIncrementQuota(
    userId: string,
    limit = 50
  ): Promise<{ allowed: boolean; status: AIQuotaStatusResponse }> {
    const today = this.getTodayString();
    let record = this.userUsage.get(userId);

    if (!record || record.date !== today) {
      record = { count: 0, date: today };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        status: {
          dailyLimit: limit,
          usedToday: record.count,
          remainingToday: 0,
          resetAt: this.getDailyReset(),
        },
      };
    }

    record.count++;
    this.userUsage.set(userId, record);

    return {
      allowed: true,
      status: {
        dailyLimit: limit,
        usedToday: record.count,
        remainingToday: limit - record.count,
        resetAt: this.getDailyReset(),
      },
    };
  }

  async getQuotaStatus(userId: string, limit = 50): Promise<AIQuotaStatusResponse> {
    const today = this.getTodayString();
    const record = this.userUsage.get(userId);
    const count = record && record.date === today ? record.count : 0;

    return {
      dailyLimit: limit,
      usedToday: count,
      remainingToday: Math.max(0, limit - count),
      resetAt: this.getDailyReset(),
    };
  }

  async recordMetric(success: boolean, _estimatedTokens?: number): Promise<void> {
    if (success) this.totalSuccess++;
    else this.totalFailure++;
  }

  async getAdminMetrics(): Promise<AdminCostMetricsResponse> {
    const total = this.totalSuccess + this.totalFailure;
    const estimatedTokens = total * 450;
    const estimatedCostUsd = parseFloat(((estimatedTokens / 1_000_000) * 0.075).toFixed(4));

    return {
      totalRequests: total,
      successfulRequests: this.totalSuccess,
      failedRequests: this.totalFailure,
      estimatedTokens,
      estimatedCostUsd,
    };
  }

  async getResumeSnapshot(userId: string, resumeVersionId: string): Promise<any | null> {
    const res = this.userResumes.get(resumeVersionId);
    if (!res || res.userId !== userId) return null;
    return res.contentSnapshot;
  }

  async getJobExtractedData(userId: string, jobId: string): Promise<any | null> {
    const job = this.userJobs.get(jobId);
    if (!job || job.userId !== userId) return null;
    return job;
  }
}
