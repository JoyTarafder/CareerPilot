import { IMatchingRepository } from './matching.repository.js';
import {
  calculateMatch,
  DEFAULT_SCORING_RULESET_V1,
  NormalizedResumeEvidence,
  NormalizedJobRequirements,
} from '@careerpilot/scoring';
import {
  CreateAnalysisRequest,
  MatchAnalysisResult,
  ResumeContentSnapshot,
  ExtractedJobRequirements,
} from '@careerpilot/contracts';
import { NotFoundError, ValidationError } from '../../core/errors.js';
import { AnalysisStatus } from '@prisma/client';

export class MatchingService {
  constructor(private readonly matchingRepo: IMatchingRepository) {}

  async createAnalysis(userId: string, dto: CreateAnalysisRequest): Promise<MatchAnalysisResult> {
    // 1. Verify ownership of both resume and job description
    const resumeRecord = await this.matchingRepo.verifyResumeOwnership(
      userId,
      dto.resumeVersionId
    );
    if (!resumeRecord) {
      throw new NotFoundError('Resume version not found or not owned by user');
    }

    const jobRecord = await this.matchingRepo.verifyJobOwnership(userId, dto.jobDescriptionId);
    if (!jobRecord) {
      throw new NotFoundError('Job description not found or not owned by user');
    }

    const resumeSnapshot = resumeRecord.contentSnapshot as ResumeContentSnapshot;
    const extractedJob = jobRecord.extractedData as ExtractedJobRequirements;

    if (!extractedJob) {
      throw new ValidationError('Job description has not been analyzed or extracted yet');
    }

    // 2. Normalize inputs for deterministic scoring engine
    const normalizedResume: NormalizedResumeEvidence = this.extractResumeEvidence(resumeSnapshot);
    const normalizedJob: NormalizedJobRequirements = {
      requiredSkills: extractedJob.requiredSkills || [],
      preferredSkills: extractedJob.preferredSkills || [],
      minExperienceYears: extractedJob.minExperienceYears || 0,
      requiredDegrees: extractedJob.requiredDegrees || [],
      keywords: extractedJob.keywords || [],
    };

    // 3. Pure deterministic calculation
    const rules = DEFAULT_SCORING_RULESET_V1;
    const matchResult = calculateMatch({
      resume: normalizedResume,
      job: normalizedJob,
      rules,
    });

    // 4. Save analysis to database
    const saved = await this.matchingRepo.createAnalysis({
      resumeVersionId: dto.resumeVersionId,
      jobDescriptionId: dto.jobDescriptionId,
      status: AnalysisStatus.COMPLETED,
      score: matchResult.score,
      categoriesBreakdown: matchResult.categories,
      matchedEvidence: matchResult.matchedEvidence,
      missingRequirements: matchResult.missingRequirements,
      scoringVersion: matchResult.scoringVersion,
      aiPromptVersion: '1.0.0',
    });

    return {
      id: saved.id,
      resumeVersionId: saved.resumeVersionId,
      jobDescriptionId: saved.jobDescriptionId,
      status: saved.status as any,
      score: matchResult.score,
      categories: matchResult.categories,
      matchedEvidence: matchResult.matchedEvidence as any,
      missingRequirements: matchResult.missingRequirements as any,
      recommendations: matchResult.recommendations,
      scoringVersion: matchResult.scoringVersion,
      disclaimer: 'Estimated compatibility, not an employer ATS result or hiring probability.',
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async getAnalysis(userId: string, analysisId: string): Promise<MatchAnalysisResult> {
    const analysis = await this.matchingRepo.getAnalysisById(userId, analysisId);
    if (!analysis) {
      throw new NotFoundError('Analysis not found');
    }

    return {
      id: analysis.id,
      resumeVersionId: analysis.resumeVersionId,
      jobDescriptionId: analysis.jobDescriptionId,
      status: analysis.status as any,
      score: analysis.score || 0,
      categories: (analysis.categoriesBreakdown as Record<string, number>) || {},
      matchedEvidence: (analysis.matchedEvidence as any) || [],
      missingRequirements: (analysis.missingRequirements as any) || [],
      recommendations: [
        'Add evidence only if accurate.',
        'Align bullet points with the job keywords.',
        'Verify required skills coverage in experience descriptions.',
      ],
      scoringVersion: analysis.scoringVersion,
      disclaimer: 'Estimated compatibility, not an employer ATS result or hiring probability.',
      createdAt: analysis.createdAt.toISOString(),
    };
  }

  async listAnalysesForResume(userId: string, resumeVersionId: string): Promise<MatchAnalysisResult[]> {
    const list = await this.matchingRepo.listAnalysesForResume(userId, resumeVersionId);
    return list.map((a) => ({
      id: a.id,
      resumeVersionId: a.resumeVersionId,
      jobDescriptionId: a.jobDescriptionId,
      status: a.status as any,
      score: a.score || 0,
      categories: (a.categoriesBreakdown as Record<string, number>) || {},
      matchedEvidence: (a.matchedEvidence as any) || [],
      missingRequirements: (a.missingRequirements as any) || [],
      recommendations: [],
      scoringVersion: a.scoringVersion,
      disclaimer: 'Estimated compatibility, not an employer ATS result or hiring probability.',
      createdAt: a.createdAt.toISOString(),
    }));
  }

  private extractResumeEvidence(resume: ResumeContentSnapshot): NormalizedResumeEvidence {
    const skillsSet = new Set<string>();

    // 1. Collect skills from skills section
    for (const group of resume.skills || []) {
      for (const item of group.items) {
        skillsSet.add(item.trim());
      }
    }

    // 2. Collect skills from project technology tags
    for (const proj of resume.projects || []) {
      for (const tech of proj.technologies || []) {
        skillsSet.add(tech.trim());
      }
    }

    // 3. Compute rough total experience years
    let experienceYears = 0;
    if (resume.experiences && resume.experiences.length > 0) {
      experienceYears = Math.max(1, resume.experiences.length * 1.5);
    }

    // 4. Collect degree titles
    const degrees: string[] = [];
    for (const edu of resume.educations || []) {
      degrees.push(edu.degree);
      if (edu.fieldOfStudy) {
        degrees.push(`${edu.degree} ${edu.fieldOfStudy}`);
      }
    }

    return {
      skills: Array.from(skillsSet),
      experienceYears: Math.round(experienceYears),
      educationDegrees: degrees,
      keywords: Array.from(skillsSet),
    };
  }
}
