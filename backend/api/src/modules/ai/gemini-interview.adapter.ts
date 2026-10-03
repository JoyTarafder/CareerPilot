import { GoogleGenAI } from '@google/genai';
import {
  InterviewType,
  InterviewQuestion,
  StructuredFeedback,
} from '@careerpilot/contracts';
import { RedactionService } from './redaction.service.js';

export interface IInterviewAIAdapter {
  generateQuestions(
    targetRole: string,
    interviewType: InterviewType,
    resumeContext?: { skills: string[]; roles: string[] },
    jobContext?: { requiredSkills: string[]; responsibilities: string[] }
  ): Promise<InterviewQuestion[]>;

  evaluateAnswer(
    questionText: string,
    userAnswerText: string,
    category?: InterviewType
  ): Promise<StructuredFeedback>;
}

export class GeminiInterviewAdapter implements IInterviewAIAdapter {
  private aiClient: GoogleGenAI | null = null;
  public static readonly NON_EMOTION_NOTICE =
    'Objective feedback based strictly on structure, factual relevance, and evidence. Emotion or personality inference is explicitly excluded.';

  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (apiKey && apiKey !== 'replace-with-gemini-api-key') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
      } catch {
        this.aiClient = null;
      }
    }
  }

  async generateQuestions(
    targetRole: string,
    interviewType: InterviewType,
    resumeContext?: { skills: string[]; roles: string[] },
    jobContext?: { requiredSkills: string[]; responsibilities: string[] }
  ): Promise<InterviewQuestion[]> {
    if (this.aiClient) {
      try {
        const prompt = `You are a professional hiring manager and interview coach. Generate 4 structured interview questions for a candidate interviewing for the role of "${targetRole}".
Interview Type: ${interviewType}
Candidate Context Skills: ${resumeContext?.skills?.join(', ') || 'General Software Engineering'}
Job Requirements: ${jobContext?.requiredSkills?.join(', ') || 'Not specified'}

For each question:
1. Provide a realistic, grounded interview question.
2. Provide a clear "starPrompt" explaining how the candidate should structure their answer using STAR (Situation, Task, Action, Result).
3. Assign category: one of 'HR', 'BEHAVIORAL', 'TECHNICAL', 'CV_BASED'.

CRITICAL INSTRUCTION: Do NOT include questions assessing personal emotional traits or psychological state. Focus strictly on professional experience, technical decisions, problem solving, and collaboration.

Respond strictly in JSON format:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "...",
      "category": "BEHAVIORAL",
      "starPrompt": "..."
    }
  ]
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return parsed.questions.map((q: any, idx: number) => ({
              id: q.id || `q-${idx + 1}`,
              questionText: q.questionText,
              category: (q.category as InterviewType) || interviewType,
              starPrompt:
                q.starPrompt ||
                'Structure your answer using STAR: Situation (context), Task (objective), Action (specific steps you took), Result (outcome).',
            }));
          }
        }
      } catch {
        // Fallback to deterministic questions
      }
    }

    return this.fallbackQuestions(targetRole, interviewType, resumeContext, jobContext);
  }

  async evaluateAnswer(
    questionText: string,
    userAnswerText: string,
    category: InterviewType = 'MIXED'
  ): Promise<StructuredFeedback> {
    const redactedAnswer = RedactionService.redact(userAnswerText);

    if (this.aiClient) {
      try {
        const prompt = `You are an objective interview evaluation engine. Evaluate the candidate's text interview answer against the question asked.
Question: ${questionText}
Category: ${category}

<CANDIDATE_ANSWER>
${redactedAnswer}
</CANDIDATE_ANSWER>

CRITICAL ETHICAL BOUNDARY:
- Evaluate ONLY communication structure, relevance, technical/situational evidence, and concision.
- Do NOT perform any emotion analysis, psychological inference, confidence guessing, or personality profiling.

Provide structured feedback in JSON format:
{
  "relevance": 4, // 1 to 5
  "clarity": 4, // 1 to 5
  "structure": 4, // 1 to 5 (how well Situation, Task, Action, Result are framed)
  "evidence": 3, // 1 to 5 (whether concrete technical facts and verifiable actions are cited)
  "concision": 4, // 1 to 5
  "overallRating": 4, // 1 to 5 stars
  "feedbackSummary": "Concise summary of the response quality",
  "starBreakdown": {
    "situation": "Identified context or note if missing",
    "task": "Identified objective or note if missing",
    "action": "Identified specific steps taken by candidate",
    "result": "Identified outcome or note if missing"
  },
  "strengths": ["Clear technical explanation", "Good action ownership"],
  "areasForImprovement": ["Quantify the result with measurable metrics"],
  "practiceRecommendation": "Specific actionable exercise for the next mock response"
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            relevance: this.clampRating(parsed.relevance),
            clarity: this.clampRating(parsed.clarity),
            structure: this.clampRating(parsed.structure),
            evidence: this.clampRating(parsed.evidence),
            concision: this.clampRating(parsed.concision),
            overallRating: this.clampRating(parsed.overallRating),
            feedbackSummary: parsed.feedbackSummary || 'Well-structured response addressing the primary scenario.',
            starBreakdown: {
              situation: parsed.starBreakdown?.situation || 'Context provided clearly.',
              task: parsed.starBreakdown?.task || 'Problem statement articulated.',
              action: parsed.starBreakdown?.action || 'Technical steps described.',
              result: parsed.starBreakdown?.result || 'Outcome noted.',
            },
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear narrative flow'],
            areasForImprovement: Array.isArray(parsed.areasForImprovement)
              ? parsed.areasForImprovement
              : ['Include quantifiable metrics in the result'],
            practiceRecommendation:
              parsed.practiceRecommendation ||
              'Practice delivering the Action phase with deeper focus on personal technical choices.',
            nonEmotionNotice: GeminiInterviewAdapter.NON_EMOTION_NOTICE,
          };
        }
      } catch {
        // Fallback
      }
    }

    return this.fallbackEvaluateAnswer(questionText, userAnswerText);
  }

  private clampRating(val: any): number {
    const num = typeof val === 'number' ? val : 3;
    return Math.max(1, Math.min(5, Math.round(num)));
  }

  // Deterministic Fallback Question Suite
  private fallbackQuestions(
    targetRole: string,
    interviewType: InterviewType,
    resumeContext?: { skills: string[] },
    jobContext?: { requiredSkills: string[] }
  ): InterviewQuestion[] {
    const topSkill = jobContext?.requiredSkills?.[0] || resumeContext?.skills?.[0] || 'software architecture';

    if (interviewType === 'TECHNICAL') {
      return [
        {
          id: 'q1',
          questionText: `Can you walk me through a complex technical problem you solved using ${topSkill}? What were the main trade-offs you considered?`,
          category: 'TECHNICAL',
          starPrompt:
            'STAR Guide: S: Outline the architecture problem. T: What was the performance or scalability requirement? A: What technical implementation did you choose and why? R: What was the resulting system latency or throughput?',
        },
        {
          id: 'q2',
          questionText: `Describe a time when a production service or database query failed or bottlenecked. How did you diagnose the issue and implement a permanent fix?`,
          category: 'TECHNICAL',
          starPrompt:
            'STAR Guide: S: Describe the incident environment. T: What was your role in the triage? A: Detail your root-cause analysis steps. R: What monitoring or guardrails did you deploy to prevent recurrence?',
        },
      ];
    }

    if (interviewType === 'BEHAVIORAL') {
      return [
        {
          id: 'q1',
          questionText: `Tell me about a time when you strongly disagreed with a teammate or technical lead regarding an engineering decision. How did you navigate the conversation?`,
          category: 'BEHAVIORAL',
          starPrompt:
            'STAR Guide: S: What was the technical disagreement? T: What goal were both parties trying to achieve? A: How did you evaluate data objectively and collaborate? R: What was the final compromise and team outcome?',
        },
        {
          id: 'q2',
          questionText: `Describe a situation where a project deadline was at severe risk due to unexpected blockers or scope change. How did you prioritize?`,
          category: 'BEHAVIORAL',
          starPrompt:
            'STAR Guide: S: What caused the timeline pressure? T: What deliverables were essential? A: What did you descope or communicate to stakeholders? R: How was the project delivered?',
        },
      ];
    }

    // Default MIXED or HR
    return [
      {
        id: 'q1',
        questionText: `Why are you interested in transitioning into this ${targetRole} role, and how does your background prepare you to make an immediate impact?`,
        category: 'HR',
        starPrompt:
          'STAR Guide: S: Briefly summarize your foundational experience. T: What career challenge are you seeking? A: Cite 2-3 specific technical strengths. R: How do these align with the role expectations?',
      },
      {
        id: 'q2',
        questionText: `Describe a recent project where you took ownership of a feature end-to-end. What technical obstacles did you overcome?`,
        category: 'CV_BASED',
        starPrompt:
          'STAR Guide: S: What was the project scope? T: What was your specific responsibility? A: What tools and code patterns did you implement? R: What measurable impact did it have?',
      },
    ];
  }

  // Deterministic Fallback Answer Evaluator
  private fallbackEvaluateAnswer(
    _questionText: string,
    userAnswerText: string
  ): StructuredFeedback {
    const text = userAnswerText.trim();
    const wordCount = text.split(/\s+/).length;

    // Evaluate basic heuristics
    const hasSituation = /(when|while|in my previous|at my|during|project|system)/i.test(text);
    const hasAction = /(i implemented|i designed|i built|i refactored|i configured|i created|i resolved)/i.test(text);
    const hasResult = /(resulted|improved|reduced|increased|successfully|impact|delivered|deployed)/i.test(text);
    const hasMetric = /\b(\d+%\b|\$\d+|\b\d+\s*(users|ms|seconds|minutes|hours|days|queries))\b/i.test(text);

    let structureScore = 3;
    if (hasSituation && hasAction && hasResult) structureScore = 5;
    else if ((hasSituation && hasAction) || (hasAction && hasResult)) structureScore = 4;
    else if (!hasAction) structureScore = 2;

    const evidenceScore = hasMetric ? 5 : hasAction ? 4 : 2;
    const concisionScore = wordCount >= 30 && wordCount <= 250 ? 5 : wordCount < 30 ? 2 : 3;
    const relevanceScore = text.length > 50 ? 4 : 2;
    const clarityScore = wordCount >= 20 ? 4 : 2;

    const overallRating = Math.round(
      (structureScore + evidenceScore + concisionScore + relevanceScore + clarityScore) / 5
    );

    const strengths: string[] = [];
    if (hasAction) strengths.push('Clear first-person ownership of technical actions taken.');
    if (hasResult) strengths.push('Articulated the final resolution and outcome.');
    if (hasMetric) strengths.push('Supported accomplishments with quantifiable data.');
    if (strengths.length === 0) strengths.push('Directly addressed the interview question.');

    const areasForImprovement: string[] = [];
    if (!hasMetric) areasForImprovement.push('Quantify the final result (e.g. latency reduced by X% or Y users impacted).');
    if (!hasSituation) areasForImprovement.push('Briefly set the initial context before diving into the solution.');
    if (wordCount < 40) areasForImprovement.push('Expand on the specific technical trade-offs you weighed.');

    return {
      relevance: relevanceScore,
      clarity: clarityScore,
      structure: structureScore,
      evidence: evidenceScore,
      concision: concisionScore,
      overallRating,
      feedbackSummary:
        structureScore >= 4
          ? 'Strong response with good STAR structural progression and technical ownership.'
          : 'Answer communicates intent but would benefit from explicit STAR framing (Situation, Task, Action, Result).',
      starBreakdown: {
        situation: hasSituation ? 'Context identified.' : 'Missing explicit project context.',
        task: 'Technical objective described.',
        action: hasAction ? 'Clear engineering actions cited.' : 'Clarify what YOU specifically implemented vs the team.',
        result: hasResult ? 'Outcome stated.' : 'Conclude with a clear statement of the final result.',
      },
      strengths,
      areasForImprovement,
      practiceRecommendation:
        'Practice stating the Action in 2 specific steps, then closing with a measured Result.',
      nonEmotionNotice: GeminiInterviewAdapter.NON_EMOTION_NOTICE,
    };
  }
}
