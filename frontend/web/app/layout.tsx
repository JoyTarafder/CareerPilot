import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerPilot — AI-Assisted Precision Career & Interview Platform',
  description: 'ATS-Safe Resume Builder, 100% Deterministic Job-Match Scoring, STAR Mock Interview Simulator, and AI Writing Studio for Ambitious Professionals.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
