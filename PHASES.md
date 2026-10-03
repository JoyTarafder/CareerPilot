# CareerPilot — Delivery Phases and Roadmap

Assumption: a small team or capstone group working in two-week sprints. Dates should be assigned after team capacity is known. Security, accessibility, tests, and documentation are included in every phase—not postponed to the end.

## Phase 0 — Discovery and foundations (1–2 weeks)

### Deliverables

- Validated scope, personas, critical journeys, and non-goals.
- Low-fidelity flow for onboarding, CV builder, analysis, and tracker.
- Monorepo, coding standards, branch/review policy, CI baseline.
- Local PostgreSQL + Prisma migration workflow.
- Environment validation and secret handling.
- Threat model, data classification, retention draft, and API contract style.
- Design tokens and accessible component foundations.

### Exit criteria

- Architecture and security decisions reviewed.
- Frontend, API, database migration, and test pipeline run in development/staging.
- No credentials committed; secret scanning enabled.

## Phase 1 — Secure identity and profile (2 weeks)

### Candidate scope

- Registration, verification, login/logout, reset password.
- Argon2id + salt + pepper.
- Short JWT access session and rotating refresh tokens.
- Profile with education, experience, projects, and skills.
- Autosave, validation, account settings, session revocation.

### Admin scope

- One-time environment bootstrap command.
- Separate admin login surface.
- Mandatory first-login password change and MFA foundation.
- Minimal user metadata search and audit events.

### Quality gates

- IDOR, brute-force, enumeration, refresh replay, CSRF, and validation tests.
- Keyboard and mobile QA for all forms.

## Phase 2 — Resume builder and exports (2–3 weeks)

### Deliverables

- Resume creation, section ordering, versioning, preview.
- Foundation, Editorial, and Technical ATS-safe templates.
- PDF worker with Playwright/Puppeteer.
- DOCX export using semantic document model and `docx`.
- Private object storage and signed downloads.
- Export job status, retry policy, and failure recovery.

### Exit criteria

- PDF text is selectable and reading order is sensible.
- DOCX opens correctly in Microsoft Word and LibreOffice.
- Page breaks, long content, Bangla/English fonts, and malicious input tested.
- Renderer cannot access arbitrary network/internal resources.

## Phase 3 — Job parsing and deterministic matching (2–3 weeks)

### Deliverables

- Paste/upload job description and review extracted requirements.
- Gemini adapter with identifier redaction, structured output, timeouts, and quotas.
- Skill alias/normalization dictionary.
- Pure TypeScript scoring package and versioned rule sets.
- Evidence Map, category breakdown, gaps, and disclaimer.
- Golden fixture suite for repeatability and bias/error review.

### Exit criteria

- Same normalized input + scoring version returns the same score.
- Invalid/failed AI output falls back to manual review without data loss.
- Each score is traceable to evidence and rule weight.
- Prompt-injection fixtures cannot alter authorization or scoring rules.

## Phase 4 — Application tracker (2 weeks)

### Deliverables

- Saved opportunity and application CRUD.
- Board and table views, filters, follow-up/interview dates.
- Link immutable CV version, job description, analysis, and cover letter placeholder.
- Clearly defined analytics: response/interview/offer rates.
- Reminder-ready domain events; email reminders optional for MVP.

### Exit criteria

- Keyboard-accessible status changes.
- Time-zone behavior verified for Asia/Dhaka and UTC storage.
- Server pagination and ownership tests pass.

## MVP release gate

Release after Phases 0–4 when:

- Critical candidate journey works end-to-end.
- Admin can handle basic operations without unrestricted content access.
- Security checklist has no unresolved critical/high issue.
- Accessibility review reaches WCAG 2.2 AA target for critical flows.
- Backup restore, migration rollback/roll-forward, monitoring, and incident drill pass.
- Privacy notice accurately explains Gemini free-tier processing and product limitations.

## Phase 5 — AI writing and cover letters (2 weeks)

- Summary and bullet improvements with Original/Suggested/Why diff.
- Evidence-bound cover letter generation.
- Accept/edit/dismiss flow and revision history.
- Hallucination guardrails and unsupported-claim warning.
- AI usage quotas, admin failure dashboard, and cost monitoring.

## Phase 6 — Interview preparation (2–3 weeks)

- Text interview sessions: HR, behavioral, technical, mixed.
- CV/job-grounded questions and bounded follow-ups.
- STAR guidance and structured feedback.
- Session reports and practice recommendations.
- Explicitly exclude emotion/personality inference.

## Phase 7 — Product maturity (ongoing)

- Internationalization including Bangla UX/content.
- Advanced admin permissions and support-access approval.
- Email reminders and notification preferences.
- Template marketplace only after governance exists.
- Paid tier/provider privacy upgrade before broader sensitive-data use.
- Performance tuning based on measurements; introduce Redis/queues only if justified.
- External penetration testing, disaster recovery rehearsal, accessibility audit.

## Prioritized backlog

### P0 — Must ship MVP

- Secure identity/session lifecycle.
- Career profile.
- Resume versions + PDF/DOCX.
- Reviewed job extraction.
- Deterministic score + evidence.
- Application tracker.
- Admin bootstrap/basic operations/audit.

### P1 — Next

- AI content suggestions and cover letters.
- Text interview practice.
- Calendar/table enhancements and reminders.
- Bangla interface.

### P2 — Later and only with validation

- Voice interviews.
- Browser extension.
- Job-site URL ingestion.
- Team/university tenant management.
- Recruiter workflow.
- Payments/subscriptions.

## Suggested team ownership

| Workstream | Primary ownership |
|---|---|
| Product and research | Product lead |
| Design system and candidate UX | Product designer + frontend |
| Next.js candidate/admin apps | Frontend engineer |
| Express modules, Prisma, auth | Backend engineer |
| Gemini/scoring/export workers | Backend/AI engineer |
| Security testing and CI | Shared; named security owner |
| E2E, accessibility, release QA | QA + feature owners |

## Definition of done for every story

- Acceptance criteria and failure states implemented.
- Authorization and ownership checks present.
- Input/output schemas and size limits defined.
- Unit/integration/E2E coverage appropriate to risk.
- Loading, empty, error, offline/retry states designed.
- Keyboard, responsive, reduced-motion, and contrast checks complete.
- Logs/metrics added without sensitive data.
- API/OpenAPI, migration notes, and operational runbook updated.
- Reviewed by at least one person other than the author.
