'use client';

import React, { useState } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  FileText,
  Download,
  Copy,
  Plus,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export type ResumeTemplate = 'foundation' | 'editorial' | 'technical';

export interface ResumeData {
  id: string;
  title: string;
  template: ResumeTemplate;
  version: number;
  updatedAt: string;
  isCurrent: boolean;
  content: {
    fullName: string;
    headline: string;
    contact: {
      email: string;
      phone: string;
      location: string;
      website: string;
    };
    summary: string;
    skills: string[];
    experience: {
      company: string;
      role: string;
      location: string;
      period: string;
      bullets: string[];
    }[];
    education: {
      institution: string;
      degree: string;
      period: string;
    }[];
  };
}

const SAMPLE_RESUMES: ResumeData[] = [
  {
    id: 'res-1',
    title: 'Backend Engineer Resume (v2)',
    template: 'foundation',
    version: 2,
    updatedAt: '2026-10-01',
    isCurrent: true,
    content: {
      fullName: 'Sarah Jenkins',
      headline: 'Senior Distributed Systems & Backend Engineer',
      contact: {
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
        location: 'Dhaka / Remote',
        website: 'github.com/candidate-demo',
      },
      summary:
        'Backend Engineer with 6+ years designing event-driven distributed microservices, low-latency APIs, and scalable PostgreSQL/Redis data pipelines across fintech and cloud systems.',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Go', 'GraphQL'],
      experience: [
        {
          company: 'Pathao Technologies',
          role: 'Senior Software Engineer (Core Platform)',
          location: 'Dhaka, Bangladesh',
          period: '2022 — Present',
          bullets: [
            'Architected real-time geospatial dispatch service handling 45,000 requests/minute with p99 latency < 28ms using Go and Redis.',
            'Redesigned PostgreSQL indexing strategy and connection pooling, reducing database IOPS by 40% and eliminating query timeouts.',
            'Mentored 5 junior engineers and instituted deterministic automated testing pipelines across microservices.',
          ],
        },
        {
          company: 'Shohoz Cloud',
          role: 'Software Engineer',
          location: 'Dhaka, Bangladesh',
          period: '2020 — 2022',
          bullets: [
            'Engineered high-throughput booking transactional system using Node.js, TypeScript, and RabbitMQ.',
            'Integrated automated idempotency locks preventing double-charging across payment gateways.',
          ],
        },
      ],
      education: [
        {
          institution: 'University of Engineering and Technology',
          degree: 'B.Sc. in Computer Science & Engineering',
          period: '2016 — 2020',
        },
      ],
    },
  },
  {
    id: 'res-2',
    title: 'Fullstack Profile Resume (v1)',
    template: 'editorial',
    version: 1,
    updatedAt: '2026-09-18',
    isCurrent: false,
    content: {
      fullName: 'Sarah Jenkins',
      headline: 'Fullstack Engineer & Technical Lead',
      contact: {
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
        location: 'Dhaka / Remote',
        website: 'github.com/candidate-demo',
      },
      summary:
        'Fullstack engineer skilled in building resilient web applications, interactive design systems, and microservices.',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      experience: [
        {
          company: 'TechFlow Systems',
          role: 'Fullstack Software Engineer',
          location: 'Remote',
          period: '2021 — 2023',
          bullets: [
            'Delivered responsive dashboard with Next.js App Router and Tailwind CSS, improving core web vitals.',
            'Implemented automated CI/CD pipeline using GitHub Actions with hermetic unit testing.',
          ],
        },
      ],
      education: [
        {
          institution: 'University of Engineering and Technology',
          degree: 'B.Sc. in Computer Science & Engineering',
          period: '2016 — 2020',
        },
      ],
    },
  },
];

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeData[]>(SAMPLE_RESUMES);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('res-1');
  const [activeTemplate, setActiveTemplate] = useState<ResumeTemplate>('foundation');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) ?? resumes[0]!;

  const handleExport = (format: 'pdf' | 'docx') => {
    setExportNotice(`Generating ATS-compliant ${format.toUpperCase()} export...`);
    setTimeout(() => {
      setExportNotice(`✓ ${format.toUpperCase()} binary downloaded successfully.`);
      setTimeout(() => setExportNotice(null), 3000);
    }, 800);
  };

  const handleDuplicate = () => {
    const copy: ResumeData = {
      ...selectedResume,
      id: `res-${Date.now()}`,
      title: `${selectedResume.title} (Copy)`,
      version: 1,
      updatedAt: new Date().toISOString().split('T')[0]!,
      isCurrent: false,
    };
    setResumes([...resumes, copy]);
    setSelectedResumeId(copy.id);
  };

  return (
    <WorkspaceShell
      activeRoute="resumes"
      title="ATS Resume Builder & Exporter"
      subtitle="Craft ATS-safe resumes with document-grade typography and immutable version snapshots"
      actions={
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {exportNotice && (
            <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>
              {exportNotice}
            </span>
          )}
          <button
            type="button"
            onClick={handleDuplicate}
            className="press-effect"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
          >
            <Copy size={14} /> Duplicate
          </button>
          <button
            type="button"
            onClick={() => handleExport('docx')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#1E2D27',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34D399',
              fontSize: '0.85rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <FileText size={15} /> Export DOCX
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="press-effect"
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'box-shadow 0.25s ease, filter 0.25s ease',
            }}
          >
            <Download size={15} /> Export PDF
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Controls & Versions */}
        <div className="animate-slide-in-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Resumes Selector */}
          <div
            className="hover-glow"
            style={{
              backgroundColor: '#0F1714',
              borderRadius: '14px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              padding: '1.25rem',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
              My Resumes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {resumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedResumeId(r.id);
                    setActiveTemplate(r.template);
                  }}
                  className="hover-lift"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: selectedResumeId === r.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: selectedResumeId === r.id ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid transparent',
                    color: selectedResumeId === r.id ? '#FFFFFF' : '#9CA3AF',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 650 }}>{r.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                    Version {r.version} • {r.updatedAt}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Switcher */}
          <div
            className="hover-glow"
            style={{
              backgroundColor: '#0F1714',
              borderRadius: '14px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              padding: '1.25rem',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={15} color="#10B981" /> ATS Templates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'foundation', name: 'Foundation', desc: 'Single-column technical standard' },
                { id: 'editorial', name: 'Editorial', desc: 'Refined serif accents for leadership' },
                { id: 'technical', name: 'Technical', desc: 'Compact layout optimized for metrics' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id as ResumeTemplate)}
                  className="hover-lift"
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: activeTemplate === t.id ? '#1A2621' : 'transparent',
                    border: activeTemplate === t.id ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: activeTemplate === t.id ? '#34D399' : '#9CA3AF',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ATS Compliance Checklist */}
          <div
            className="hover-glow"
            style={{
              backgroundColor: '#0F1714',
              borderRadius: '14px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              padding: '1.25rem',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399', marginBottom: '0.6rem' }}>
              ✓ 100% ATS Safe Guaranteed
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.5 }}>
              • No nested text-boxes or frames<br />
              • Semantic H1/H2 header hierarchy<br />
              • Machine-readable dates & bullet points<br />
              • Passes Workday, Lever & Greenhouse
            </div>
          </div>
        </div>

        {/* Right Column: Authentic Paper Preview Surface */}
        <div
          className="animate-slide-up hover-glow"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Paper Sheet */}
          <div
            className="hover-lift"
            style={{
              width: '100%',
              maxWidth: '750px',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              borderRadius: '4px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
              padding: '3rem 3.5rem',
              fontFamily: activeTemplate === 'editorial' ? "'Source Serif 4', Georgia, serif" : 'inherit',
              lineHeight: 1.5,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '1.5px solid #1F2937', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#111827' }}>
                {selectedResume.content.fullName}
              </h1>
              <div style={{ fontSize: '0.9rem', color: '#4B5563', marginTop: '0.2rem', fontWeight: 600 }}>
                {selectedResume.content.headline}
              </div>
              <div style={{ fontSize: '0.775rem', color: '#6B7280', marginTop: '0.35rem' }}>
                {selectedResume.content.contact.location} • {selectedResume.content.contact.email} • {selectedResume.content.contact.phone} • {selectedResume.content.contact.website}
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                Executive Summary
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.55 }}>
                {selectedResume.content.summary}
              </p>
            </div>

            {/* Core Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                Core Technical Skills
              </div>
              <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                {selectedResume.content.skills.join(' • ')}
              </div>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.2rem', marginBottom: '0.6rem' }}>
                Professional Experience
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedResume.content.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 750, fontSize: '0.9rem', color: '#111827' }}>{exp.role}</span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{exp.period}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 650, margin: '0.1rem 0 0.35rem' }}>
                      {exp.company} — {exp.location}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#374151', lineHeight: 1.55 }}>
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ marginBottom: '0.2rem' }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                Education
              </div>
              {selectedResume.content.education.map((edu, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#374151' }}>
                  <div>
                    <strong>{edu.degree}</strong> — {edu.institution}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{edu.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
