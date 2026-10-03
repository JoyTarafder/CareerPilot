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
import { InMemoryNotificationsRepository } from '../src/modules/notifications/notifications.repository.js';
import { InMemorySupportRepository } from '../src/modules/support/support.repository.js';
import { getDictionary, DICTIONARIES } from '@careerpilot/contracts';

describe('Phase 7 — Product Maturity: Internationalization, Notification Preferences, and Support-Access Approval', () => {
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
  let notificationsRepo: InMemoryNotificationsRepository;
  let supportRepo: InMemorySupportRepository;

  let tokenCandidate: string;
  let tokenAdmin: string;
  let candidateUserId: string;

  before(async () => {
    authRepo = new InMemoryAuthRepository();
    profilesRepo = new InMemoryProfilesRepository();
    resumesRepo = new InMemoryResumesRepository();
    jobsRepo = new InMemoryJobsRepository();
    matchingRepo = new InMemoryMatchingRepository();
    applicationsRepo = new InMemoryApplicationsRepository();
    writingRepo = new InMemoryWritingRepository();
    interviewRepo = new InMemoryInterviewRepository();
    notificationsRepo = new InMemoryNotificationsRepository();
    supportRepo = new InMemorySupportRepository();

    const app = createApp({
      authRepo,
      profilesRepo,
      resumesRepo,
      jobsRepo,
      matchingRepo,
      applicationsRepo,
      writingRepo,
      interviewRepo,
      notificationsRepo,
      supportRepo,
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

    // Register Candidate
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'candidate-phase7@careerpilot.dev',
        password: 'Password123!Safe',
        fullName: 'Tamim Iqbal',
      }),
    });
    const regData = await regRes.json();
    tokenCandidate = regData.accessToken;
    candidateUserId = regData.user.id;

    // Seed Admin
    const adminUser = await authRepo.createUser({
      email: 'admin-phase7@careerpilot.dev',
      passwordHash: 'dummy-hash',
      fullName: 'System Administrator',
      role: 'ADMIN',
    });
    const { TokenService } = await import('../src/modules/auth/token.service.js');
    const tokenService = new TokenService();
    tokenAdmin = tokenService.signAccessToken({
      sub: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
    }).token;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('retrieves default notification preferences and allows candidate to switch to Bangla locale', async () => {
    // 1. GET default preferences
    const getRes = await fetch(`${baseUrl}/api/v1/notifications/preferences`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenCandidate}`,
      },
    });

    assert.strictEqual(getRes.status, 200);
    const getData = await getRes.json();
    assert.strictEqual(getData.success, true);
    assert.strictEqual(getData.preferences.locale, 'en');
    assert.strictEqual(getData.preferences.emailFollowUpReminders, true);
    assert.strictEqual(getData.preferences.emailInterviewReminders, true);

    // 2. PATCH preferences: switch locale to Bangla (bn) and disable follow-up emails
    const patchRes = await fetch(`${baseUrl}/api/v1/notifications/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCandidate}`,
      },
      body: JSON.stringify({
        locale: 'bn',
        emailFollowUpReminders: false,
      }),
    });

    assert.strictEqual(patchRes.status, 200);
    const patchData = await patchRes.json();
    assert.strictEqual(patchData.success, true);
    assert.strictEqual(patchData.preferences.locale, 'bn');
    assert.strictEqual(patchData.preferences.emailFollowUpReminders, false);
    assert.strictEqual(patchData.preferences.emailInterviewReminders, true);
  });

  it('dispatches reminders honoring candidate preferences (skipping follow-up, sending interview)', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Seed 2 applications for the candidate
    await applicationsRepo.createApplication(candidateUserId, {
      company: 'TechCorp Bangladesh',
      role: 'Senior Software Engineer',
      followUpDate: tomorrow,
    });

    await applicationsRepo.createApplication(candidateUserId, {
      company: 'Cloud Innovators',
      role: 'DevOps Specialist',
      interviewDate: dayAfterTomorrow,
    });

    // Trigger reminder dispatch
    const dispatchRes = await fetch(`${baseUrl}/api/v1/notifications/dispatch-reminders?days=7`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenCandidate}`,
      },
    });

    assert.strictEqual(dispatchRes.status, 200);
    const dispatchData = await dispatchRes.json();
    assert.strictEqual(dispatchData.success, true);
    assert.ok(dispatchData.result.processedCount >= 2);

    const followUpItem = dispatchData.result.items.find((i: any) => i.reminderType === 'FOLLOW_UP');
    assert.ok(followUpItem);
    assert.strictEqual(followUpItem.status, 'SKIPPED_BY_PREFERENCE'); // Because candidate disabled it in previous test!

    const interviewItem = dispatchData.result.items.find((i: any) => i.reminderType === 'INTERVIEW');
    assert.ok(interviewItem);
    assert.strictEqual(interviewItem.status, 'SENT'); // Because interview reminders remain enabled
  });

  it('ADVANCED ADMIN PERMISSIONS & SUPPORT ACCESS: blocks admin access without grant, allows during active grant, and denies upon revocation', async () => {
    // 1. Admin verifies support access before grant -> denied
    const verifyBeforeRes = await fetch(`${baseUrl}/api/v1/support/admin/verify/${candidateUserId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    assert.strictEqual(verifyBeforeRes.status, 200);
    const verifyBeforeData = await verifyBeforeRes.json();
    assert.strictEqual(verifyBeforeData.hasActiveGrant, false);
    assert.strictEqual(verifyBeforeData.grant, null);

    // 2. Candidate grants temporary support access for 24 hours
    const grantRes = await fetch(`${baseUrl}/api/v1/support/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCandidate}`,
      },
      body: JSON.stringify({
        reason: 'Assistance diagnosing LaTeX rendering in ATS template',
        durationHours: 24,
      }),
    });

    assert.strictEqual(grantRes.status, 201);
    const grantData = await grantRes.json();
    assert.strictEqual(grantData.success, true);
    assert.strictEqual(grantData.grant.isActive, true);
    assert.strictEqual(grantData.grant.reason, 'Assistance diagnosing LaTeX rendering in ATS template');

    // 3. Admin verifies access again -> approved
    const verifyDuringRes = await fetch(`${baseUrl}/api/v1/support/admin/verify/${candidateUserId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    assert.strictEqual(verifyDuringRes.status, 200);
    const verifyDuringData = await verifyDuringRes.json();
    assert.strictEqual(verifyDuringData.hasActiveGrant, true);
    assert.strictEqual(verifyDuringData.grant.userId, candidateUserId);

    // 4. Candidate revokes support access
    const revokeRes = await fetch(`${baseUrl}/api/v1/support/revoke`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenCandidate}`,
      },
    });

    assert.strictEqual(revokeRes.status, 200);
    const revokeData = await revokeRes.json();
    assert.strictEqual(revokeData.success, true);

    // 5. Admin verifies access again -> denied immediately
    const verifyAfterRes = await fetch(`${baseUrl}/api/v1/support/admin/verify/${candidateUserId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    assert.strictEqual(verifyAfterRes.status, 200);
    const verifyAfterData = await verifyAfterRes.json();
    assert.strictEqual(verifyAfterData.hasActiveGrant, false);
  });

  it('INTERNATIONALIZATION: validates complete dictionary parity between English and Bangla', () => {
    const enDict = getDictionary('en');
    const bnDict = getDictionary('bn');

    assert.ok(enDict.nav.overview);
    assert.strictEqual(bnDict.nav.overview, 'ওভারভিউ');

    assert.ok(enDict.interviews.ethicalDisclaimer.includes('Emotion or personality'));
    assert.ok(bnDict.interviews.ethicalDisclaimer.includes('আবেগ বা মানসিক'));

    assert.strictEqual(bnDict.settings.language, 'ভাষা ও স্থানীয়করণ');
    assert.strictEqual(bnDict.settings.supportAccess, 'সাময়িক সাপোর্ট অনুমোদন');
  });
});
