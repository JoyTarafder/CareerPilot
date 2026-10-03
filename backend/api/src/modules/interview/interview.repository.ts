import { PrismaClient, InterviewType } from '@prisma/client';
import {
  InterviewQuestion,
  InterviewSessionResponse,
  InterviewAnswerResponse,
  InterviewSessionSummaryReport,
  StructuredFeedback,
} from '@careerpilot/contracts';

export interface CreateSessionData {
  targetRole: string;
  interviewType: InterviewType;
  questions: InterviewQuestion[];
}

export interface CreateAnswerData {
  questionText: string;
  userAnswerText: string;
  feedback: StructuredFeedback;
}

export interface IInterviewRepository {
  createSession(userId: string, data: CreateSessionData): Promise<InterviewSessionResponse>;
  listSessions(userId: string): Promise<InterviewSessionResponse[]>;
  getSessionById(userId: string, id: string): Promise<InterviewSessionResponse | null>;
  completeSession(
    userId: string,
    id: string,
    summaryReport: InterviewSessionSummaryReport
  ): Promise<InterviewSessionResponse | null>;
  createAnswer(
    sessionId: string,
    data: CreateAnswerData
  ): Promise<InterviewAnswerResponse>;
  verifyResumeVersionOwnership(
    userId: string,
    resumeVersionId: string
  ): Promise<{ skills: string[]; roles: string[] } | null>;
  verifyJobDescriptionOwnership(
    userId: string,
    jobDescriptionId: string
  ): Promise<{ requiredSkills: string[]; responsibilities: string[] } | null>;
}

export class PrismaInterviewRepository implements IInterviewRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async createSession(userId: string, data: CreateSessionData): Promise<InterviewSessionResponse> {
    const session = await this.prisma.interviewSession.create({
      data: {
        userId,
        targetRole: data.targetRole,
        interviewType: data.interviewType,
        questions: data.questions as any,
      },
      include: {
        answers: true,
      },
    });

    return this.mapSession(session);
  }

  async listSessions(userId: string): Promise<InterviewSessionResponse[]> {
    const sessions = await this.prisma.interviewSession.findMany({
      where: { userId },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => this.mapSession(s));
  }

  async getSessionById(userId: string, id: string): Promise<InterviewSessionResponse | null> {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id, userId },
      include: { answers: { orderBy: { createdAt: 'asc' } } },
    });

    return session ? this.mapSession(session) : null;
  }

  async completeSession(
    userId: string,
    id: string,
    summaryReport: InterviewSessionSummaryReport
  ): Promise<InterviewSessionResponse | null> {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id, userId },
    });

    if (!session) return null;

    const updated = await this.prisma.interviewSession.update({
      where: { id },
      data: {
        completedAt: new Date(),
        summaryReport: summaryReport as any,
      },
      include: { answers: { orderBy: { createdAt: 'asc' } } },
    });

    return this.mapSession(updated);
  }

  async createAnswer(sessionId: string, data: CreateAnswerData): Promise<InterviewAnswerResponse> {
    const answer = await this.prisma.interviewAnswer.create({
      data: {
        sessionId,
        questionText: data.questionText,
        userAnswerText: data.userAnswerText,
        feedbackSummary: data.feedback.feedbackSummary,
        feedbackDetails: data.feedback as any,
        starRating: data.feedback.overallRating,
      },
    });

    return this.mapAnswer(answer);
  }

  async verifyResumeVersionOwnership(
    userId: string,
    resumeVersionId: string
  ): Promise<{ skills: string[]; roles: string[] } | null> {
    const version = await this.prisma.resumeVersion.findFirst({
      where: {
        id: resumeVersionId,
        resume: { userId },
      },
      select: { contentSnapshot: true },
    });

    if (!version || !version.contentSnapshot) return null;
    const snap = version.contentSnapshot as any;
    const skills = (snap.skills || []).map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean);
    const roles = (snap.workExperience || []).map((w: any) => w.role || w.title).filter(Boolean);

    return { skills, roles };
  }

  async verifyJobDescriptionOwnership(
    userId: string,
    jobDescriptionId: string
  ): Promise<{ requiredSkills: string[]; responsibilities: string[] } | null> {
    const job = await this.prisma.jobDescription.findFirst({
      where: {
        id: jobDescriptionId,
        userId,
      },
      select: { extractedData: true },
    });

    if (!job || !job.extractedData) return null;
    const data = job.extractedData as any;
    const requiredSkills = Array.isArray(data.requiredSkills) ? data.requiredSkills : [];
    const responsibilities = Array.isArray(data.responsibilities) ? data.responsibilities : [];

    return { requiredSkills, responsibilities };
  }

  private mapSession(raw: any): InterviewSessionResponse {
    const questions: InterviewQuestion[] = Array.isArray(raw.questions) ? raw.questions : [];
    const answers: InterviewAnswerResponse[] = Array.isArray(raw.answers)
      ? raw.answers.map((a: any) => this.mapAnswer(a))
      : [];

    return {
      id: raw.id,
      userId: raw.userId,
      targetRole: raw.targetRole,
      interviewType: raw.interviewType,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
      completedAt: raw.completedAt ? (raw.completedAt instanceof Date ? raw.completedAt.toISOString() : String(raw.completedAt)) : null,
      questions,
      answers,
      summaryReport: raw.summaryReport || null,
    };
  }

  private mapAnswer(raw: any): InterviewAnswerResponse {
    let details: StructuredFeedback | null = null;
    if (raw.feedbackDetails && typeof raw.feedbackDetails === 'object') {
      details = raw.feedbackDetails as StructuredFeedback;
    } else if (raw.feedbackSummary && typeof raw.feedbackSummary === 'string' && raw.feedbackSummary.startsWith('{')) {
      try {
        details = JSON.parse(raw.feedbackSummary);
      } catch {
        // Not JSON
      }
    }

    return {
      id: raw.id,
      questionText: raw.questionText,
      userAnswerText: raw.userAnswerText,
      feedbackSummary: raw.feedbackSummary || (details ? details.feedbackSummary : null),
      starRating: raw.starRating,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
      feedbackDetails: details,
    };
  }
}

