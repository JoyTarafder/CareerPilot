# CareerPilot Documentation

CareerPilot is an AI-assisted career platform for creating ATS-safe resumes, comparing a resume with a job description, preparing for interviews, and tracking applications.

## Documents

1. [Product Requirements](./PRD.md)
2. [System Architecture](./ARCHITECTURE.md)
3. [Product & UI/UX Design](./DESIGN.md)
4. [Security Specification](./SECURITY.md)
5. [Delivery Phases](./PHASES.md)

## Agreed technology baseline

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| AI | Gemini Developer API free tier for MVP |
| Match score | Deterministic TypeScript scoring engine |
| PDF | Playwright/Puppeteer |
| DOCX | `docx` npm package |
| Authentication | Short-lived JWT access token + rotated refresh session |
| Admin | Separate admin portal and role; environment bootstrap credentials |

## Repository strategy

Use a monorepo for shared types and consistent tooling while keeping frontend and backend as separately deployed applications.

```text
careerpilot/
├── frontend/
│   ├── web/           # Next.js user-facing candidate app
│   └── admin/         # Next.js admin portal (separate build/deployment)
├── backend/
│   ├── api/           # Express REST API & Prisma data layer
│   └── worker/        # Dedicated background queue worker process
├── packages/
│   ├── contracts/     # API DTOs, Zod schemas, generated types
│   ├── design-system/ # Tokens and reusable UI components
│   ├── config/        # Shared lint/TypeScript configuration
│   └── scoring/       # Pure deterministic match engine
├── docs/
├── infra/
└── package.json
```

Frontend and backend do not share runtime code or secrets. Only versioned contracts, UI primitives, and pure scoring types are shared packages.
