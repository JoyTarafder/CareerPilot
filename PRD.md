# CareerPilot — Product Requirements Document

**Status:** MVP definition  
**Audience:** Product, design, frontend, backend, QA, security  
**Product type:** Responsive web SaaS  
**Primary users:** Students, fresh graduates, internship seekers, and early-career professionals

## 1. Product vision

CareerPilot helps a candidate move from “I found a role” to “I submitted a credible application and prepared for the interview” in one trustworthy workspace. The product does not promise employment or claim to reproduce a company's private ATS. It provides an explainable **estimated CV–job compatibility score**.

## 2. Problem

Candidates struggle to create machine-readable CVs, tailor evidence to a job, understand missing requirements, prepare targeted interview answers, and remember follow-ups. Existing tools often provide unexplained scores, produce generic text, or invent achievements.

## 3. Goals

1. Generate clean, ATS-safe CVs from structured information.
2. Compare a selected CV snapshot with a job description using a repeatable scoring algorithm.
3. Explain strengths, gaps, and honest improvements without fabricating experience.
4. Generate editable application content with explicit user approval.
5. Track application progress and interview preparation.
6. Protect high-sensitivity candidate data by default.

## 4. Non-goals for MVP

- Claiming an official ATS score or probability of being hired.
- Scraping job sites or auto-applying to jobs.
- Real-time voice interview analysis.
- Recruiter marketplace, social feed, or messaging.
- Vector database, microservices, Kubernetes, event streaming, or Redis unless measured load requires them.
- Storing card data or operating payments directly.

## 5. Personas

### Candidate — Nabila, fresh graduate
Needs an attractive but ATS-safe CV, role-specific wording, and guidance about missing evidence.

### Candidate — Arif, early-career engineer
Keeps several CV versions, evaluates roles quickly, tracks applications, and practices technical interviews.

### Administrator — Operations owner
Manages users, templates, skill aliases, AI usage, feature flags, and security events without reading private CV content by default.

## 6. Primary user journey

1. Register and verify email.
2. Complete career profile.
3. Build a CV from sections and select an ATS-safe template.
4. Preview and export PDF/DOCX.
5. Paste a job description and choose a saved CV version.
6. Review estimated match, evidence, missing requirements, and suggestions.
7. Approve selected tailoring suggestions and save a new CV version.
8. Generate/edit a cover letter.
9. Add the role to the application tracker.
10. Run a role-specific text mock interview and review feedback.

## 7. Functional requirements

### 7.1 Account and identity — P0

- Email/password registration, verification, login, logout, refresh, forgot/reset password.
- Candidate password policy: 12–30 Unicode characters for the requested MVP policy; count characters, enforce a byte ceiling before hashing, allow paste/password managers, and check common/compromised passwords where feasible.
- Active session list and revoke-all-sessions action.
- Account export and deletion.
- Role-based authorization: `CANDIDATE`, `ADMIN`, optional `SUPER_ADMIN`.

### 7.2 Career profile — P0

- Personal/contact details, professional summary, target roles.
- Education, experience, projects, skills, certifications, languages, achievements, links.
- Autosave with visible state: Saving, Saved, Failed.
- Reordering and optional section visibility.
- Completeness indicator must explain missing fields; it must not pressure users to add irrelevant data.

### 7.3 Resume builder — P0

- Create, rename, duplicate, archive, restore, and version resumes.
- Start from career profile or a blank structure.
- Live desktop/document preview; mobile uses editor/preview tabs.
- At least three templates: Foundation, Editorial, Technical.
- ATS-safe output: selectable text, familiar headings, logical reading order, no information conveyed only through icons or skill bars.
- Export PDF with Playwright/Puppeteer and DOCX with `docx`.
- Immutable `contentSnapshot` per exported/application-linked version.

### 7.4 Job description — P0

- Paste plain text; optional `.pdf`/`.docx` upload after safe extraction.
- Extract title, company (when present), required/preferred skills, experience, education, responsibilities, certifications, and keywords.
- Show extracted requirements for correction before analysis.
- Never treat job-description text as trusted instructions to the AI or server.

### 7.5 Match analysis — P0

- Analyze one CV snapshot against one reviewed job description.
- Return overall score, category scores, matched evidence, missing requirements, ambiguous items, and recommended actions.
- Version every scoring rule set (`scoringVersion`).
- Suggested initial weights:
  - Required skills 30%
  - Preferred skills 10%
  - Experience relevance 20%
  - Role alignment 10%
  - Education/certification 10%
  - Keyword coverage 10%
  - ATS readability 10%
