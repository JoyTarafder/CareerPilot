import { PrismaClient, JobApplication, ApplicationStatus } from '@prisma/client';
import { ApplicationFilterQuery, ApplicationMetricsResponse } from '@careerpilot/contracts';

export interface CreateApplicationData {
  company: string;
  role: string;
  jobUrl?: string | null;
  status?: ApplicationStatus;
  salaryNote?: string | null;
  location?: string | null;
  appliedDate?: Date | null;
  followUpDate?: Date | null;
  interviewDate?: Date | null;
  notes?: string | null;
  resumeVersionId?: string | null;
  matchAnalysisId?: string | null;
}

export interface UpdateApplicationData {
  company?: string;
  role?: string;
  jobUrl?: string | null;
  status?: ApplicationStatus;
  salaryNote?: string | null;
  location?: string | null;
  appliedDate?: Date | null;
  followUpDate?: Date | null;
  interviewDate?: Date | null;
  notes?: string | null;
  resumeVersionId?: string | null;
  matchAnalysisId?: string | null;
}

export interface JobApplicationWithRelations extends JobApplication {
  resumeVersion?: {
    id: string;
    versionNumber: number;
    resume: {
      title: string;
    };
  } | null;
  matchAnalysis?: {
    id: string;
    score: number | null;
    scoringVersion: string;
  } | null;
}

export interface IApplicationsRepository {
  createApplication(userId: string, data: CreateApplicationData): Promise<JobApplicationWithRelations>;
  listApplications(
    userId: string,
    filter: ApplicationFilterQuery
  ): Promise<{ items: JobApplicationWithRelations[]; total: number; page: number; totalPages: number }>;
  getApplicationById(userId: string, id: string): Promise<JobApplicationWithRelations | null>;
  updateApplication(userId: string, id: string, data: UpdateApplicationData): Promise<JobApplicationWithRelations | null>;
  updateStatus(userId: string, id: string, status: ApplicationStatus): Promise<JobApplicationWithRelations | null>;
  deleteApplication(userId: string, id: string): Promise<boolean>;
  getMetrics(userId: string): Promise<ApplicationMetricsResponse>;
  getReminders(userId: string, fromDate: Date, toDate: Date): Promise<JobApplicationWithRelations[]>;
  verifyResumeVersionOwnership(userId: string, resumeVersionId: string): Promise<boolean>;
  verifyMatchAnalysisOwnership(userId: string, matchAnalysisId: string): Promise<boolean>;
}

