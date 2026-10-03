import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { InMemoryAuthRepository } from '../src/modules/auth/auth.repository.js';
import { InMemoryProfilesRepository } from '../src/modules/profiles/profiles.repository.js';
import { InMemoryResumesRepository } from '../src/modules/resumes/resumes.repository.js';

describe('Phase 2 — Resume Builder, Versioning, and Secure Exports', () => {
  let server: Server;
  let baseUrl: string;
  let authRepo: InMemoryAuthRepository;
  let profilesRepo: InMemoryProfilesRepository;
  let resumesRepo: InMemoryResumesRepository;
  let tokenUserA: string;
  let tokenUserB: string;
  let resumeIdUserA: string;

  before(async () => {
    authRepo = new InMemoryAuthRepository();
    profilesRepo = new InMemoryProfilesRepository();
    resumesRepo = new InMemoryResumesRepository();
    const app = createApp({ authRepo, profilesRepo, resumesRepo });

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
        email: 'engineer.a@example.com',
        password: 'Password12345!',
        fullName: 'Arif Ahmed',
      }),
    });
    tokenUserA = ((await resA.json()) as any).accessToken;

    // Set up User A profile data
    await fetch(`${baseUrl}/api/v1/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        headline: 'Senior Backend Engineer',
        summary: 'Specializing in high-throughput distributed architectures.',
        location: 'Dhaka, Bangladesh',
      }),
    });

    // Register User B
    const resB = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user.b@example.com',
        password: 'Password12345!',
        fullName: 'Unauthorized User B',
      }),
    });
    tokenUserB = ((await resB.json()) as any).accessToken;
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('creates a new resume seeded from profile data and initializes version 1', async () => {
    const res = await fetch(`${baseUrl}/api/v1/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        title: 'Backend Engineering Resume',
        templateName: 'Foundation',
        fromProfile: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.resume.title, 'Backend Engineering Resume');
    assert.strictEqual(body.resume.templateName, 'Foundation');
    assert.strictEqual(body.resume.versions.length, 1);
    assert.strictEqual(body.resume.versions[0].versionNumber, 1);

    resumeIdUserA = body.resume.id;
  });

  it('creates an immutable snapshot when updating resume content (version 2)', async () => {
    // 1. Get initial version 1 content
    const getInitial = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    const initialBody = (await getInitial.json()) as any;
    const v1Content = initialBody.resume.versions[0].contentSnapshot;

    // 2. Update with modified content including an experience entry
    const newContent = {
      ...v1Content,
      summary: 'Updated summary for Tech Lead role',
      experiences: [
        {
          company: 'Acme Corp',
          role: 'Lead Architect',
          startDate: '2022-01-01',
          isCurrent: true,
          highlights: ['Built real-time messaging pipeline', 'Reduced latency by 45%'],
        },
      ],
    };

    const updateRes = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        content: newContent,
      }),
    });

    assert.strictEqual(updateRes.status, 200);
    const updateBody = (await updateRes.json()) as any;

    // Must have 2 versions now
    assert.strictEqual(updateBody.resume.versions.length, 2);
    assert.strictEqual(updateBody.resume.versions[0].versionNumber, 2);
    assert.strictEqual(updateBody.resume.versions[0].contentSnapshot.summary, 'Updated summary for Tech Lead role');

    // IMMUTABILITY CHECK: Version 1 content must remain unmodified
    const v1Preserved = updateBody.resume.versions[1];
    assert.strictEqual(v1Preserved.versionNumber, 1);
    assert.notStrictEqual(v1Preserved.contentSnapshot.summary, 'Updated summary for Tech Lead role');
  });

  it('IDOR PREVENTION: User B cannot access or export User A resume', async () => {
    // User B tries to fetch User A's resume
    const getRes = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });
    assert.strictEqual(getRes.status, 404);

    // User B tries to export User A's resume
    const exportDocxRes = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}/export/docx`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUserB}` },
    });
    assert.strictEqual(exportDocxRes.status, 404);
  });

  it('renders HTML preview and sanitizes script tags against XSS', async () => {
    // Update resume with an XSS injection attempt
    const getRes = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    const { resume } = (await getRes.json()) as any;
    const currentContent = resume.versions[0].contentSnapshot;

    await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserA}`,
      },
      body: JSON.stringify({
        content: {
          ...currentContent,
          summary: 'Malicious payload <script>alert("xss")</script> test',
        },
      }),
    });

    const previewRes = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}/preview`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(previewRes.status, 200);
    const html = await previewRes.text();

    // Verify XSS tag was safely escaped
    assert.ok(!html.includes('<script>alert("xss")</script>'));
    assert.ok(html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
  });

  it('exports DOCX binary with valid Office OpenXML signature (PK header)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}/export/docx`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(
      res.headers.get('content-type'),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    assert.ok(res.headers.get('content-disposition')?.includes('.docx'));

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Verify standard ZIP / OpenXML magic numbers: 0x50, 0x4B, 0x03, 0x04 ('PK\x03\x04')
    assert.strictEqual(bytes[0], 0x50);
    assert.strictEqual(bytes[1], 0x4B);
    assert.strictEqual(bytes[2], 0x03);
    assert.strictEqual(bytes[3], 0x04);
  });

  it('exports PDF with application/pdf content type and valid PDF header', async () => {
    const res = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}/export/pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    assert.ok(res.headers.get('content-disposition')?.includes('.pdf'));

    const text = await res.text();
    assert.ok(text.startsWith('%PDF-'));
  });

  it('duplicates resume and creates copy', async () => {
    const res = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.ok(body.resume.title.includes('(Copy)'));
  });

  it('archives resume so it no longer appears in active list', async () => {
    const archiveRes = await fetch(`${baseUrl}/api/v1/resumes/${resumeIdUserA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    assert.strictEqual(archiveRes.status, 200);

    const listRes = await fetch(`${baseUrl}/api/v1/resumes`, {
      headers: { Authorization: `Bearer ${tokenUserA}` },
    });
    const listBody = (await listRes.json()) as any;
    const found = listBody.resumes.some((r: any) => r.id === resumeIdUserA);
    assert.strictEqual(found, false);
  });
});