- AI extracts and explains; only the deterministic TypeScript engine computes the percentage.
- Display: “Estimated compatibility, not an employer ATS result or hiring probability.”

### 7.6 AI writing assistant — P1

- Improve summary and bullets, generate cover letters, create interview questions, and critique answers.
- Structured JSON responses validated by Zod.
- Every suggestion shows source evidence and requires user approval.
- Never invent employer names, dates, degrees, certifications, tools, metrics, or outcomes.
- Mask direct identifiers before free-tier API calls.

### 7.7 Application tracker — P0

- Fields: company, role, URL, status, dates, location/work mode, salary note, linked CV/analysis/cover letter, follow-up, interview, notes.
- Statuses: Saved, Applied, Screening, Assessment, Interview, Offer, Rejected, Withdrawn.
- Board, table, and calendar-oriented list; MVP may ship board + table first.
- Analytics: totals, status distribution, response rate, interview conversion, average compatibility. Clearly define each formula.

### 7.8 Interview preparation — P1

- HR, behavioral, technical, CV-based, or mixed text session.
- Questions grounded in reviewed job requirements and CV evidence.
- STAR guidance for behavioral answers.
- Feedback on relevance, clarity, structure, evidence, and concision.
- Do not present subjective confidence or personality inference as fact.

### 7.9 Admin panel — P0 operational subset

- Separate `/admin` application/deployment and login surface.
- Dashboard: active users, analyses, export jobs, AI failures, security alerts, and rate-limit events.
- User search, suspend/reactivate, revoke sessions; destructive actions require confirmation and audit reason.
- Manage CV templates, skill aliases, scoring versions, feature flags, and model configuration allowlist.
- View metadata by default. Private resume/job content requires explicit support-access workflow, reason, audit entry, and time-limited authorization.
- No impersonation in MVP.

## 8. Admin bootstrap requirement

The requested admin email/password are supplied through server environment variables:

```env
ADMIN_BOOTSTRAP_EMAIL="admin@example.com"
ADMIN_BOOTSTRAP_PASSWORD="replace-with-a-unique-secret"
PASSWORD_PEPPER="managed-secret"
```

Professional implementation: these values are consumed only by a one-time idempotent bootstrap command that creates the first admin with an Argon2id hash, unique salt, and pepper. Runtime login authenticates against the database—not direct plaintext environment comparison. Force password change and MFA enrollment on first production login. Never expose these values to Next.js or use a `NEXT_PUBLIC_` prefix.

## 9. UX requirements

- Responsive from 390 px to large desktop.
- WCAG 2.2 AA target, keyboard complete, visible focus, semantic labels, 44×44 px touch targets.
- Light/dark themes; no essential distinction by color alone.
- Reduced-motion mode and no motion-dependent actions.
- Actionable empty, loading, success, and error states.
- Bangla-ready layouts, but MVP product language may begin in English; architecture must support i18n.

## 10. Non-functional requirements

- API p95 target under 400 ms for ordinary CRUD excluding external AI/export jobs.
- Long AI/export operations handled as asynchronous jobs with progress and idempotency.
- Server-side pagination for lists; no unbounded queries.
- Daily encrypted backups and tested restoration procedure before production launch.
- Central structured logs with request IDs and redaction.
- Availability target for MVP: 99.5% monthly excluding planned maintenance.

## 11. Product metrics

- Profile-to-first-CV completion rate.
- Time to first successful export.
- Job analysis completion and suggestion acceptance rates.
- Application tracker weekly active usage.
- Interview session completion.
- AI invalid-output/failure rate and cost per completed workflow.
- Security: account takeover reports, blocked abuse, unresolved high-severity findings.

## 12. MVP acceptance criteria

- A verified candidate can create a profile, produce a readable CV, and export both formats.
- The same CV snapshot and job description produce the same numeric score under the same scoring version.
- Each score category links to matched or missing evidence.
- AI failure never deletes user content or blocks manual editing.
- Candidate cannot access another candidate's records by changing an ID.
- Admin can manage operations but cannot casually browse private content.
- Security test suite covers authentication, authorization, validation, rate limiting, file upload, and token rotation.
