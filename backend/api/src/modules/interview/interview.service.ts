import {
  StartInterviewSessionRequest,
  StartInterviewSessionRequestSchema,
  SubmitAnswerRequest,
  SubmitAnswerRequestSchema,
  InterviewSessionResponse,
  InterviewAnswerResponse,
  InterviewSessionSummaryReport,
} from '@careerpilot/contracts';
import { IInterviewRepository } from './interview.repository.js';
import { IInterviewAIAdapter, GeminiInterviewAdapter } from '../ai/gemini-interview.adapter.js';
import { NotFoundError, ValidationError } from '../../core/errors.js';

export class InterviewService {
  constructor(
    private readonly repo: IInterviewRepository,
    private readonly aiAdapter: IInterviewAIAdapter = new GeminiInterviewAdapter()
  ) {}

  async startSession(
    userId: string,
    rawRequest: StartInterviewSessionRequest
  ): Promise<InterviewSessionResponse> {
    const parsed = StartInterviewSessionRequestSchema.safeParse(rawRequest);
    if (!parsed.success) {
      throw new ValidationError('Invalid interview session request', parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;

    let resumeContext: { skills: string[]; roles: string[] } | undefined;
    if (data.resumeVersionId) {
      const owned = await this.repo.verifyResumeVersionOwnership(userId, data.resumeVersionId);
      if (!owned) {
        throw new NotFoundError('Resume version not found or not owned by user');
      }
      resumeContext = owned;
    }

    let jobContext: { requiredSkills: string[]; responsibilities: string[] } | undefined;
    if (data.jobDescriptionId) {
      const owned = await this.repo.verifyJobDescriptionOwnership(userId, data.jobDescriptionId);
      if (!owned) {
        throw new NotFoundError('Job description not found or not owned by user');
      }
      jobContext = owned;
    }

    // Generate grounded questions
    const questions = await this.aiAdapter.generateQuestions(
      data.targetRole,
      data.interviewType,
      resumeContext,
      jobContext
    );

    return this.repo.createSession(userId, {
      targetRole: data.targetRole,
      interviewType: data.interviewType,
      questions,
    });
  }

  async listSessions(userId: string): Promise<InterviewSessionResponse[]> {
    return this.repo.listSessions(userId);
  }

  async getSession(userId: string, sessionId: string): Promise<InterviewSessionResponse> {
    const session = await this.repo.getSessionById(userId, sessionId);
    if (!session) {
      throw new NotFoundError('Interview session not found');
    }
    return session;
  }

  async submitAnswer(
    userId: string,
    sessionId: string,
    rawRequest: SubmitAnswerRequest
  ): Promise<InterviewAnswerResponse> {
    const parsed = SubmitAnswerRequestSchema.safeParse(rawRequest);
    if (!parsed.success) {
      throw new ValidationError('Invalid answer submission', parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;

    const session = await this.repo.getSessionById(userId, sessionId);
    if (!session) {
      throw new NotFoundError('Interview session not found');
    }

    if (session.completedAt) {
      throw new ValidationError('Cannot submit an answer to an already completed interview session');
    }

    // Evaluate answer with AI adapter
    const feedback = await this.aiAdapter.evaluateAnswer(
      data.questionText,
      data.userAnswerText,
      data.category || session.interviewType
    );

    // Ensure non-emotion disclaimer is firmly attached
    if (!feedback.nonEmotionNotice) {
      feedback.nonEmotionNotice = GeminiInterviewAdapter.NON_EMOTION_NOTICE;
    }

    return this.repo.createAnswer(sessionId, {
      questionText: data.questionText,
      userAnswerText: data.userAnswerText,
      feedback,
    });
  }

  async completeSession(userId: string, sessionId: string): Promise<InterviewSessionResponse> {
    const session = await this.repo.getSessionById(userId, sessionId);
    if (!session) {
      throw new NotFoundError('Interview session not found');
    }

    if (session.completedAt && session.summaryReport) {
      return session;
    }

    const answers = session.answers || [];
    const totalQuestions = session.questions?.length || answers.length || 1;
    const answeredQuestions = answers.length;

    const ratingSum = answers.reduce((acc, a) => acc + (a.starRating || 0), 0);
    const rawAvg = answeredQuestions > 0 ? ratingSum / answeredQuestions : 0;
    const averageRating = Math.round(rawAvg * 10) / 10;

    // Aggregate strengths & practice plan
    const strengthsSet = new Set<string>();
    const improvementsSet = new Set<string>();

    for (const a of answers) {
      if (a.feedbackDetails?.strengths) {
        a.feedbackDetails.strengths.forEach((s) => strengthsSet.add(s));
      }
      if (a.feedbackDetails?.areasForImprovement) {
        a.feedbackDetails.areasForImprovement.forEach((imp) => improvementsSet.add(imp));
      }
    }

    const overallStrengths = strengthsSet.size > 0
      ? Array.from(strengthsSet).slice(0, 4)
      : ['Clear responses directly addressing candidate scenarios.'];

    const practicePlan = improvementsSet.size > 0
      ? Array.from(improvementsSet).slice(0, 4)
      : [
          'Practice leading with a concise 1-sentence Situation.',
          'Quantify actions taken with specific metrics and measurable outcomes.',
        ];

    const summaryReport: InterviewSessionSummaryReport = {
      totalQuestions,
      answeredQuestions,
      averageRating,
      overallStrengths,
      practicePlan,
    };

    const completed = await this.repo.completeSession(userId, sessionId, summaryReport);
    if (!completed) {
      throw new NotFoundError('Interview session could not be completed');
    }

    return completed;
  }
}
