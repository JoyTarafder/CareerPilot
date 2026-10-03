# CareerPilot — Senior Product & UI/UX Design Specification

## 1. Design direction: “Precision with momentum”

CareerPilot should feel like a calm, credible professional coach—not a neon AI dashboard. The visual identity combines editorial restraint, document craftsmanship, and subtle motion that suggests progress.

**Avoid:** generic purple gradients, glassmorphism everywhere, oversized rounded cards, random blobs, excessive icons, fake 3D illustrations, gamified pressure, and animation for decoration.

**Signature ideas**

- A thin **Career Thread** line moves through onboarding, analysis, application, and interview milestones.
- Resume preview uses a tactile paper surface, precise typographic rhythm, and real document proportions.
- Match results unfold as an **Evidence Map**, linking each score to CV proof and job requirements.
- The application board uses restrained depth and contextual color, not rainbow columns.

## 2. Brand characteristics

- Trustworthy, candid, precise, ambitious, calm.
- Human language: “Here is the evidence” instead of “Our AI guarantees success.”
- AI is an assistant, not the visual hero.

## 3. Color system

### Light theme

| Token | Value | Usage |
|---|---:|---|
| Ink 950 | `#171A19` | Primary text |
| Ink 700 | `#454B48` | Secondary text |
| Canvas | `#FCFCF9` | Main background |
| Paper | `#FFFFFF` | CV preview and raised surfaces |
| Mist | `#F3F5F1` | Subtle regions |
| Border | `#DDE2DC` | Dividers and controls |
| Pine 700 | `#175C4C` | Primary actions |
| Pine 500 | `#2F806C` | Interactive accent |
| Mint 100 | `#DFF2EA` | Positive soft state |
| Amber 600 | `#B66A19` | Attention |
| Red 600 | `#B93B42` | Error/destructive |
| Blue 600 | `#3867C8` | Informational state |

### Dark theme

- Canvas `#121513`, surface `#191D1B`, raised `#222825`.
- Primary text `#F4F6F3`, secondary `#ABB4AF`, border `#343C38`.
- Primary accent `#68B9A1`; semantic colors retain meaning and pass contrast.

Use Pine for brand actions. Green does not automatically mean “high match”; pair every state with labels and evidence. Validate WCAG AA contrast in both themes.

## 4. Typography

- UI: **Geist Sans** or **Inter** with system fallback.
- Resume/editorial accents: **Source Serif 4** only where a template intentionally uses serif.
- Code/IDs: **Geist Mono**.

```text
Display: 56/60, -0.035em, 650
H1:      40/46, -0.025em, 650
H2:      30/36, -0.018em, 620
H3:      22/28, -0.010em, 620
Body L:  18/29, 400
Body:    16/25, 400
Label:   14/20, 560
Caption: 12/18, 500 (metadata only)
```

Long reading widths stay between 640–760 px. Interface text never drops below 14 px; document preview may scale visually but the source remains accessible through zoom/full preview.

## 5. Layout and geometry

- 8 px spatial system with 4 px micro-adjustments.
- Desktop workspace max width: 1440 px; content areas usually 1120–1280 px.
- Marketing content max width: 1200 px; long text 720 px.
- Border radius: 8 px controls, 12 px panels, 16 px major preview surfaces. Pills only for status/tag semantics.
- Borders before shadows. Standard elevation: `0 1px 2px rgba(18,24,20,.06), 0 12px 30px rgba(18,24,20,.06)`.
- Left workspace rail 248 px; editor + preview split defaults to 44/56 and is resizable.

## 6. Navigation

### Candidate desktop

Persistent rail:

- Overview
- Profile
- Resumes
- Analyze job
- Applications
- Interviews
- Settings

Top utility area contains global search/command menu, notifications, help, and profile. Use Cmd/Ctrl+K for navigation and commands, not as a decorative search field.

### Candidate mobile

Bottom navigation contains Overview, Resumes, Analyze, Applications, and More. Resume editor uses explicit `Edit | Preview` tabs; never squeeze the desktop split screen.

### Admin

Use a denser but readable console with clear environment indicator, scoped navigation, audit context, and a persistent warning when viewing sensitive support data.

## 7. Key screen specifications

### Landing page

- Hero: sharp value statement, single primary CTA, animated but reduced-motion-safe CV-to-evidence transition.
- Product proof: one real-looking analysis interface, not floating generic cards.
- Workflow narrative: Build → Match → Prepare → Track.
- Trust section explains estimated scoring and privacy honestly.
- Final CTA with no dark patterns.