export class InMemoryInterviewRepository implements IInterviewRepository {
  private sessions = new Map<string, any>();
  private answers = new Map<string, any[]>();
  private resumes = new Map<string, { userId: string; skills: string[]; roles: string[] }>();
  private jobs = new Map<string, { userId: string; requiredSkills: string[]; responsibilities: string[] }>();

  // Helper for test seeding
  seedResume(versionId: string, userId: string, skills: string[], roles: string[]) {
    this.resumes.set(versionId, { userId, skills, roles });
  }

  seedJob(jobId: string, userId: string, requiredSkills: string[], responsibilities: string[]) {
    this.jobs.set(jobId, { userId, requiredSkills, responsibilities });
  }

  async createSession(userId: string, data: CreateSessionData): Promise<InterviewSessionResponse> {
    const id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sessionRecord = {
      id,
      userId,
      targetRole: data.targetRole,
      interviewType: data.interviewType,
      questions: data.questions,
      summaryReport: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    this.sessions.set(id, sessionRecord);
    this.answers.set(id, []);

    return {
      ...sessionRecord,
      answers: [],
    };
  }

  async listSessions(userId: string): Promise<InterviewSessionResponse[]> {
    const results: InterviewSessionResponse[] = [];
    for (const s of this.sessions.values()) {
      if (s.userId === userId) {
        results.push({
          ...s,
          answers: this.answers.get(s.id) || [],
        });
      }
    }
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getSessionById(userId: string, id: string): Promise<InterviewSessionResponse | null> {
    const session = this.sessions.get(id);
    if (!session || session.userId !== userId) {
      return null;
    }
    return {
      ...session,
      answers: this.answers.get(id) || [],
    };
  }

  async completeSession(
    userId: string,
    id: string,
    summaryReport: InterviewSessionSummaryReport
  ): Promise<InterviewSessionResponse | null> {
    const session = this.sessions.get(id);
    if (!session || session.userId !== userId) {
      return null;
    }

    session.completedAt = new Date().toISOString();
    session.summaryReport = summaryReport;
    this.sessions.set(id, session);

    return {
      ...session,
      answers: this.answers.get(id) || [],
    };
  }

  async createAnswer(sessionId: string, data: CreateAnswerData): Promise<InterviewAnswerResponse> {
    const id = `ans-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const answer: InterviewAnswerResponse = {
      id,
      questionText: data.questionText,
      userAnswerText: data.userAnswerText,
      feedbackSummary: data.feedback.feedbackSummary,
      starRating: data.feedback.overallRating,
      createdAt: new Date().toISOString(),
      feedbackDetails: data.feedback,
    };

    const list = this.answers.get(sessionId) || [];
    list.push(answer);
    this.answers.set(sessionId, list);

    return answer;
  }

  async verifyResumeVersionOwnership(
    userId: string,
    resumeVersionId: string
  ): Promise<{ skills: string[]; roles: string[] } | null> {
    const r = this.resumes.get(resumeVersionId);
    if (!r || r.userId !== userId) return null;
    return { skills: r.skills, roles: r.roles };
  }

  async verifyJobDescriptionOwnership(
    userId: string,
    jobDescriptionId: string
  ): Promise<{ requiredSkills: string[]; responsibilities: string[] } | null> {
    const j = this.jobs.get(jobDescriptionId);
    if (!j || j.userId !== userId) return null;
    return { requiredSkills: j.requiredSkills, responsibilities: j.responsibilities };
  }
}
