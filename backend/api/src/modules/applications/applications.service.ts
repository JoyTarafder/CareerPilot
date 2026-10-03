import {
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  ApplicationFilterQuery,
  ApplicationStatus,
  JobApplicationResponse,
  ApplicationMetricsResponse,
} from '@careerpilot/contracts';
import {
  IApplicationsRepository,
  JobApplicationWithRelations,
  CreateApplicationData,
  UpdateApplicationData,
} from './applications.repository.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../core/errors.js';

export class ApplicationsService {
  constructor(private readonly repo: IApplicationsRepository) {}

  private parseDate(dateStr?: string | null): Date | null | undefined {
    if (dateStr === undefined) return undefined;
    if (dateStr === null || dateStr === '') return null;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError(`Invalid date format: ${dateStr}`);
    }
    return parsed;
  }

  private mapToResponse(app: JobApplicationWithRelations): JobApplicationResponse {
    return {
      id: app.id,
      userId: app.userId,
      company: app.company,
      role: app.role,
      jobUrl: app.jobUrl,
      status: app.status as ApplicationStatus,
      salaryNote: app.salaryNote,
      location: app.location,
      appliedDate: app.appliedDate ? app.appliedDate.toISOString() : null,
      followUpDate: app.followUpDate ? app.followUpDate.toISOString() : null,
      interviewDate: app.interviewDate ? app.interviewDate.toISOString() : null,
      notes: app.notes,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      resumeVersionId: app.resumeVersionId,
      resumeVersion: app.resumeVersion
        ? {
            id: app.resumeVersion.id,
            versionNumber: app.resumeVersion.versionNumber,
            resumeTitle: app.resumeVersion.resume.title,
          }
        : null,
      matchAnalysisId: app.matchAnalysisId,
      matchAnalysis: app.matchAnalysis
        ? {
            id: app.matchAnalysis.id,
            score: app.matchAnalysis.score,
            scoringVersion: app.matchAnalysis.scoringVersion,
          }
        : null,
    };
  }

  async createApplication(userId: string, dto: CreateJobApplicationRequest): Promise<JobApplicationResponse> {
    if (dto.resumeVersionId) {
      const isOwner = await this.repo.verifyResumeVersionOwnership(userId, dto.resumeVersionId);
      if (!isOwner) {
        throw new ForbiddenError('Resume version does not exist or is not owned by candidate');
      }
    }

    if (dto.matchAnalysisId) {
      const isOwner = await this.repo.verifyMatchAnalysisOwnership(userId, dto.matchAnalysisId);
      if (!isOwner) {
        throw new ForbiddenError('Match analysis does not exist or is not owned by candidate');
      }
    }

    let appliedDate = this.parseDate(dto.appliedDate);
    const followUpDate = this.parseDate(dto.followUpDate);
    const interviewDate = this.parseDate(dto.interviewDate);

    // Auto-set appliedDate if transitioning directly to APPLIED or beyond
    if (!appliedDate && dto.status && dto.status !== 'SAVED') {
      appliedDate = new Date();
    }

    const data: CreateApplicationData = {
      company: dto.company,
      role: dto.role,
      jobUrl: dto.jobUrl,
      status: dto.status as any,
      salaryNote: dto.salaryNote,
      location: dto.location,
      appliedDate,
      followUpDate,
      interviewDate,
      notes: dto.notes,
      resumeVersionId: dto.resumeVersionId,
      matchAnalysisId: dto.matchAnalysisId,
    };

    const created = await this.repo.createApplication(userId, data);
    return this.mapToResponse(created);
  }

  async listApplications(
    userId: string,
    filter: ApplicationFilterQuery
  ): Promise<{ items: JobApplicationResponse[]; total: number; page: number; totalPages: number }> {
    const result = await this.repo.listApplications(userId, filter);
    return {
      items: result.items.map((item) => this.mapToResponse(item)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  async getApplicationById(userId: string, id: string): Promise<JobApplicationResponse> {
    const app = await this.repo.getApplicationById(userId, id);
    if (!app) {
      throw new NotFoundError('Job application not found');
    }
    return this.mapToResponse(app);
  }

  async updateApplication(
    userId: string,
    id: string,
    dto: UpdateJobApplicationRequest
  ): Promise<JobApplicationResponse> {
    if (dto.resumeVersionId) {
      const isOwner = await this.repo.verifyResumeVersionOwnership(userId, dto.resumeVersionId);
      if (!isOwner) {
        throw new ForbiddenError('Resume version does not exist or is not owned by candidate');
      }
    }

    if (dto.matchAnalysisId) {
      const isOwner = await this.repo.verifyMatchAnalysisOwnership(userId, dto.matchAnalysisId);
      if (!isOwner) {
        throw new ForbiddenError('Match analysis does not exist or is not owned by candidate');
      }
    }

    const data: UpdateApplicationData = {
      company: dto.company,
      role: dto.role,
      jobUrl: dto.jobUrl,
      status: dto.status as any,
      salaryNote: dto.salaryNote,
      location: dto.location,
      appliedDate: this.parseDate(dto.appliedDate),
      followUpDate: this.parseDate(dto.followUpDate),
      interviewDate: this.parseDate(dto.interviewDate),
      notes: dto.notes,
      resumeVersionId: dto.resumeVersionId,
      matchAnalysisId: dto.matchAnalysisId,
    };

    const updated = await this.repo.updateApplication(userId, id, data);
    if (!updated) {
      throw new NotFoundError('Job application not found');
    }
    return this.mapToResponse(updated);
  }

  async updateStatus(
    userId: string,
    id: string,
    status: ApplicationStatus
  ): Promise<JobApplicationResponse> {
    const updated = await this.repo.updateStatus(userId, id, status as any);
    if (!updated) {
      throw new NotFoundError('Job application not found');
    }
    return this.mapToResponse(updated);
  }

  async deleteApplication(userId: string, id: string): Promise<void> {
    const deleted = await this.repo.deleteApplication(userId, id);
    if (!deleted) {
      throw new NotFoundError('Job application not found');
    }
  }

  async getMetrics(userId: string): Promise<ApplicationMetricsResponse> {
    return this.repo.getMetrics(userId);
  }

  async getReminders(userId: string, daysAhead: number = 7): Promise<JobApplicationResponse[]> {
    const fromDate = new Date();
    const toDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    const reminders = await this.repo.getReminders(userId, fromDate, toDate);
    return reminders.map((item) => this.mapToResponse(item));
  }
}
