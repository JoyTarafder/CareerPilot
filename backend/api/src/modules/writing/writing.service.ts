import {
  ImproveBulletRequest,
  BulletImprovementResponse,
  ImproveSummaryRequest,
  SummaryImprovementResponse,
  GenerateCoverLetterRequest,
  CoverLetterResponse,
  AIQuotaStatusResponse,
  AdminCostMetricsResponse,
} from '@careerpilot/contracts';
import { IWritingRepository } from './writing.repository.js';
import { IAIWritingAdapter } from '../ai/gemini-writing.adapter.js';
import { AppError, ForbiddenError } from '../../core/errors.js';

export class WritingService {
  constructor(
    private readonly repo: IWritingRepository,
    private readonly aiAdapter: IAIWritingAdapter
  ) {}

  private async enforceQuota(userId: string): Promise<AIQuotaStatusResponse> {
    const check = await this.repo.checkAndIncrementQuota(userId);
    if (!check.allowed) {
      throw new AppError(
        'Daily AI writing quota exceeded (50/50 requests). Quota resets at 00:00 UTC.',
        429,
        'QUOTA_EXCEEDED'
      );
    }
    return check.status;
  }

  async improveBullet(userId: string, dto: ImproveBulletRequest): Promise<BulletImprovementResponse> {
    await this.enforceQuota(userId);
    try {
      const result = await this.aiAdapter.improveBullet(
        dto.originalBullet,
        dto.contextRole,
        dto.targetJobKeywords
      );
      await this.repo.recordMetric(true);
      return result;
    } catch (err) {
      await this.repo.recordMetric(false);
      throw err;
    }
  }

  async improveSummary(userId: string, dto: ImproveSummaryRequest): Promise<SummaryImprovementResponse> {
    await this.enforceQuota(userId);
    try {
      const result = await this.aiAdapter.improveSummary(
        dto.originalSummary,
        dto.targetRole,
        dto.skills
      );
      await this.repo.recordMetric(true);
      return result;
    } catch (err) {
      await this.repo.recordMetric(false);
      throw err;
    }
  }

  async generateCoverLetter(
    userId: string,
    dto: GenerateCoverLetterRequest
  ): Promise<CoverLetterResponse> {
    // Cross-tenant IDOR validation
    const resumeSnapshot = await this.repo.getResumeSnapshot(userId, dto.resumeVersionId);
    if (!resumeSnapshot) {
      throw new ForbiddenError('Resume version not found or not owned by candidate');
    }

    const job = await this.repo.getJobExtractedData(userId, dto.jobDescriptionId);
    if (!job) {
      throw new ForbiddenError('Job description not found or not owned by candidate');
    }

    await this.enforceQuota(userId);

    try {
      const candidateName = resumeSnapshot.personalInfo?.fullName || 'Candidate';
      const skills: string[] = [];
      if (Array.isArray(resumeSnapshot.skills)) {
        for (const cat of resumeSnapshot.skills) {
          if (Array.isArray(cat.items)) {
            skills.push(...cat.items);
          }
        }
      }

      const experiences = Array.isArray(resumeSnapshot.experiences)
        ? resumeSnapshot.experiences.map((e: any) => ({
            role: e.role || '',
            company: e.company || '',
            highlights: Array.isArray(e.highlights) ? e.highlights : [],
          }))
        : [];

      const educations = Array.isArray(resumeSnapshot.educations)
        ? resumeSnapshot.educations.map((ed: any) => ({
            degree: ed.degree || '',
            institution: ed.institution || '',
          }))
        : [];

      const jobRequirements = job.extractedData || {};

      const result = await this.aiAdapter.generateCoverLetter(
        candidateName,
        {
          summary: resumeSnapshot.summary,
          skills,
          experiences,
          educations,
        },
        {
          title: job.title,
          company: job.company,
          requiredSkills: Array.isArray(jobRequirements.requiredSkills) ? jobRequirements.requiredSkills : [],
          responsibilities: Array.isArray(jobRequirements.responsibilities) ? jobRequirements.responsibilities : [],
        },
        dto.tone
      );

      await this.repo.recordMetric(true);
      return result;
    } catch (err) {
      await this.repo.recordMetric(false);
      throw err;
    }
  }

  async getQuotaStatus(userId: string): Promise<AIQuotaStatusResponse> {
    return this.repo.getQuotaStatus(userId);
  }

  async getAdminMetrics(): Promise<AdminCostMetricsResponse> {
    return this.repo.getAdminMetrics();
  }
}
