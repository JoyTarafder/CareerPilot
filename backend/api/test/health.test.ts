import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server } from 'node:http';
import { createApp } from '../src/app.js';

describe('API Health and Liveness Endpoints', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
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

  it('GET /live returns 200 with status ok', async () => {
    const res = await fetch(`${baseUrl}/live`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.deepStrictEqual(body, { status: 'ok' });
  });

  it('GET /ready returns 200 with status ready', async () => {
    const res = await fetch(`${baseUrl}/ready`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as { status: string };
    assert.strictEqual(body.status, 'ready');
  });

  it('GET /api/v1/health returns 200 and requestId', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as { status: string; service: string; requestId: string };
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'careerpilot-api');
    assert.ok(body.requestId);
  });

  it('GET /unknown-route returns 404 with structured error envelope', async () => {
    const res = await fetch(`${baseUrl}/unknown-route`);
    assert.strictEqual(res.status, 404);
    const body = (await res.json()) as { error: { code: string; message: string; requestId: string } };
    assert.strictEqual(body.error.code, 'NOT_FOUND');
    assert.ok(body.error.requestId);
  });
});
