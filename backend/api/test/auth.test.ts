import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { InMemoryAuthRepository } from '../src/modules/auth/auth.repository.js';
import { InMemoryProfilesRepository } from '../src/modules/profiles/profiles.repository.js';

describe('Phase 1 — Authentication, Session Lifecycle, and Replay Defense', () => {
  let server: Server;
  let baseUrl: string;
  let authRepo: InMemoryAuthRepository;
  let profilesRepo: InMemoryProfilesRepository;

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
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('rejects candidate registration when password is less than 12 characters', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'short-pass', // 10 chars
        fullName: 'Nabila Rahman',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as any;
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fieldErrors.password);
  });

  it('rejects candidate registration when password exceeds 30 characters', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'a'.repeat(31),
        fullName: 'Nabila Rahman',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as any;
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  it('registers a candidate with valid 12-30 char password and sets HttpOnly refresh cookie', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'ValidSecret123!',
        fullName: 'Nabila Rahman',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.user.email, 'nabila@example.com');
    assert.strictEqual(body.user.fullName, 'Nabila Rahman');
    assert.strictEqual(body.user.role, 'CANDIDATE');
    assert.ok(body.accessToken);

    // Verify refresh cookie set with HttpOnly
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes('refreshToken='));
    assert.ok(setCookie.toLowerCase().includes('httponly'));

    // Verify password is stored as Argon2id hash with pepper, NOT plaintext
    const storedUser = await authRepo.findUserByEmail('nabila@example.com');
    assert.ok(storedUser);
    assert.notStrictEqual(storedUser.passwordHash, 'ValidSecret123!');
    assert.ok(storedUser.passwordHash.startsWith('$argon2id$'));
  });

  it('rejects registration with already registered email', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'AnotherSecretPass123!',
        fullName: 'Nabila Imposter',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as any;
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  it('authenticates candidate login and returns access token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'ValidSecret123!',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.accessToken);
    assert.strictEqual(body.user.email, 'nabila@example.com');
  });

  it('rejects login with wrong password without leaking account existence', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'WrongPassword123!',
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as any;
    assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    assert.strictEqual(body.error.message, 'Invalid email or password');
  });

  it('accesses /api/v1/auth/me with valid Bearer token', async () => {
    // First login
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'ValidSecret123!',
      }),
    });
    const { accessToken } = (await loginRes.json()) as any;

    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(meRes.status, 200);
    const meBody = (await meRes.json()) as any;
    assert.strictEqual(meBody.user.email, 'nabila@example.com');
  });

  it('rotates refresh token and detects replay attacks (revoking family)', async () => {
    // 1. Login to get initial refresh cookie
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nabila@example.com',
        password: 'ValidSecret123!',
      }),
    });
    const setCookie = loginRes.headers.get('set-cookie')!;
    const initialCookie = setCookie.split(';')[0]!;

    // 2. Refresh with the initial token (Legitimate client rotation)
    const refreshRes1 = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: initialCookie },
    });

    assert.strictEqual(refreshRes1.status, 200);
    const rotatedCookie = refreshRes1.headers.get('set-cookie')!.split(';')[0]!;
    assert.notStrictEqual(initialCookie, rotatedCookie);

    // 3. ATTACK: Attempt to use the OLD (already rotated) initial token again!
    const replayAttackRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: initialCookie },
    });

    // Replay attack must be blocked!
    assert.strictEqual(replayAttackRes.status, 401);
    const replayBody = (await replayAttackRes.json()) as any;
    assert.ok(replayBody.error.message.includes('Session compromised'));

    // 4. Verify family revocation: the rotated token should NOW also be revoked
    // because the entire token family was compromised by the replay attack!
    const afterCompromiseRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: rotatedCookie },
    });

    assert.strictEqual(afterCompromiseRes.status, 401);
  });
});