export class PrismaApplicationsRepository implements IApplicationsRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async createApplication(userId: string, data: CreateApplicationData): Promise<JobApplicationWithRelations> {
    return this.prisma.jobApplication.create({
      data: {
        userId,
        company: data.company,
        role: data.role,
        jobUrl: data.jobUrl,
        status: data.status ?? ApplicationStatus.SAVED,
        salaryNote: data.salaryNote,
        location: data.location,
        appliedDate: data.appliedDate,
        followUpDate: data.followUpDate,
        interviewDate: data.interviewDate,
        notes: data.notes,
        resumeVersionId: data.resumeVersionId,
        matchAnalysisId: data.matchAnalysisId,
      },
      include: {
        resumeVersion: {
          select: {
            id: true,
            versionNumber: true,
            resume: {
              select: { title: true },
            },
          },
        },
        matchAnalysis: {
          select: {
            id: true,
            score: true,
            scoringVersion: true,
          },
        },
      },
    });
  }

  async listApplications(
    userId: string,
    filter: ApplicationFilterQuery
  ): Promise<{ items: JobApplicationWithRelations[]; total: number; page: number; totalPages: number }> {
    const where: any = { userId };
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.search) {
      where.OR = [
        { company: { contains: filter.search, mode: 'insensitive' } },
        { role: { contains: filter.search, mode: 'insensitive' } },
        { location: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [filter.sortBy]: filter.order };
    const skip = (filter.page - 1) * filter.limit;

    const [items, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        orderBy,
        skip,
        take: filter.limit,
        include: {
          resumeVersion: {
            select: {
              id: true,
              versionNumber: true,
              resume: { select: { title: true } },
            },
          },
          matchAnalysis: {
            select: {
              id: true,
              score: true,
              scoringVersion: true,
            },
          },
        },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return {
      items,
      total,
      page: filter.page,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }

  async getApplicationById(userId: string, id: string): Promise<JobApplicationWithRelations | null> {
    return this.prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        resumeVersion: {
          select: {
            id: true,
            versionNumber: true,
            resume: { select: { title: true } },
          },
        },
        matchAnalysis: {
          select: {
            id: true,
            score: true,
            scoringVersion: true,
          },
        },
      },
    });
  }

  async updateApplication(userId: string, id: string, data: UpdateApplicationData): Promise<JobApplicationWithRelations | null> {
    const existing = await this.prisma.jobApplication.findFirst({ where: { id, userId } });
    if (!existing) return null;

    return this.prisma.jobApplication.update({
      where: { id },
      data: {
        company: data.company,
        role: data.role,
        jobUrl: data.jobUrl,
        status: data.status,
        salaryNote: data.salaryNote,
        location: data.location,
        appliedDate: data.appliedDate,
        followUpDate: data.followUpDate,
        interviewDate: data.interviewDate,
        notes: data.notes,
        resumeVersionId: data.resumeVersionId,
        matchAnalysisId: data.matchAnalysisId,
      },
      include: {
        resumeVersion: {
          select: {
            id: true,
            versionNumber: true,
            resume: { select: { title: true } },
          },
        },
        matchAnalysis: {
          select: {
            id: true,
            score: true,
            scoringVersion: true,
          },
        },
      },
    });
  }

  async updateStatus(userId: string, id: string, status: ApplicationStatus): Promise<JobApplicationWithRelations | null> {
    const existing = await this.prisma.jobApplication.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const data: any = { status };
    if (status === ApplicationStatus.APPLIED && !existing.appliedDate) {
      data.appliedDate = new Date();
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data,
      include: {
        resumeVersion: {
          select: {
            id: true,
            versionNumber: true,
            resume: { select: { title: true } },
          },
        },
        matchAnalysis: {
          select: {
            id: true,
            score: true,
            scoringVersion: true,
          },
        },
      },
    });
  }

  async deleteApplication(userId: string, id: string): Promise<boolean> {
    const result = await this.prisma.jobApplication.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }

  async getMetrics(userId: string): Promise<ApplicationMetricsResponse> {
    const apps = await this.prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true },
    });

    return calculateApplicationMetrics(apps.map((a) => a.status));
  }

  async getReminders(userId: string, fromDate: Date, toDate: Date): Promise<JobApplicationWithRelations[]> {
    return this.prisma.jobApplication.findMany({
      where: {
        userId,
        OR: [
          { followUpDate: { gte: fromDate, lte: toDate } },
          { interviewDate: { gte: fromDate, lte: toDate } },
        ],
      },
      orderBy: { followUpDate: 'asc' },
      include: {
        resumeVersion: {
          select: {
            id: true,
            versionNumber: true,
            resume: { select: { title: true } },
          },
        },
        matchAnalysis: {
          select: {
            id: true,
            score: true,
            scoringVersion: true,
          },
        },
      },
    });
  }

  async verifyResumeVersionOwnership(userId: string, resumeVersionId: string): Promise<boolean> {
    const version = await this.prisma.resumeVersion.findFirst({
      where: {
        id: resumeVersionId,
        resume: { userId },
      },
    });
    return !!version;
  }

  async verifyMatchAnalysisOwnership(userId: string, matchAnalysisId: string): Promise<boolean> {
    const analysis = await this.prisma.matchAnalysis.findFirst({
      where: {
        id: matchAnalysisId,
        resumeVersion: {
          resume: { userId },
        },
      },
    });
    return !!analysis;
  }
}

