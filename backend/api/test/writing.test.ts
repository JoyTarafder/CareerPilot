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
import { GeminiWritingAdapter } from '../src/modules/ai/gemini-writing.adapter.js';

describe('Phase 5 — AI Writing, Cover Letter Generation, Hallucination Guardrails, and Quota Management', () => {
  let server: Server;
  let baseUrl: string;
  let authRepo: InMemoryAuthRepository;
  let profilesRepo: InMemoryProfilesRepository;
  let resumesRepo: InMemoryResumesRepository;
  let jobsRepo: InMemoryJobsRepository;
  let matchingRepo: InMemoryMatchingRepository;
  let applicationsRepo: InMemoryApplicationsRepository;
  let writingRepo: InMemoryWritingRepository;
  let writingAdapter: GeminiWritingAdapter;

  let tokenUserA: string;
  let tokenUserB: string;
  let tokenAdmin: string;
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
    writingAdapter = new GeminiWritingAdapter();

    const app = createApp({
      authRepo,
      profilesRepo,
      resumesRepo,
      jobsRepo,
      matchingRepo,
      applicationsRepo,
      writingRepo,
      writingAdapter,
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

    // Register User A (Candidate)
    const resA = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'writer.arif@example.com',
        password: 'Password12345!',
        fullName: 'Arif Ahmed',
      }),
    });
    const bodyA = (await resA.json()) as any;
    tokenUserA = bodyA.accessToken;
    userIdUserA = bodyA.user.id;

    // Register User B (Intruder)
    const resB = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'intruder.writer@example.com',
        password: 'Password12345!',
        fullName: 'Intruder Writer',
      }),
    });
    const bodyB = (await resB.json()) as any;
    tokenUserB = bodyB.accessToken;
    userIdUserB = bodyB.user.id;

    // Create Admin User directly in auth repo
    const adminUser = await authRepo.createUser({
      email: 'admin.editor@example.com',
      passwordHash: 'dummy-hash',
      fullName: 'Admin Editor',
      role: 'ADMIN',
    });
    // Generate valid admin access token
    const { TokenService } = await import('../src/modules/auth/token.service.js');
    const tokenService = new TokenService();
    tokenAdmin = tokenService.signAccessToken({
      sub: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
    }).token;

    // Seed mock Resume Snapshot for User A
    resumeVersionIdUserA = 'c3333333-3333-4333-c333-333333333333';
    writingRepo.userResumes.set(resumeVersionIdUserA, {
      userId: userIdUserA,
      contentSnapshot: {
        personalInfo: {
          fullName: 'Arif Ahmed',
          email: 'writer.arif@example.com',
        },
        summary: 'Software engineer passionate about scalable backend architecture and APIs.',
        skills: [
          {
            category: 'Languages & Tools',
            items: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
          },
        ],
        experiences: [
          {
            role: 'Backend Engineer',
            company: 'Cloud Innovators',
            highlights: [
              'Designed REST APIs for high-throughput billing systems',
              'Refactored legacy PostgreSQL queries to improve read latency',
            ],
          },
        ],
        educations: [
          {
            degree: 'BSc in Computer Science',
            institution: 'BUET',
          },
        ],
      },
    });

    // Seed mock Job for User A
    jobIdUserA = 'd4444444-4444-4444-d444-444444444444';
    writingRepo.userJobs.set(jobIdUserA, {
      userId: userIdUserA,
      title: 'Senior Backend Engineer',
      company: 'Datadog',
      extractedData: {
        requiredSkills: ['TypeScript', 'Node.js', 'PostgreSQL'],
        responsibilities: ['Build distributed telemetry ingestion pipelines'],
      },
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('improves resume bullet using action verbs and returns Original / Suggested / Why', async () => {
    const res = await fetch(`${baseUrl}/api/v1/writing/improve-bullet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        originalBullet: 'helped build the payment gateway for customers',
        contextRole: 'Backend Engineer',
        targetJobKeywords: ['TypeScript', 'Stripe API'],
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.ok(body.improvement);
    assert.strictEqual(body.improvement.original, 'helped build the payment gateway for customers');
    assert.ok(body.improvement.suggested.length > 10);
    assert.ok(body.improvement.why.length > 5);
  });

  it('improves summary aligning to target role and verified skills', async () => {
    const res = await fetch(`${baseUrl}/api/v1/writing/improve-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        originalSummary: 'Developer building web applications and backend systems for three years.',
        targetRole: 'Senior Backend Engineer',
        skills: ['TypeScript', 'PostgreSQL', 'Docker'],
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.ok(body.improvement.suggested.includes('Senior Backend Engineer'));
    assert.ok(body.improvement.suggested.includes('TypeScript'));
  });

  it('HALLUCINATION GUARDRAIL: flags unsupported metrics or claims when added to draft', () => {
    // Testing the adapter guardrail detector directly with invented metric
    const original = 'Worked on database queries to make page loading faster';
    const inventedMetricSuggestion =
      'Optimized database queries resulting in a 45% reduction in latency and $200k cost savings.';

    // Check detector method
    const adapterAny = writingAdapter as any;
    const warning = adapterAny.detectUnsupportedMetrics(original, inventedMetricSuggestion);

    assert.ok(warning !== null, 'Warning must be triggered for invented metrics');
    assert.ok(warning.includes('45%') || warning.includes('$200k'));
  });

  it('generates evidence-bound cover letter grounded in verified resume facts', async () => {
    const res = await fetch(`${baseUrl}/api/v1/writing/cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        resumeVersionId: resumeVersionIdUserA,
        jobDescriptionId: jobIdUserA,
        tone: 'professional',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    const letter = body.coverLetter;

    assert.ok(letter.salutation.length > 0);
    assert.ok(letter.opening.includes('Datadog') || letter.opening.includes('Backend Engineer'));
    assert.ok(Array.isArray(letter.bodyParagraphs));
    assert.ok(letter.bodyParagraphs.length >= 2);
    assert.ok(letter.closing.includes('Arif Ahmed'));
    assert.ok(Array.isArray(letter.groundedClaims));
    assert.ok(letter.groundedClaims.includes('TypeScript'));
  });

  it('CROSS-TENANT IDOR: User B cannot generate cover letter using User A resume or job', async () => {
    // User B attempts to use User A's resume version
    const resumeAttack = await fetch(`${baseUrl}/api/v1/writing/cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({
        resumeVersionId: resumeVersionIdUserA,
        jobDescriptionId: jobIdUserA,
      }),
    });
    assert.strictEqual(resumeAttack.status, 403);

    // Seed dummy resume for User B to isolate job attack
    const resumeVersionIdUserB = 'e5555555-5555-4555-e555-555555555555';
    writingRepo.userResumes.set(resumeVersionIdUserB, {
      userId: userIdUserB,
      contentSnapshot: { personalInfo: { fullName: 'Intruder' }, skills: [] },
    });

    // User B attempts to use User A's job description
    const jobAttack = await fetch(`${baseUrl}/api/v1/writing/cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({
        resumeVersionId: resumeVersionIdUserB,
        jobDescriptionId: jobIdUserA,
      }),
    });
    assert.strictEqual(jobAttack.status, 403);
  });

  it('QUOTA ENFORCEMENT: tracks daily AI quota and rejects requests when limit is exceeded', async () => {
    // Check initial quota status
    const quotaRes = await fetch(`${baseUrl}/api/v1/writing/quota`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(quotaRes.status, 200);
    const quotaBody = (await quotaRes.json()) as any;
    assert.strictEqual(quotaBody.quota.dailyLimit, 50);
    assert.ok(quotaBody.quota.usedToday >= 3); // Previous calls incremented quota
    assert.ok(quotaBody.quota.remainingToday <= 47);

    // Simulate quota exhaustion for User A
    const today = new Date().toISOString().split('T')[0]!;
    writingRepo.userUsage.set(userIdUserA, { count: 50, date: today });

    // Subsequent request must be rejected with 429
    const blockedRes = await fetch(`${baseUrl}/api/v1/writing/improve-bullet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        originalBullet: 'tested backend performance and fixed memory leaks',
      }),
    });

    assert.strictEqual(blockedRes.status, 429);
    const errBody = (await blockedRes.json()) as any;
    assert.strictEqual(errBody.error.code, 'QUOTA_EXCEEDED');
  });

  it('ADMIN COST & FAILURE DASHBOARD: admin can view aggregate AI metrics while candidates are forbidden', async () => {
    // Candidate attempt -> 403
    const candidateRes = await fetch(`${baseUrl}/api/v1/writing/admin/metrics`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(candidateRes.status, 403);

    // Admin attempt -> 200 with cost and failure monitoring metrics
    const adminRes = await fetch(`${baseUrl}/api/v1/writing/admin/metrics`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.strictEqual(adminRes.status, 200);
    const adminBody = (await adminRes.json()) as any;
    assert.strictEqual(adminBody.success, true);
    assert.ok(typeof adminBody.metrics.totalRequests === 'number');
    assert.ok(typeof adminBody.metrics.successfulRequests === 'number');
    assert.ok(typeof adminBody.metrics.failedRequests === 'number');
    assert.ok(typeof adminBody.metrics.estimatedTokens === 'number');
    assert.ok(typeof adminBody.metrics.estimatedCostUsd === 'number');
  });
});
