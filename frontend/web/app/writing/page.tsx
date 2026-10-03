'use client';

import React, { useState } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  PenTool,
  Sparkles,
  FileText,
  Check,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function AIWritingPage() {
  const [activeTab, setActiveTab] = useState<'bullet' | 'summary' | 'coverLetter'>('bullet');

  // Quota state
  const [quotaRemaining, setQuotaRemaining] = useState(47);
  const quotaLimit = 50;

  // Bullet Improver State
  const [bulletDraft, setBulletDraft] = useState('worked on database queries to make page loading faster');
  const [contextRole, setContextRole] = useState('Backend Engineer');
  const [bulletSuggestion, setBulletSuggestion] = useState<{
    original: string;
    suggested: string;
    why: string;
    warning: string | null;
  } | null>({
    original: 'worked on database queries to make page loading faster',
    suggested:
      'Refactored legacy PostgreSQL database queries and optimized composite indices, reducing API response latency by 35%.',
    why: 'Replaced passive verb "worked" with precise engineering action "Refactored" and structured with outcome impact.',
    warning:
      'Suggestion incorporates quantifiable claims (35% reduction) not evidenced in your draft. Ensure you verify this metric.',
  });
  const [bulletAcceptedStatus, setBulletAcceptedStatus] = useState<string | null>(null);

  // Summary State
  const [summaryDraft, setSummaryDraft] = useState(
    'I am a software developer with experience in Node.js and TypeScript building web applications.'
  );
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [summarySuggestion, setSummarySuggestion] = useState<{
    suggested: string;
    why: string;
  } | null>({
    suggested:
      'Results-driven Senior Backend Engineer with proven expertise in TypeScript, Node.js, and distributed microservices. Dedicated to architecting reliable cloud APIs, optimizing PostgreSQL query performance, and leading high-velocity engineering delivery.',
    why: 'Elevated tone to Senior level, clearly mapped primary tech competencies, and emphasized technical leadership.',
  });

  // Cover Letter State
  const [selectedResume] = useState('Backend Engineer Resume (v2)');
  const [targetJob, setTargetJob] = useState('Senior Backend Engineer at Datadog');
  const [coverLetterTone, setCoverLetterTone] = useState<'professional' | 'concise' | 'enthusiastic'>('professional');
  const [coverLetterResult] = useState<{
    recipient: string;
    salutation: string;
    opening: string;
    bodyParagraphs: string[];
    closing: string;
    groundedClaims: string[];
  }>({
    recipient: 'Datadog Hiring Team',
    salutation: 'Dear Datadog Hiring Team,',
    opening:
      'I am writing to express my strong enthusiasm for the Senior Backend Engineer position at Datadog. With 6+ years specializing in distributed systems, real-time message architectures, and low-latency API infrastructure, I am confident in my ability to contribute meaningfully to Datadog telemetry and observability pipelines.',
    bodyParagraphs: [
      'In my current role at Pathao Technologies, I led the core platform architecture of a geospatial dispatch service processing 45,000 requests per minute with p99 latency under 28ms using Go and Redis. This experience required rigorous concurrency tuning and real-time observability—principles directly aligned with Datadog high-scale agent infrastructure.',
      'Additionally, I redesigned PostgreSQL indexing and connection topologies, eliminating query timeouts and cutting IOPS by 40%. I pride myself on engineering deterministic, measurable solutions and establishing disciplined testing standards across teams.',
    ],
    closing:
      'Thank you for your time and consideration. I welcome the opportunity to discuss how my distributed systems background can support Datadog continued growth.',
    groundedClaims: [
      '6+ years distributed systems & microservices experience',
      'Geospatial dispatch service handling 45,000 requests/minute',
      'Reduced p99 latency to < 28ms with Go & Redis',
      'PostgreSQL query & IOPS reduction by 40%',
    ],
  });

  const handleImproveBullet = (e: React.FormEvent) => {
    e.preventDefault();
    if (quotaRemaining <= 0) return;
    setQuotaRemaining((prev) => prev - 1);
    setBulletAcceptedStatus(null);
    setBulletSuggestion({
      original: bulletDraft,
      suggested: `Architected and optimized high-frequency queries in PostgreSQL, eliminating execution bottlenecks and slashing response latency by 32%.`,
      why: 'Applied Google XYZ formula with active leadership verbs and explicit latency outcome.',
      warning: 'Please verify the 32% metric before including in your final resume.',
    });
  };

  return (
    <WorkspaceShell
      activeRoute="writing"
      title="AI Writing Studio"
      subtitle="Craft evidence-bound cover letters, Google XYZ bullet points, and role-aligned summaries"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34D399',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Zap size={13} /> {quotaRemaining} / {quotaLimit} Credits Remaining
          </span>
        </div>
      }
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { id: 'bullet', label: '1. Bullet Improver (Google XYZ)', icon: Sparkles },
            { id: 'summary', label: '2. Executive Summary Tailor', icon: PenTool },
            { id: 'coverLetter', label: '3. Grounded Cover Letter', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="press-effect hover-lift"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#34D399' : '#9CA3AF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.25)' : 'none',
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Bullet Improver */}
        {activeTab === 'bullet' && (
          <div key="bullet" className="animate-expand-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '2rem', alignItems: 'start' }}>
            <div
              className="hover-glow"
              style={{
                backgroundColor: '#0F1714',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '1.75rem',
                transition: 'all 0.3s ease',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1rem' }}>
                Draft Bullet Point
              </h3>

              <form onSubmit={handleImproveBullet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Target Role Context
                  </label>
                  <input
                    type="text"
                    value={contextRole}
                    onChange={(e) => setContextRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#141E1A',
                      color: '#FFFFFF',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Original Raw Bullet
                  </label>
                  <textarea
                    rows={4}
                    value={bulletDraft}
                    onChange={(e) => setBulletDraft(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#141E1A',
                      color: '#FFFFFF',
                      outline: 'none',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  ⚡ Optimize with Google XYZ
                </button>
              </form>
            </div>

            {bulletSuggestion && (
              <div
                style={{
                  backgroundColor: '#0F1714',
                  borderRadius: '16px',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Original Draft
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                    &ldquo;{bulletSuggestion.original}&rdquo;
                  </div>
                </div>

                <div style={{ backgroundColor: '#131F1A', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Google XYZ Optimized
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 600, lineHeight: 1.5 }}>
                    &ldquo;{bulletSuggestion.suggested}&rdquo;
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.825rem', color: '#D1D5DB' }}>
                  <strong style={{ color: '#34D399' }}>Why this works:</strong> {bulletSuggestion.why}
                </div>

                {bulletSuggestion.warning && (
                  <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#FDE68A' }}>
                    <strong>⚠️ Hallucination Defense Notice:</strong> {bulletSuggestion.warning}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setBulletAcceptedStatus('✓ Bullet accepted and copied to clipboard!')}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Accept Suggestion
                  </button>
                  {bulletAcceptedStatus && (
                    <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>
                      {bulletAcceptedStatus}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Executive Summary */}
        {activeTab === 'summary' && (
          <div key="summary" className="animate-expand-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '2rem', alignItems: 'start' }}>
            <div
              style={{
                backgroundColor: '#0F1714',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1rem' }}>
                Tune Summary to Role
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#141E1A',
                      color: '#FFFFFF',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Current Summary Draft
                  </label>
                  <textarea
                    rows={5}
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#141E1A',
                      color: '#FFFFFF',
                      outline: 'none',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>

            {summarySuggestion && (
              <div
                style={{
                  backgroundColor: '#0F1714',
                  borderRadius: '16px',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase' }}>
                  Tailored Executive Summary
                </div>
                <p style={{ fontSize: '1rem', color: '#FFFFFF', lineHeight: 1.6, margin: 0 }}>
                  {summarySuggestion.suggested}
                </p>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.825rem', color: '#D1D5DB' }}>
                  <strong style={{ color: '#34D399' }}>Rationale:</strong> {summarySuggestion.why}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Grounded Cover Letter */}
        {activeTab === 'coverLetter' && (
          <div key="coverLetter" className="animate-expand-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '2rem', alignItems: 'start' }}>
            <div
              style={{
                backgroundColor: '#0F1714',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1rem' }}>
                Cover Letter Settings
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Grounded Resume
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedResume}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      color: '#9CA3AF',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Target Job & Company
                  </label>
                  <input
                    type="text"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#141E1A',
                      color: '#FFFFFF',
                      outline: 'none',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Tone & Voice
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['professional', 'concise', 'enthusiastic'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCoverLetterTone(t)}
                        style={{
                          flex: 1,
                          padding: '0.45rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          backgroundColor: coverLetterTone === t ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                          color: coverLetterTone === t ? '#FFFFFF' : '#9CA3AF',
                          border: 'none',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Letter Preview & Claims Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  backgroundColor: '#0F1714',
                  borderRadius: '16px',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  padding: '2.5rem',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Evidence-Bound Cover Letter
                </div>

                <div style={{ fontSize: '0.95rem', color: '#E5E7EB', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>{coverLetterResult.salutation}</div>
                  <div>{coverLetterResult.opening}</div>
                  {coverLetterResult.bodyParagraphs.map((p, i) => (
                    <div key={i}>{p}</div>
                  ))}
                  <div>{coverLetterResult.closing}</div>
                  <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Sincerely,<br />Sarah Jenkins</div>
                </div>
              </div>

              {/* Verified Claims Ledger */}
              <div
                style={{
                  backgroundColor: '#0F1714',
                  borderRadius: '14px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399', marginBottom: '0.75rem' }}>
                  ✓ Grounded Resume Claims Ledger (Zero Hallucination)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {coverLetterResult.groundedClaims.map((claim, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>
                      • {claim}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
