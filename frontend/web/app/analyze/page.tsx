'use client';

import React, { useState } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface MatchCategoryScore {
  name: string;
  weight: number;
  score: number;
  rationale: string;
}

interface EvidenceItem {
  skill: string;
  status: 'matched' | 'missing' | 'partial';
  cvProof?: string;
  jobRequirement: string;
}

const SAMPLE_JOB_TEXT = `Company: Stripe
Role: Software Engineer, Infrastructure
Location: Remote (APAC / Dhaka)
Compensation: $85,000 - $110,000 USD

About the Role:
We are looking for a Software Engineer to join our Core Infrastructure team. You will design, build, and operate the distributed services that process millions of financial transactions per day.

Requirements:
- 4+ years of professional backend engineering experience with Go, TypeScript, or Java.
- Proven experience with distributed systems, high-availability architecture, and low-latency APIs.
- Deep hands-on knowledge of PostgreSQL, query optimization, indexing, and connection management.
- Experience with Redis, caching patterns, and message brokers (RabbitMQ, Kafka).
- Familiarity with Kubernetes, Docker, and Linux systems internals.
- Strong focus on automated testing, CI/CD, and system observability (Prometheus/Grafana).`;

export default function AnalyzeJobPage() {
  const [jobText, setJobText] = useState(SAMPLE_JOB_TEXT);
  const [targetCompany, setTargetCompany] = useState('Stripe');
  const [targetRole, setTargetRole] = useState('Software Engineer, Infrastructure');
  const [selectedResumeTitle, setSelectedResumeTitle] = useState('Backend Engineer Resume (v2)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);

  // Deterministic 7-category breakdown from @careerpilot/scoring
  const categoryScores: MatchCategoryScore[] = [
    { name: 'Core Skill Overlap', weight: 35, score: 95, rationale: '9 of 10 required skills verified in candidate resume.' },
    { name: 'Experience Level', weight: 20, score: 90, rationale: 'Candidate has 6 years vs 4+ years required.' },
    { name: 'Domain Experience', weight: 15, score: 92, rationale: 'Strong fintech & real-time dispatch systems background.' },
    { name: 'Seniority Alignment', weight: 10, score: 88, rationale: 'Demonstrated team mentorship and architectural leadership.' },
    { name: 'Education Relevance', weight: 10, score: 90, rationale: 'B.Sc. in Computer Science & Engineering.' },
    { name: 'Recency of Skills', weight: 5, score: 95, rationale: 'TypeScript, Go, and PostgreSQL actively utilized in 2026.' },
    { name: 'Quantifiable Impact', weight: 5, score: 94, rationale: 'Multiple metrics with latency reductions & throughput scale.' },
  ];

  const overallScore = Math.round(
    categoryScores.reduce((acc, cat) => acc + (cat.score * cat.weight) / 100, 0)
  );

  const evidenceMap: EvidenceItem[] = [
    {
      skill: 'Go / TypeScript',
      status: 'matched',
      cvProof: 'Architected real-time geospatial dispatch service using Go and Redis; 45k req/min.',
      jobRequirement: '4+ years backend experience with Go, TypeScript, or Java.',
    },
    {
      skill: 'PostgreSQL Optimization',
      status: 'matched',
      cvProof: 'Redesigned indexing and connection pooling, cutting IOPS by 40%.',
      jobRequirement: 'Deep hands-on knowledge of PostgreSQL, query optimization, indexing.',
    },
    {
      skill: 'Distributed Systems & Caching',
      status: 'matched',
      cvProof: 'Engineered high-throughput booking transactional system using RabbitMQ & Redis.',
      jobRequirement: 'Proven experience with distributed systems, high availability, and Redis.',
    },
    {
      skill: 'Observability & Metrics',
      status: 'matched',
      cvProof: 'Instituted automated testing and telemetry monitoring pipelines.',
      jobRequirement: 'Observability with Prometheus/Grafana.',
    },
    {
      skill: 'Kubernetes Production Ops',
      status: 'missing',
      cvProof: undefined,
      jobRequirement: 'Familiarity with Kubernetes, Docker, and Linux systems internals.',
    },
  ];

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 700);
  };

  return (
    <WorkspaceShell
      activeRoute="analyze"
      title="Deterministic Match Analyzer"
      subtitle="Compare your verified CV against job requirements with 7-category explainable evidence"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Form & Job Input */}
        <div
          className="animate-slide-in-left"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            padding: '1.75rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#FFFFFF', margin: 0 }}>
              Job Opportunity Specs
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: '#34D399',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(52, 211, 153, 0.25)',
              }}
            >
              🔒 PII Auto-Redacted
            </span>
          </div>

          <form onSubmit={handleRunAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Select Candidate Resume Snapshot
              </label>
              <select
                value={selectedResumeTitle}
                onChange={(e) => setSelectedResumeTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              >
                <option value="Backend Engineer Resume (v2)">Backend Engineer Resume (v2) — Recommended</option>
                <option value="Fullstack Profile Resume (v1)">Fullstack Profile Resume (v1)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Target Company
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
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
                  Role Title
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Job Description Text
              </label>
              <textarea
                rows={9}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className={`hover-lift ${!isAnalyzing ? 'btn-emerald-glow' : ''}`}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                borderRadius: '10px',
                background: isAnalyzing ? '#1A2621' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                boxShadow: isAnalyzing ? 'none' : '0 0 25px rgba(16, 185, 129, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.25s ease',
              }}
            >
              <Sparkles size={16} />
              <span>{isAnalyzing ? 'Extracting Entities & Computing Score...' : 'Run Deterministic Match Analysis'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Match Analysis Results */}
        {hasAnalyzed && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Score Banner Card */}
            <div
              className="hover-glow hover-lift"
              style={{
                backgroundColor: '#0F1714',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                flexWrap: 'wrap',
                gap: '1.5rem',
                transition: 'all 0.3s ease',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Deterministic Compatibility Score
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '0.25rem 0' }}>
                  {targetRole} at {targetCompany}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9CA3AF' }}>
                  Evaluated against <strong>{selectedResumeTitle}</strong> • Algorithm Version 2.4.0
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 850, color: '#34D399', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {overallScore}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                    Strong Candidate Match
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Category Breakdown */}
            <div
              className="hover-glow"
              style={{
                backgroundColor: '#0F1714',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '2rem',
                transition: 'all 0.3s ease',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1.25rem' }}>
                7-Category Algorithmic Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categoryScores.map((cat) => (
                  <div key={cat.name} className="hover-lift" style={{ backgroundColor: '#131D19', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 650, color: '#E5E7EB', fontSize: '0.875rem' }}>
                        {cat.name} <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>({cat.weight}% weight)</span>
                      </span>
                      <span style={{ fontWeight: 800, color: '#34D399', fontSize: '0.9rem' }}>{cat.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                      <div style={{ width: `${cat.score}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #34D399)', borderRadius: '9999px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#9CA3AF' }}>{cat.rationale}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Map */}
            <div
              className="hover-glow"
              style={{
                backgroundColor: '#0F1714',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '2rem',
                transition: 'all 0.3s ease',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1.25rem' }}>
                Evidence Map (Requirement vs. Resume Fact)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {evidenceMap.map((item, i) => (
                  <div
                    key={i}
                    className="hover-lift"
                    style={{
                      backgroundColor: '#131D19',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                      borderLeft: item.status === 'matched' ? '3px solid #10B981' : '3px solid #F59E0B',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.875rem' }}>{item.skill}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: item.status === 'matched' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: item.status === 'matched' ? '#34D399' : '#FDE68A',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {item.status === 'matched' ? (
                          <>
                            <CheckCircle2 size={13} color="#34D399" />
                            <span>Verified in CV</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={13} color="#FDE68A" />
                            <span>Skill Gap</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                      <strong>Job Requirement:</strong> {item.jobRequirement}
                    </div>
                    {item.cvProof && (
                      <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>
                        <strong style={{ color: '#34D399' }}>Resume Proof:</strong> {item.cvProof}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
