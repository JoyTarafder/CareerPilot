import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { InMemoryAuthRepository } from '../src/modules/auth/auth.repository.js';
import { InMemoryProfilesRepository } from '../src/modules/profiles/profiles.repository.js';

describe('Phase 1 — Career Profile & IDOR Ownership Boundary', () => {
  let server: Server;
  let baseUrl: string;
  let authRepo: InMemoryAuthRepository;
  let profilesRepo: InMemoryProfilesRepository;
  let tokenUserA: string;
  let tokenUserB: string;

  before(async () => {
    authRepo = new InMemoryAuthRepository();
    profilesRepo = new InMemoryProfilesRepository();
    const app = createApp({ authRepo, profilesRepo });

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
    const resA = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usera@example.com',
        password: 'Password12345!',
        fullName: 'User A',
      }),
    });
    tokenUserA = ((await resA.json()) as any).accessToken;

    // Register User B
    const resB = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'userb@example.com',
        password: 'Password12345!',
        fullName: 'User B',
      }),
    });
    tokenUserB = ((await resB.json()) as any).accessToken;
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('rejects unauthenticated access to profile endpoints with 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/profile`);
    assert.strictEqual(res.status, 401);
  });

  it('allows User A to update headline and summary via autosave', async () => {
    const updateRes = await fetch(`${baseUrl}/api/v1/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        headline: 'Full-Stack Software Engineer',
        summary: 'Passionate about distributed systems and clean architecture.',
        targetRoles: ['Backend Engineer', 'Full-Stack Developer'],
      }),
    });

    assert.strictEqual(updateRes.status, 200);
    const body = (await updateRes.json()) as any;
    assert.strictEqual(body.profile.headline, 'Full-Stack Software Engineer');

    // Retrieve to verify persistence
    const getRes = await fetch(`${baseUrl}/api/v1/profile`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    const getBody = (await getRes.json()) as any;
    assert.strictEqual(getBody.profile.headline, 'Full-Stack Software Engineer');
  });

  it('allows User A to add an education item', async () => {
    const res = await fetch(`${baseUrl}/api/v1/profile/educations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        institution: 'University of Dhaka',
        degree: 'BSc',
        fieldOfStudy: 'Computer Science & Engineering',
        startDate: '2020-01-01',
        isCurrent: false,
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.education.institution, 'University of Dhaka');
    assert.ok(body.education.id);
  });

  it('IDOR PREVENTION: User B cannot delete User A education record', async () => {
    // 1. User A adds education record
    const addRes = await fetch(`${baseUrl}/api/v1/profile/educations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        institution: 'BUET',
        degree: 'MSc',
        fieldOfStudy: 'Software Engineering',
        startDate: '2024-01-01',
      }),
    });
    const { education } = (await addRes.json()) as any;
    const targetEducationId = education.id;

    // 2. ATTACK: User B attempts to delete User A's education record!
    const attackRes = await fetch(`${baseUrl}/api/v1/profile/educations/${targetEducationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });

    // Must be rejected with 404 Not Found (or 403) so record existence is not leaked
    assert.strictEqual(attackRes.status, 404);

    // 3. User A can still view their education record
    const userAGetRes = await fetch(`${baseUrl}/api/v1/profile`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    const userABody = (await userAGetRes.json()) as any;
    const found = userABody.profile.educations.some((e: any) => e.id === targetEducationId);
    assert.strictEqual(found, true, 'User A record must remain intact');
  });
});
