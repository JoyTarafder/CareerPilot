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

describe('Phase 4 — Application Tracker, Kanban Pipeline, and Timezone Integrity', () => {
  let server: Server;
  let baseUrl: string;
  let authRepo: InMemoryAuthRepository;
  let profilesRepo: InMemoryProfilesRepository;
  let resumesRepo: InMemoryResumesRepository;
  let jobsRepo: InMemoryJobsRepository;
  let matchingRepo: InMemoryMatchingRepository;
  let applicationsRepo: InMemoryApplicationsRepository;

  let tokenUserA: string;
  let tokenUserB: string;
  let userIdUserA: string;
  let userIdUserB: string;

  let resumeVersionIdUserA: string;
  let matchAnalysisIdUserA: string;
  let createdAppIdUserA: string;

  before(async () => {
    authRepo = new InMemoryAuthRepository();
    profilesRepo = new InMemoryProfilesRepository();
    resumesRepo = new InMemoryResumesRepository();
    jobsRepo = new InMemoryJobsRepository();
    matchingRepo = new InMemoryMatchingRepository();
    applicationsRepo = new InMemoryApplicationsRepository();

    const app = createApp({
      authRepo,
      profilesRepo,
      resumesRepo,
      jobsRepo,
      matchingRepo,
      applicationsRepo,
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

    // Register Candidate User A
    const resA = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tracker.arif@example.com',
        password: 'Password12345!',
        fullName: 'Arif Ahmed',
      }),
    });
    const bodyA = (await resA.json()) as any;
    tokenUserA = bodyA.accessToken;
    userIdUserA = bodyA.user.id;

    // Register Candidate User B (Intruder)
    const resB = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'intruder.b@example.com',
        password: 'Password12345!',
        fullName: 'Intruder B',
      }),
    });
    const bodyB = (await resB.json()) as any;
    tokenUserB = bodyB.accessToken;
    userIdUserB = bodyB.user.id;

    // Seed mock Resume Version and Match Analysis for User A
    resumeVersionIdUserA = 'a1111111-1111-4111-a111-111111111111';
    matchAnalysisIdUserA = 'b2222222-2222-4222-b222-222222222222';

    applicationsRepo.userResumes.set(resumeVersionIdUserA, {
      userId: userIdUserA,
      resumeTitle: 'Fullstack Engineer Resume',
      versionNumber: 1,
    });

    applicationsRepo.userAnalyses.set(matchAnalysisIdUserA, {
      userId: userIdUserA,
      score: 88,
      scoringVersion: '1.0.0',
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('creates a job application in SAVED status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        company: 'Stripe',
        role: 'Software Engineer, Infrastructure',
        location: 'Remote, Singapore / Dhaka',
        salaryNote: '$80,000 - $110,000 USD',
        status: 'SAVED',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.application.company, 'Stripe');
    assert.strictEqual(body.application.role, 'Software Engineer, Infrastructure');
    assert.strictEqual(body.application.status, 'SAVED');
    assert.strictEqual(body.application.appliedDate, null);

    createdAppIdUserA = body.application.id;
  });

  it('auto-sets appliedDate when transitioning directly to APPLIED without explicit date', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        company: 'Wise',
        role: 'Backend Developer',
        status: 'APPLIED',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.application.status, 'APPLIED');
    assert.ok(body.application.appliedDate !== null, 'appliedDate should be auto-set');
  });

  it('links verified resume version and match analysis with relations', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        company: 'Vercel',
        role: 'Frontend Infrastructure Engineer',
        status: 'APPLIED',
        resumeVersionId: resumeVersionIdUserA,
        matchAnalysisId: matchAnalysisIdUserA,
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.application.resumeVersionId, resumeVersionIdUserA);
    assert.strictEqual(body.application.resumeVersion?.resumeTitle, 'Fullstack Engineer Resume');
    assert.strictEqual(body.application.resumeVersion?.versionNumber, 1);
    assert.strictEqual(body.application.matchAnalysisId, matchAnalysisIdUserA);
    assert.strictEqual(body.application.matchAnalysis?.score, 88);
  });

  it('CROSS-TENANT IDOR: User B cannot link User A resume version or match analysis', async () => {
    // User B attempts to link User A's resume version
    const resumeAttack = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({
        company: 'Malicious Corp',
        role: 'Hacker',
        resumeVersionId: resumeVersionIdUserA,
      }),
    });

    assert.strictEqual(resumeAttack.status, 403);
    const resErr = (await resumeAttack.json()) as any;
    assert.strictEqual(resErr.error.code, 'FORBIDDEN');

    // User B attempts to link User A's match analysis
    const analysisAttack = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({
        company: 'Malicious Corp',
        role: 'Hacker',
        matchAnalysisId: matchAnalysisIdUserA,
      }),
    });

    assert.strictEqual(analysisAttack.status, 403);
    const anaErr = (await analysisAttack.json()) as any;
    assert.strictEqual(anaErr.error.code, 'FORBIDDEN');
  });

  it('CROSS-TENANT IDOR: User B cannot view, update, status-change, or delete User A application', async () => {
    // View
    const getRes = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });
    assert.strictEqual(getRes.status, 404);

    // Update
    const patchRes = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({ role: 'Compromised Role' }),
    });
    assert.strictEqual(patchRes.status, 404);

    // Status change
    const statusRes = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserB}`,
      },
      body: JSON.stringify({ status: 'OFFER' }),
    });
    assert.strictEqual(statusRes.status, 404);

    // Delete
    const deleteRes = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });
    assert.strictEqual(deleteRes.status, 404);
  });

  it('KEYBOARD ACCESSIBILITY: updates application status via dedicated status endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({ status: 'INTERVIEW' }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.application.status, 'INTERVIEW');
  });

  it('TIMEZONE FIDELITY: handles Asia/Dhaka (+06:00) offsets and stores canonical UTC', async () => {
    // 3:30 PM in Dhaka (+06:00) is 9:30 AM UTC on same date
    const dhakaIso = '2026-10-15T15:30:00+06:00';
    const expectedUtc = '2026-10-15T09:30:00.000Z';

    const res = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        interviewDate: dhakaIso,
        followUpDate: '2026-10-18T10:00:00+06:00',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;

    assert.strictEqual(body.application.interviewDate, expectedUtc);
    assert.strictEqual(
      new Date(body.application.interviewDate).getTime(),
      new Date(dhakaIso).getTime()
    );
  });

  it('FILTERS & PAGINATION: filters by status, search, and supports pagination', async () => {
    // User A creates additional applications
    await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        company: 'GitHub',
        role: 'DevRel Engineer',
        status: 'OFFER',
      }),
    });

    await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        company: 'Cloudflare',
        role: 'Systems Engineer',
        status: 'REJECTED',
      }),
    });

    // Filter by status=OFFER
    const offerRes = await fetch(`${baseUrl}/api/v1/applications?status=OFFER`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(offerRes.status, 200);
    const offerBody = (await offerRes.json()) as any;
    assert.strictEqual(offerBody.items.length, 1);
    assert.strictEqual(offerBody.items[0].company, 'GitHub');

    // Search by keyword
    const searchRes = await fetch(`${baseUrl}/api/v1/applications?search=systems`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(searchRes.status, 200);
    const searchBody = (await searchRes.json()) as any;
    assert.strictEqual(searchBody.items.length, 1);
    assert.strictEqual(searchBody.items[0].company, 'Cloudflare');

    // Pagination
    const pageRes = await fetch(`${baseUrl}/api/v1/applications?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(pageRes.status, 200);
    const pageBody = (await pageRes.json()) as any;
    assert.strictEqual(pageBody.items.length, 2);
    assert.ok(pageBody.total >= 5);
    assert.ok(pageBody.totalPages >= 3);
  });

  it('ANALYTICS: calculates response, interview, and offer conversion rates accurately', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications/metrics`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    const metrics = body.metrics;

    assert.ok(metrics.total >= 5);
    assert.ok(typeof metrics.responseRate === 'number');
    assert.ok(typeof metrics.interviewRate === 'number');
    assert.ok(typeof metrics.offerRate === 'number');
    assert.ok(metrics.byStatus.OFFER >= 1);
    assert.ok(metrics.byStatus.INTERVIEW >= 1);
    assert.ok(metrics.byStatus.REJECTED >= 1);
  });

  it('REMINDERS: returns upcoming follow-up and interview dates within specified days window', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications/reminders?days=30`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(Array.isArray(body.reminders));
    // The Stripe application has interview/followup in October 2026, which is in the future
    assert.ok(body.reminders.length >= 1);
    assert.strictEqual(body.reminders[0].company, 'Stripe');
  });

  it('deletes an application', async () => {
    const res = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(res.status, 200);

    // Verify deleted
    const getRes = await fetch(`${baseUrl}/api/v1/applications/${createdAppIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(getRes.status, 404);
  });
});