### Onboarding

- Four purposeful steps: Goal, Basics, Experience/Education, Skills/Projects.
- Save progress continuously.
- Show why each field helps; optional stays optional.
- Completion is a thin Career Thread, not a stressful percentage circle.

### Resume builder

- Left: section navigator and form.
- Center/right: A4/Letter preview with zoom and page-break guides.
- Context rail: writing suggestions tied to selected content.
- Toolbar: template, typography, reorder, version, export.
- AI suggestion presents Original / Suggested / Why, with Accept, Edit, Dismiss.

### Match analysis

Top summary contains:

- Estimated compatibility score with explicit label.
- Confidence/data-quality note—not false statistical certainty.
- Three next best actions.

Below, the Evidence Map uses rows:

```text
Requirement | Status | CV evidence | Recommended action
```

Category scores use labeled bars and numbers; no ambiguous gauges. Missing requirements are separated into “Not evidenced” and “Not applicable/optional.”

### Application tracker

- Board cards show company, role, next action, age, and interview/follow-up date.
- Dragging is optional; every move is keyboard-accessible and available from a menu.
- Table view is the power-user default for bulk filtering.
- Empty state invites adding a real opportunity, not demo clutter.

### Interview room

- Quiet reading width; one question at a time.
- Job evidence and STAR guide open in a side sheet.
- Timer is optional and not anxiety-inducing.
- Feedback separates facts, communication structure, and suggested practice.

### Admin console

- Login has no marketing navigation; supports MFA and recovery.
- Operational dashboard prioritizes failures, queue age, security alerts, and usage anomalies over vanity metrics.
- Destructive actions show affected subject, consequence, required reason, and confirmation.

## 8. Motion language

Use Framer Motion selectively:

- Page transition: opacity 0→1 and y 6→0, 180–240 ms.
- Drawer/modal: 220–280 ms with restrained spring; no bounce.
- List insertion: layout animation, 180 ms.
- Career Thread: path reveal only on first meaningful progression.
- Score reveal: 400–600 ms after evidence loads, never a slot-machine count.
- Hover: 120–160 ms; transforms no more than 2 px.

Rules:

- Animate opacity/transform; avoid layout-heavy width/height animation.
- Respect `prefers-reduced-motion`; use instant state changes or short fades.
- Never delay task completion for animation.
- Smooth scrolling only for intentional in-page navigation; disable under reduced motion. Do not globally hijack native scrolling.

## 9. Components and states

Minimum design-system inventory:

- Button, icon button, link, input, textarea, select/combobox, checkbox, radio, date input.
- Form field with hint/error/success.
- Dialog, drawer, popover, tooltip, command menu.
- Tabs, segmented control, breadcrumb, pagination.
- Toast for transient status; inline alert for actionable failure.
- Data table, board card, timeline, status badge.
- Evidence row, score bar, suggestion diff, resume paper, job progress indicator.
- Skeletons matching final layout; empty and permission-denied states.

Every component includes default, hover, focus-visible, active, disabled, loading, error, and high-contrast states.

## 10. Content design

- “Estimated match” rather than “ATS pass probability.”
- “Not found in this CV” rather than “You do not have this skill.”
- “Add evidence only if accurate” beside suggestions.
- Errors identify what happened, what is preserved, and the next action.
- Destructive labels are explicit: “Delete CV permanently,” not “Continue.”

## 11. Accessibility and responsive QA

- WCAG 2.2 AA target; semantic headings and landmarks.
- Visible focus ring (`2px` plus offset), logical focus order, focus trapped/restored in dialogs.
- All icon-only controls have accessible names.
- Charts/scores include textual equivalents.
- Reordering works by keyboard; drag is never the sole mechanism.
- Test at 390, 768, 1024, 1440 px; 200% zoom; keyboard-only; reduced motion; light/dark themes.
- No overlap, clipping, horizontal page scroll, or content hidden beneath sticky navigation.

## 12. Design validation process

1. Map critical journeys and failure states before high-fidelity UI.
2. Produce token-based Figma components aligned to coded components.
3. Prototype resume editing, evidence review, and application status movement.
4. Run five-user usability sessions with fresh graduates.
5. Validate contrast, focus, screen-reader labels, mobile layout, and reduced motion.
6. Review all shipped screens against the non-generic signature ideas and remove decorative noise.
