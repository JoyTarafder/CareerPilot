import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { InMemoryAuthRepository } from '../src/modules/auth/auth.repository.js';
import { InMemoryProfilesRepository } from '../src/modules/profiles/profiles.repository.js';
import { InMemoryResumesRepository } from '../src/modules/resumes/resumes.repository.js';
import { InMemoryJobsRepository } from '../src/modules/jobs/jobs.repository.js';
import { InMemoryMatchingRepository } from '../src/modules/matching/matching.repository.js';
import { InMemoryApplicationsRepository } from '../src/modules/applications/applications.repository.js';
import { InMemoryWritingRepository } from '../src/modules/writing/writing.repository.js';
import { InMemoryInterviewRepository } from '../src/modules/interview/interview.repository.js';
import { GeminiInterviewAdapter } from '../src/modules/ai/gemini-interview.adapter.js';

describe('Phase 6 — Interview Preparation, Grounded Sessions, STAR Rubric, and Non-Emotion Guardrails', () => {
  let server: Server;
  let baseUrl: string;
  let authRepo: InMemoryAuthRepository;
  let profilesRepo: InMemoryProfilesRepository;
  let resumesRepo: InMemoryResumesRepository;
  let jobsRepo: InMemoryJobsRepository;
  let matchingRepo: InMemoryMatchingRepository;
  let applicationsRepo: InMemoryApplicationsRepository;
  let writingRepo: InMemoryWritingRepository;
  let interviewRepo: InMemoryInterviewRepository;
  let interviewAdapter: GeminiInterviewAdapter;

  let tokenUserA: string;
  let tokenUserB: string;
  let userIdUserA: string;
  let userIdUserB: string;

  let resumeVersionIdUserA: string;
  let jobIdUserA: string;

  before(async () => {
    authRepo = new InMemoryAuthRepository();
    profilesRepo = new InMemoryProfilesRepository();
    resumesRepo = new InMemoryResumesRepository();
    jobsRepo = new InMemoryJobsRepository();
    matchingRepo = new InMemoryMatchingRepository();
    applicationsRepo = new InMemoryApplicationsRepository();
    writingRepo = new InMemoryWritingRepository();
    interviewRepo = new InMemoryInterviewRepository();
    interviewAdapter = new GeminiInterviewAdapter();

    const app = createApp({
      authRepo,
      profilesRepo,
      resumesRepo,
      jobsRepo,
      matchingRepo,
      applicationsRepo,
      writingRepo,
      interviewRepo,
      interviewAdapter,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });

    // Register User A
    const regResA = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user-a-interview@careerpilot.dev',
        password: 'Password123!Safe',
        fullName: 'Candidate Alpha',
      }),
    });
    const regDataA = await regResA.json();
    tokenUserA = regDataA.accessToken;
    userIdUserA = regDataA.user.id;

    // Register User B
    const regResB = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user-b-interview@careerpilot.dev',
        password: 'Password123!Safe',
        fullName: 'Candidate Beta',
      }),
    });
    const regDataB = await regResB.json();
    tokenUserB = regDataB.accessToken;
    userIdUserB = regDataB.user.id;

    // Seed User A resume and job in interview repository for grounding tests
    resumeVersionIdUserA = '00000000-0000-0000-0000-000000000001';
    interviewRepo.seedResume(resumeVersionIdUserA, userIdUserA, ['PostgreSQL', 'Distributed Systems', 'Redis'], ['Staff Infrastructure Engineer']);

    jobIdUserA = '00000000-0000-0000-0000-000000000002';
    interviewRepo.seedJob(jobIdUserA, userIdUserA, ['PostgreSQL', 'High Concurrency'], ['Design scalable message streaming architectures']);
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  let createdSessionId: string;
  let firstQuestionText: string;

  it('creates an interview session and returns grounded questions with STAR guidance', async () => {
    const res = await fetch(`${baseUrl}/api/v1/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        targetRole: 'Staff Infrastructure Engineer',
        interviewType: 'TECHNICAL',
        resumeVersionId: resumeVersionIdUserA,
        jobDescriptionId: jobIdUserA,
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.session.id);
    assert.strictEqual(body.session.targetRole, 'Staff Infrastructure Engineer');
    assert.strictEqual(body.session.interviewType, 'TECHNICAL');
    assert.ok(Array.isArray(body.session.questions));
    assert.ok(body.session.questions.length >= 2);

    const q1 = body.session.questions[0];
    assert.ok(q1.questionText);
    assert.ok(q1.starPrompt.includes('STAR'));
    assert.strictEqual(q1.category, 'TECHNICAL');

    createdSessionId = body.session.id;
    firstQuestionText = q1.questionText;
  });

  it('lists interview sessions for the authenticated candidate', async () => {
    const res = await fetch(`${baseUrl}/api/v1/interviews`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.sessions));
    assert.ok(body.sessions.some((s: any) => s.id === createdSessionId));
  });

  it('retrieves interview session by ID', async () => {
    const res = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.session.id, createdSessionId);
    assert.strictEqual(body.session.targetRole, 'Staff Infrastructure Engineer');
  });

  it('evaluates candidate text answer with STAR structured rubric and returns scores across 5 dimensions', async () => {
    const answerPayload = {
      questionText: firstQuestionText,
      userAnswerText:
        'In my previous role at Acme Cloud, we experienced severe database query latency during high-concurrency peak traffic. ' +
        'My task was to diagnose the PostgreSQL bottleneck and reduce p99 query latency below 50ms. ' +
        'I implemented connection pooling using PgBouncer, optimized composite indexes on the high-volume audit logs, and introduced Redis caching for read-heavy sessions. ' +
        'This resulted in a 65% reduction in latency and successfully handled 50,000 requests per second with zero downtime.',
      category: 'TECHNICAL',
    };

    const res = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify(answerPayload),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.answer.id);
    assert.strictEqual(body.answer.questionText, firstQuestionText);
    assert.ok(body.answer.starRating >= 4);

    const feedback = body.answer.feedbackDetails;
    assert.ok(feedback);
    assert.ok(feedback.relevance >= 1 && feedback.relevance <= 5);
    assert.ok(feedback.clarity >= 1 && feedback.clarity <= 5);
    assert.ok(feedback.structure >= 4); // STAR fully articulated
    assert.ok(feedback.evidence >= 4); // Cites 65%, 50ms, 50,000 rps
    assert.ok(feedback.concision >= 1 && feedback.concision <= 5);
    assert.ok(feedback.overallRating >= 4);

    assert.ok(feedback.starBreakdown);
    assert.ok(feedback.starBreakdown.situation);
    assert.ok(feedback.starBreakdown.task);
    assert.ok(feedback.starBreakdown.action);
    assert.ok(feedback.starBreakdown.result);

    assert.ok(Array.isArray(feedback.strengths));
    assert.ok(feedback.strengths.length > 0);
  });

  it('ETHICAL GUARDRAIL: explicitly verifies absence of emotion/personality profiling and presence of nonEmotionNotice', async () => {
    const res = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });

    const body = await res.json();
    const answer = body.session.answers[0];
    assert.ok(answer);

    const feedback = answer.feedbackDetails;
    assert.ok(feedback);

    // Verify non-emotion notice is present and exact
    assert.strictEqual(
      feedback.nonEmotionNotice,
      GeminiInterviewAdapter.NON_EMOTION_NOTICE
    );

    // Verify forbidden psychological/emotional inferences are not present
    assert.strictEqual((feedback as any).emotion, undefined);
    assert.strictEqual((feedback as any).personality, undefined);
    assert.strictEqual((feedback as any).sentiment, undefined);
    assert.strictEqual((feedback as any).nervousness, undefined);
  });

  it('CROSS-TENANT IDOR: User B cannot view User A interview session, submit answers, or complete it', async () => {
    // 1. User B viewing User A session -> 404
    const viewRes = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenUserB}`,
      },
    });
    assert.strictEqual(viewRes.status, 404);

    // 2. User B submitting answer to User A session -> 404
    const answerRes = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({
        questionText: firstQuestionText,
        userAnswerText: 'Malicious attempt to answer another candidate session.',
      }),
    });
    assert.strictEqual(answerRes.status, 404);

    // 3. User B completing User A session -> 404
    const completeRes = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenUserB}`,
      },
    });
    assert.strictEqual(completeRes.status, 404);

    // 4. User B creating session using User A resume version -> 404
    const startRes = await fetch(`${baseUrl}/api/v1/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({
        targetRole: 'Infiltrator',
        interviewType: 'TECHNICAL',
        resumeVersionId: resumeVersionIdUserA,
      }),
    });
    assert.strictEqual(startRes.status, 404);
  });

  it('completes session, generates practice report, and locks session against further answers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.session.completedAt);
    assert.ok(body.session.summaryReport);

    const report = body.session.summaryReport;
    assert.strictEqual(report.answeredQuestions, 1);
    assert.ok(report.averageRating >= 4);
    assert.ok(Array.isArray(report.overallStrengths));
    assert.ok(Array.isArray(report.practicePlan));

    // Trying to submit another answer to completed session must be rejected (400 validation error)
    const postCompleteAnswer = await fetch(`${baseUrl}/api/v1/interviews/${createdSessionId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        questionText: firstQuestionText,
        userAnswerText: 'Late answer after completion.',
      }),
    });

    assert.strictEqual(postCompleteAnswer.status, 400);
  });
});