export function calculateApplicationMetrics(statuses: ApplicationStatus[]): ApplicationMetricsResponse {
  const byStatus: Record<ApplicationStatus, number> = {
    SAVED: 0,
    APPLIED: 0,
    SCREENING: 0,
    ASSESSMENT: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  for (const s of statuses) {
    if (byStatus[s] !== undefined) {
      byStatus[s]++;
    }
  }

  const total = statuses.length;
  const active =
    byStatus.SAVED +
    byStatus.APPLIED +
    byStatus.SCREENING +
    byStatus.ASSESSMENT +
    byStatus.INTERVIEW;

  // Conversion definitions from ARCHITECTURE & PHASES:
  // Candidates who entered the pipeline (applied or beyond)
  const appliedAndBeyond =
    byStatus.APPLIED +
    byStatus.SCREENING +
    byStatus.ASSESSMENT +
    byStatus.INTERVIEW +
    byStatus.OFFER +
    byStatus.REJECTED;

  // Response: moved beyond initial applied state (screening, assessment, interview, offer, or rejection response)
  const responsesReceived =
    byStatus.SCREENING +
    byStatus.ASSESSMENT +
    byStatus.INTERVIEW +
    byStatus.OFFER +
    byStatus.REJECTED;

  // Interview stage reached
  const interviewsReached = byStatus.INTERVIEW + byStatus.OFFER;
  const offersReached = byStatus.OFFER;

  const responseRate = appliedAndBeyond > 0 ? Math.round((responsesReceived / appliedAndBeyond) * 100) : 0;
  const interviewRate = appliedAndBeyond > 0 ? Math.round((interviewsReached / appliedAndBeyond) * 100) : 0;
  const offerRate = appliedAndBeyond > 0 ? Math.round((offersReached / appliedAndBeyond) * 100) : 0;

  return {
    total,
    active,
    responseRate,
    interviewRate,
    offerRate,
    byStatus,
  };
}

// In-Memory Repository for hermetic testing
export class InMemoryApplicationsRepository implements IApplicationsRepository {
  public applications: Map<string, JobApplicationWithRelations> = new Map();
  public userResumes: Map<string, { userId: string; resumeTitle: string; versionNumber: number }> = new Map();
  public userAnalyses: Map<string, { userId: string; score: number | null; scoringVersion: string }> = new Map();

  async createApplication(userId: string, data: CreateApplicationData): Promise<JobApplicationWithRelations> {
    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    let resumeVersion = null;
    if (data.resumeVersionId && this.userResumes.has(data.resumeVersionId)) {
      const r = this.userResumes.get(data.resumeVersionId)!;
      resumeVersion = {
        id: data.resumeVersionId,
        versionNumber: r.versionNumber,
        resume: { title: r.resumeTitle },
      };
    }

    let matchAnalysis = null;
    if (data.matchAnalysisId && this.userAnalyses.has(data.matchAnalysisId)) {
      const a = this.userAnalyses.get(data.matchAnalysisId)!;
      matchAnalysis = {
        id: data.matchAnalysisId,
        score: a.score,
        scoringVersion: a.scoringVersion,
      };
    }

    const app: JobApplicationWithRelations = {
      id,
      userId,
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl ?? null,
      status: data.status ?? ApplicationStatus.SAVED,
      salaryNote: data.salaryNote ?? null,
      location: data.location ?? null,
      appliedDate: data.appliedDate ?? null,
      followUpDate: data.followUpDate ?? null,
      interviewDate: data.interviewDate ?? null,
      notes: data.notes ?? null,
      resumeVersionId: data.resumeVersionId ?? null,
      matchAnalysisId: data.matchAnalysisId ?? null,
      createdAt: now,
      updatedAt: now,
      resumeVersion,
      matchAnalysis,
    };

    this.applications.set(id, app);
    return app;
  }

  async listApplications(
    userId: string,
    filter: ApplicationFilterQuery
  ): Promise<{ items: JobApplicationWithRelations[]; total: number; page: number; totalPages: number }> {
    let items = Array.from(this.applications.values()).filter((a) => a.userId === userId);

    if (filter.status) {
      items = items.filter((a) => a.status === filter.status);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q))
      );
    }

    items.sort((a, b) => {
      const field = filter.sortBy;
      let valA = (a as any)[field];
      let valB = (b as any)[field];
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (!valA) return 1;
      if (!valB) return -1;
      if (filter.order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = items.length;
    const skip = (filter.page - 1) * filter.limit;
    const paginated = items.slice(skip, skip + filter.limit);

    return {
      items: paginated,
      total,
      page: filter.page,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }

  async getApplicationById(userId: string, id: string): Promise<JobApplicationWithRelations | null> {
    const app = this.applications.get(id);
    if (!app || app.userId !== userId) return null;
    return app;
  }

  async updateApplication(userId: string, id: string, data: UpdateApplicationData): Promise<JobApplicationWithRelations | null> {
    const app = this.applications.get(id);
    if (!app || app.userId !== userId) return null;

    let resumeVersion = app.resumeVersion;
    if (data.resumeVersionId !== undefined) {
      if (data.resumeVersionId && this.userResumes.has(data.resumeVersionId)) {
        const r = this.userResumes.get(data.resumeVersionId)!;
        resumeVersion = {
          id: data.resumeVersionId,
          versionNumber: r.versionNumber,
          resume: { title: r.resumeTitle },
        };
      } else {
        resumeVersion = null;
      }
    }

    let matchAnalysis = app.matchAnalysis;
    if (data.matchAnalysisId !== undefined) {
      if (data.matchAnalysisId && this.userAnalyses.has(data.matchAnalysisId)) {
        const a = this.userAnalyses.get(data.matchAnalysisId)!;
        matchAnalysis = {
          id: data.matchAnalysisId,
          score: a.score,
          scoringVersion: a.scoringVersion,
        };
      } else {
        matchAnalysis = null;
      }
    }

    const updated: JobApplicationWithRelations = {
      ...app,
      company: data.company ?? app.company,
      role: data.role ?? app.role,
      jobUrl: data.jobUrl !== undefined ? data.jobUrl : app.jobUrl,
      status: data.status ?? app.status,
      salaryNote: data.salaryNote !== undefined ? data.salaryNote : app.salaryNote,
      location: data.location !== undefined ? data.location : app.location,
      appliedDate: data.appliedDate !== undefined ? data.appliedDate : app.appliedDate,
      followUpDate: data.followUpDate !== undefined ? data.followUpDate : app.followUpDate,
      interviewDate: data.interviewDate !== undefined ? data.interviewDate : app.interviewDate,
      notes: data.notes !== undefined ? data.notes : app.notes,
      resumeVersionId: data.resumeVersionId !== undefined ? data.resumeVersionId : app.resumeVersionId,
      matchAnalysisId: data.matchAnalysisId !== undefined ? data.matchAnalysisId : app.matchAnalysisId,
      updatedAt: new Date(),
      resumeVersion,
      matchAnalysis,
    };

    this.applications.set(id, updated);
    return updated;
  }

  async updateStatus(userId: string, id: string, status: ApplicationStatus): Promise<JobApplicationWithRelations | null> {
    const app = this.applications.get(id);
    if (!app || app.userId !== userId) return null;

    let appliedDate = app.appliedDate;
    if (status === ApplicationStatus.APPLIED && !appliedDate) {
      appliedDate = new Date();
    }

    const updated: JobApplicationWithRelations = {
      ...app,
      status,
      appliedDate,
      updatedAt: new Date(),
    };

    this.applications.set(id, updated);
    return updated;
  }

  async deleteApplication(userId: string, id: string): Promise<boolean> {
    const app = this.applications.get(id);
    if (!app || app.userId !== userId) return false;
    this.applications.delete(id);
    return true;
  }

  async getMetrics(userId: string): Promise<ApplicationMetricsResponse> {
    const apps = Array.from(this.applications.values()).filter((a) => a.userId === userId);
    return calculateApplicationMetrics(apps.map((a) => a.status));
  }

  async getReminders(userId: string, fromDate: Date, toDate: Date): Promise<JobApplicationWithRelations[]> {
    const apps = Array.from(this.applications.values()).filter((a) => a.userId === userId);
    const fromTime = fromDate.getTime();
    const toTime = toDate.getTime();

    return apps.filter((a) => {
      const followUpTime = a.followUpDate ? a.followUpDate.getTime() : null;
      const interviewTime = a.interviewDate ? a.interviewDate.getTime() : null;

      const hasFollowUp = followUpTime !== null && followUpTime >= fromTime && followUpTime <= toTime;
      const hasInterview = interviewTime !== null && interviewTime >= fromTime && interviewTime <= toTime;
      return hasFollowUp || hasInterview;
    });
  }

  async verifyResumeVersionOwnership(userId: string, resumeVersionId: string): Promise<boolean> {
    const r = this.userResumes.get(resumeVersionId);
    return r !== undefined && r.userId === userId;
  }

  async verifyMatchAnalysisOwnership(userId: string, matchAnalysisId: string): Promise<boolean> {
    const a = this.userAnalyses.get(matchAnalysisId);
    return a !== undefined && a.userId === userId;
  }
}
