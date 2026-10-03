import { PrismaClient, MatchAnalysis, AnalysisStatus } from '@prisma/client';

export interface CreateAnalysisDbData {
  resumeVersionId: string;
  jobDescriptionId: string;
  status: AnalysisStatus;
  score: number;
  categoriesBreakdown: Record<string, number>;
  matchedEvidence: any[];
  missingRequirements: any[];
  scoringVersion: string;
  aiPromptVersion?: string;
}

export interface IMatchingRepository {
  createAnalysis(data: CreateAnalysisDbData): Promise<MatchAnalysis>;
  getAnalysisById(userId: string, analysisId: string): Promise<MatchAnalysis | null>;
  listAnalysesForResume(userId: string, resumeVersionId: string): Promise<MatchAnalysis[]>;
  verifyResumeOwnership(
    userId: string,
    resumeVersionId: string
  ): Promise<{ resumeId: string; contentSnapshot: any } | null>;
  verifyJobOwnership(
    userId: string,
    jobDescriptionId: string
  ): Promise<{ id: string; extractedData: any } | null>;
}

export class PrismaMatchingRepository implements IMatchingRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async createAnalysis(data: CreateAnalysisDbData): Promise<MatchAnalysis> {
    return this.prisma.matchAnalysis.create({
      data: {
        resumeVersionId: data.resumeVersionId,
        jobDescriptionId: data.jobDescriptionId,
        status: data.status,
        score: data.score,
        categoriesBreakdown: data.categoriesBreakdown,
        matchedEvidence: data.matchedEvidence,
        missingRequirements: data.missingRequirements,
        scoringVersion: data.scoringVersion,
        aiPromptVersion: data.aiPromptVersion,
      },
    });
  }

  async getAnalysisById(userId: string, analysisId: string): Promise<MatchAnalysis | null> {
    // Enforce ownership: the job description must belong to the authenticated user
    return this.prisma.matchAnalysis.findFirst({
      where: {
        id: analysisId,
        jobDescription: { userId },
      },
    });
  }

  async listAnalysesForResume(userId: string, resumeVersionId: string): Promise<MatchAnalysis[]> {
    return this.prisma.matchAnalysis.findMany({
      where: {
        resumeVersionId,
        resumeVersion: {
          resume: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyResumeOwnership(
    userId: string,
    resumeVersionId: string
  ): Promise<{ resumeId: string; contentSnapshot: any } | null> {
    const version = await this.prisma.resumeVersion.findFirst({
      where: {
        id: resumeVersionId,
        resume: { userId, deletedAt: null },
      },
      select: {
        resumeId: true,
        contentSnapshot: true,
      },
    });
    return version;
  }

  async verifyJobOwnership(
    userId: string,
    jobDescriptionId: string
  ): Promise<{ id: string; extractedData: any } | null> {
    const job = await this.prisma.jobDescription.findFirst({
      where: {
        id: jobDescriptionId,
        userId,
      },
      select: {
        id: true,
        extractedData: true,
      },
    });
    return job;
  }
}

export class InMemoryMatchingRepository implements IMatchingRepository {
  private analyses: Map<string, MatchAnalysis> = new Map();
  public userResumes: Map<string, { userId: string; contentSnapshot: any }> = new Map();
  public userJobs: Map<string, { userId: string; extractedData: any }> = new Map();

  async createAnalysis(data: CreateAnalysisDbData): Promise<MatchAnalysis> {
    const id = `ana_${crypto.randomUUID()}`;
    const analysis: MatchAnalysis = {
      id,
      resumeVersionId: data.resumeVersionId,
      jobDescriptionId: data.jobDescriptionId,
      status: data.status,
      score: data.score,
      categoriesBreakdown: data.categoriesBreakdown,
      matchedEvidence: data.matchedEvidence,
      missingRequirements: data.missingRequirements,
      scoringVersion: data.scoringVersion,
      aiPromptVersion: data.aiPromptVersion || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysisById(userId: string, analysisId: string): Promise<MatchAnalysis | null> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return null;

    const job = this.userJobs.get(analysis.jobDescriptionId);
    if (!job || job.userId !== userId) return null;

    return analysis;
  }

  async listAnalysesForResume(userId: string, resumeVersionId: string): Promise<MatchAnalysis[]> {
    const resume = this.userResumes.get(resumeVersionId);
    if (!resume || resume.userId !== userId) return [];

    return Array.from(this.analyses.values())
      .filter((a) => a.resumeVersionId === resumeVersionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async verifyResumeOwnership(
    userId: string,
    resumeVersionId: string
  ): Promise<{ resumeId: string; contentSnapshot: any } | null> {
    const r = this.userResumes.get(resumeVersionId);
    if (!r || r.userId !== userId) return null;
    return { resumeId: 'res_sample', contentSnapshot: r.contentSnapshot };
  }

  async verifyJobOwnership(
    userId: string,
    jobDescriptionId: string
  ): Promise<{ id: string; extractedData: any } | null> {
    const j = this.userJobs.get(jobDescriptionId);
    if (!j || j.userId !== userId) return null;
    return { id: jobDescriptionId, extractedData: j.extractedData };
  }
}
