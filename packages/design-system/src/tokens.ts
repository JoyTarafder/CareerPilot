/**
 * CareerPilot Design Tokens
 * Grounded in DESIGN.md: "Precision with momentum"
 */

export const colors = {
  light: {
    ink: {
      950: '#171A19', // Primary text
      700: '#454B48', // Secondary text
    },
    canvas: '#FCFCF9', // Main background
    paper: '#FFFFFF',  // CV preview & raised surfaces
    mist: '#F3F5F1',   // Subtle regions
    border: '#DDE2DC', // Dividers and controls
    pine: {
      700: '#175C4C', // Primary actions
      500: '#2F806C', // Interactive accent
    },
    mint: {
      100: '#DFF2EA', // Positive soft state
    },
    amber: {
      600: '#B66A19', // Attention
    },
    red: {
      600: '#B93B42', // Error/destructive
    },
    blue: {
      600: '#3867C8', // Informational state
    },
  },
  dark: {
    canvas: '#121513',
    surface: '#191D1B',
    raised: '#222825',
    text: {
      primary: '#F4F6F3',
      secondary: '#ABB4AF',
    },
    border: '#343C38',
    pine: {
      accent: '#68B9A1',
    },
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    serif: 'var(--font-source-serif, "Source Serif 4", Georgia, serif)',
    mono: 'var(--font-geist-mono, "Geist Mono", monospace)',
  },
  scale: {
    display: { size: '3.5rem', lineHeight: '3.75rem', letterSpacing: '-0.035em', weight: 650 },
    h1: { size: '2.5rem', lineHeight: '2.875rem', letterSpacing: '-0.025em', weight: 650 },
    h2: { size: '1.875rem', lineHeight: '2.25rem', letterSpacing: '-0.018em', weight: 620 },
    h3: { size: '1.375rem', lineHeight: '1.75rem', letterSpacing: '-0.010em', weight: 620 },
    bodyL: { size: '1.125rem', lineHeight: '1.8125rem', weight: 400 },
    body: { size: '1rem', lineHeight: '1.5625rem', weight: 400 },
    label: { size: '0.875rem', lineHeight: '1.25rem', weight: 560 },
    caption: { size: '0.75rem', lineHeight: '1.125rem', weight: 500 },
  },
} as const;

export const radii = {
  control: '8px',
  panel: '12px',
  previewSurface: '16px',
  pill: '9999px',
} as const;

export const shadows = {
  elevation: '0 1px 2px rgba(18,24,20,.06), 0 12px 30px rgba(18,24,20,.06)',
} as const;

export const spacing = {
  base: 8,
  micro: 4,
} as const;
