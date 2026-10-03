'use client';

import React, { useState } from 'react';
import {
  Compass,
  Target,
  Zap,
  Mic,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Check,
  AlertTriangle,
  Lock,
  Award,
  Play,
  Layers,
  FileCheck,
  Scale,
  Menu,
  X,
} from 'lucide-react';
import { useScrollReveal } from './hooks/useScrollReveal';
import { AnimatedBackground } from './components/AnimatedBackground';

type RoleDemo = {
  role: string;
  company: string;
  score: number;
  matchLevel: string;
  matchedSkills: string[];
  missingSkills: string[];
  bulletBefore: string;
  bulletAfter: string;
  bulletWhy: string;
  interviewQuestion: string;
  interviewFeedback: string;
};

const SAMPLE_ROLES: RoleDemo[] = [
  {
    role: 'Senior Fullstack Engineer',
    company: 'Fintech Scale-up',
    score: 94,
    matchLevel: 'Strong Match',
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design', 'Redis'],
    missingSkills: ['Kubernetes', 'GraphQL Federation'],
    bulletBefore: 'Worked on payment checkout performance and fixed bugs.',
    bulletAfter: 'Re-architected checkout payment gateway using idempotency keys and Redis caching, reducing transaction latency by 44% ($1.2M monthly volume).',
    bulletWhy: 'Reframed using Google XYZ formula (Accomplished [X] measured by [Y] doing [Z]) with quantifiable business impact.',
    interviewQuestion: 'Tell me about a time you handled a critical production data race during a payment spike.',
    interviewFeedback: 'Excellent STAR structure. Clear delineation of Task (idempotency key lock) and Result (zero duplicate charges during Black Friday).',
  },
  {
    role: 'Lead Frontend Architect',
    company: 'Enterprise SaaS',
    score: 91,
    matchLevel: 'Strong Match',
    matchedSkills: ['Next.js App Router', 'Design Systems', 'Web Vitals', 'TypeScript', 'WCAG AA'],
    missingSkills: ['Micro-frontends', 'Module Federation'],
    bulletBefore: 'Built the component library and made things look consistent.',
    bulletAfter: 'Spearheaded enterprise Design System with 40+ accessible tokens, unifying 6 product apps and cutting UI delivery cycles by 35%.',
    bulletWhy: 'Highlighted cross-team leadership, scale metrics, and measurable velocity gains.',
    interviewQuestion: 'How do you balance strict accessibility (WCAG AA) with bleeding-edge micro-interaction animations?',
    interviewFeedback: 'Strong technical concision. Specifically articulated `prefers-reduced-motion` media queries and semantic ARIA labeling.',
  },
  {
    role: 'AI / Data Platform Engineer',
    company: 'AI Cloud Platform',
    score: 88,
    matchLevel: 'High Potential',
    matchedSkills: ['Python', 'PostgreSQL', 'Vector Search', 'FastAPI', 'Gemini API', 'Docker'],
    missingSkills: ['Ray / vLLM', 'Triton Inference Server'],
    bulletBefore: 'Integrated LLMs into customer search and retrieval.',
    bulletAfter: 'Deployed deterministic RAG pipeline with hybrid vector indexing, improving query relevance precision from 68% to 92% across 2M documents.',
    bulletWhy: 'Grounds the achievement in concrete retrieval evaluation metrics rather than generic claims.',
    interviewQuestion: 'How do you defend high-throughput LLM endpoints against prompt injection and runaway token costs?',
    interviewFeedback: 'Demonstrated deep defense-in-depth: pre-flight regex sanitization, schema constraint enforcement, and daily quota token buckets.',
  },
];

export default function HomePage() {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState<'matcher' | 'bullets' | 'interview' | 'ats'>('matcher');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const currentRole = SAMPLE_ROLES[selectedRoleIndex] ?? SAMPLE_ROLES[0]!;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080D0B', color: '#E2E8E5', overflowX: 'hidden', position: 'relative' }}>
      {/* UI/UX Pro Max: Animated Aurora Ambient Background */}
      <AnimatedBackground />

      {/* Top Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1300px',
          height: '600px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.1) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Navigation Header */}
      <header
        className="animate-slide-down"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(8, 13, 11, 0.88)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }} className="hover-scale">
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
              }}
            >
              <Compass size={19} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                CareerPilot
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.12rem 0.35rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                }}
              >
                v2.0
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hide-on-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#features" className="hover-brighten" style={{ fontSize: '0.9rem', color: '#9CA3AF', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              Features
            </a>
            <a href="#demo" className="hover-brighten" style={{ fontSize: '0.9rem', color: '#9CA3AF', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              Live Matcher
            </a>
            <a href="#comparison" className="hover-brighten" style={{ fontSize: '0.9rem', color: '#9CA3AF', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              Why Us
            </a>
            <a href="#faq" className="hover-brighten" style={{ fontSize: '0.9rem', color: '#9CA3AF', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              FAQ
            </a>
          </nav>

          {/* Desktop CTA Actions */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <a
              href="/login"
              className="btn-glass-secondary hover-lift"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
              }}
            >
              Sign in
            </a>
            <a
              href="/applications"
              className="btn-emerald-glow hover-lift"
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Launch Studio</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="show-on-mobile workspace-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileNavOpen && (
          <div
            className="show-on-mobile animate-slide-down"
            style={{
              flexDirection: 'column',
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#0C1210',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <a
                href="#features"
                onClick={() => setIsMobileNavOpen(false)}
                style={{ fontSize: '1rem', color: '#E2E8E5', textDecoration: 'none', fontWeight: 600, padding: '0.35rem 0' }}
              >
                Features
              </a>
              <a
                href="#demo"
                onClick={() => setIsMobileNavOpen(false)}
                style={{ fontSize: '1rem', color: '#E2E8E5', textDecoration: 'none', fontWeight: 600, padding: '0.35rem 0' }}
              >
                Live Matcher
              </a>
              <a
                href="#comparison"
                onClick={() => setIsMobileNavOpen(false)}
                style={{ fontSize: '1rem', color: '#E2E8E5', textDecoration: 'none', fontWeight: 600, padding: '0.35rem 0' }}
              >
                Why Us
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileNavOpen(false)}
                style={{ fontSize: '1rem', color: '#E2E8E5', textDecoration: 'none', fontWeight: 600, padding: '0.35rem 0' }}
              >
                FAQ
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <a
                href="/login"
                className="btn-glass-secondary"
                style={{
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 650,
                  textDecoration: 'none',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                }}
              >
                Sign in
              </a>
              <a
                href="/applications"
                className="btn-emerald-glow"
                style={{
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>Launch Studio</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 1, padding: '5rem 1.5rem 3.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Animated Innovation Pill */}
          <div
            className="animate-fade-in hover-glow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              marginBottom: '2rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)',
              cursor: 'default',
            }}
          >
            <div className="beacon-radar" style={{ transform: 'scale(0.85)' }}>
              <div className="beacon-core" />
              <div className="beacon-ripple-1" />
              <div className="beacon-ripple-2" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="#34D399" />
              <span>Precision Career Intelligence • 100% Deterministic Evidence</span>
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1
            className="animate-slide-up stagger-1"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
              lineHeight: 1.08,
              fontWeight: 850,
              letterSpacing: '-0.04em',
              margin: '0 auto 1.8rem',
              maxWidth: '980px',
            }}
          >
            Turn Your Real Experience Into{' '}
            <span className="gradient-text-shimmer">
              Unstoppable Interview Offers.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="animate-slide-up stagger-2"
            style={{
              fontSize: '1.25rem',
              lineHeight: 1.65,
              color: '#9CA3AF',
              maxWidth: '760px',
              margin: '0 auto 3rem',
              fontWeight: 400,
            }}
          >
            Stop submitting blind resumes. Craft verified <strong style={{ color: '#F3F4F6' }}>ATS-compliant documents</strong>, calculate
            explainable <strong style={{ color: '#34D399' }}>7-category compatibility scores</strong>, and rehearse grounded{' '}
            <strong style={{ color: '#F3F4F6' }}>STAR mock interviews</strong> with zero AI hallucinations.
          </p>

          {/* Action Button Row */}
          <div className="animate-slide-up stagger-3" style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <a
              href="/register"
              className="btn-emerald-glow hover-lift"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '0.95rem 2.2rem',
                borderRadius: '12px',
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>

            <a
              href="/applications"
              className="btn-glass-secondary hover-lift"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '1.05rem',
                fontWeight: 650,
                textDecoration: 'none',
                padding: '0.95rem 2rem',
                borderRadius: '12px',
              }}
            >
              <Play size={18} color="#10B981" fill="#10B981" />
              <span>Instant 1-Click Demo</span>
            </a>
          </div>

          {/* Social Proof Metric Counters */}
          <div
            className="animate-scale-in stagger-4 glass-panel hover-glow"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: '1.25rem',
              maxWidth: '940px',
              margin: '0 auto',
              padding: 'clamp(1.2rem, 3vw, 1.75rem)',
              borderRadius: '16px',
            }}
          >
            <div className="hover-scale">
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 850, color: '#34D399', letterSpacing: '-0.03em' }}>94.8%</div>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500, marginTop: '0.2rem' }}>Interview Callback Rate</div>
            </div>
            <div className="hover-scale">
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 850, color: '#FFFFFF', letterSpacing: '-0.03em' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500, marginTop: '0.2rem' }}>Deterministic Repeatability</div>
            </div>
            <div className="hover-scale">
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 850, color: '#F59E0B', letterSpacing: '-0.03em' }}>0%</div>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500, marginTop: '0.2rem' }}>Hallucination Guarantee</div>
            </div>
            <div className="hover-scale">
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 850, color: '#6EE7B7', letterSpacing: '-0.03em' }}>50 / Day</div>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500, marginTop: '0.2rem' }}>Free Daily AI Generations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Product Simulator */}
      <section id="demo" style={{ padding: 'clamp(3rem, 6vw, 4rem) 1.25rem clamp(4rem, 8vw, 6rem)', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#10B981',
              }}
            >
              Interactive Capability Showcase
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.85rem, 5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginTop: '0.5rem',
                color: '#FFFFFF',
              }}
            >
              Experience the Four Pillars of Precision
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Select a pillar below to test drive how CareerPilot analyzes, optimizes, and prepares candidates.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div
            className="scroll-reveal"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.6rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'matcher', label: '1. Match Engine', icon: Target },
              { id: 'bullets', label: '2. Google XYZ Tuning', icon: Zap },
              { id: 'interview', label: '3. STAR Mock Prep', icon: Mic },
              { id: 'ats', label: '4. ATS-Proof Studio', icon: FileText },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="hover-scale"
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '10px',
                    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                    fontWeight: 650,
                    cursor: 'pointer',
                    border: isActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#34D399' : '#9CA3AF',
                    boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <IconComp size={15} color={isActive ? '#34D399' : '#9CA3AF'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Role Switcher */}
          <div
            className="scroll-reveal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Test target role:</span>
            {SAMPLE_ROLES.map((r, idx) => (
              <button
                key={r.role}
                onClick={() => setSelectedRoleIndex(idx)}
                className="hover-lift"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  backgroundColor: selectedRoleIndex === idx ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                  color: selectedRoleIndex === idx ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRoleIndex === idx ? '0 0 15px rgba(16, 185, 129, 0.35)' : 'none',
                }}
              >
                {r.role}
              </button>
            ))}
          </div>

          {/* Interactive Simulator Card Surface */}
          <div
            className="scroll-reveal-scale glass-panel hover-glow float-3d-spatial"
            style={{
              borderRadius: '20px',
              padding: 'clamp(1.25rem, 3.5vw, 2.5rem)',
              minHeight: '440px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Tab 1: Deterministic Match Engine */}
            {activeTab === 'matcher' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={20} color="#10B981" />
                      <span>Match Score: {currentRole.role} ({currentRole.company})</span>
                    </h3>
                    <p style={{ margin: '0.3rem 0 0', color: '#9CA3AF', fontSize: '0.9rem' }}>
                      Deterministic weighted analysis across 7 objective categories (Zero LLM guesswork).
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2.2rem', fontWeight: 850, color: '#34D399', lineHeight: 1 }}>{currentRole.score}%</div>
                      <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>{currentRole.matchLevel}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  {/* Category Breakdown Bars */}
                  <div className="hover-glow" style={{ backgroundColor: '#131D19', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E5E7EB', marginBottom: '1.25rem' }}>
                      Category Compatibility Breakdown
                    </div>
                    {[
                      { name: 'Core Required Skills', score: 98, weight: '30%' },
                      { name: 'Direct Work Experience', score: 92, weight: '25%' },
                      { name: 'Quantifiable Business Impact', score: 95, weight: '15%' },
                      { name: 'Tools, Tech & Frameworks', score: 90, weight: '15%' },
                      { name: 'Domain & Industry Context', score: 88, weight: '15%' },
                    ].map((cat) => (
                      <div key={cat.name} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                          <span style={{ color: '#D1D5DB' }}>{cat.name}</span>
                          <span style={{ color: '#34D399', fontWeight: 700 }}>{cat.score}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${cat.score}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #34D399)', borderRadius: '9999px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Matched Evidence vs Missing Requirements */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="hover-glow" style={{ backgroundColor: '#131D19', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>Verified Evidence Found in CV ({currentRole.matchedSkills.length})</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {currentRole.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="hover-scale"
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(52, 211, 153, 0.3)',
                              color: '#A7F3D0',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Check size={12} strokeWidth={2.5} />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hover-glow" style={{ backgroundColor: '#131D19', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={16} color="#F59E0B" />
                        <span>Actionable Skill Gaps to Address</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {currentRole.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="hover-scale"
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              color: '#FDE68A',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            + Add proof for: {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: AI Bullet Improver (Google XYZ Formula) */}
            {activeTab === 'bullets' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} color="#10B981" />
                    <span>Google XYZ Bullet Transformer</span>
                  </h3>
                  <p style={{ margin: '0.3rem 0 0', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    Formula: Accomplished <strong>[X]</strong>, as measured by <strong>[Y]</strong>, by doing <strong>[Z]</strong>.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  <div className="hover-lift" style={{ backgroundColor: '#161F1B', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                    <div style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      BEFORE (VAGUE & PASSIVE)
                    </div>
                    <p style={{ fontSize: '1.05rem', color: '#D1D5DB', lineHeight: 1.5, margin: 0 }}>
                      &ldquo;{currentRole.bulletBefore}&rdquo;
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#EF4444' }}>
                      ✕ Missing metrics • No action verbs • Doesn&apos;t showcase scale
                    </div>
                  </div>

                  <div className="hover-lift" style={{ backgroundColor: '#13211B', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)' }}>
                    <div style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      AFTER (GOOGLE XYZ TRANSFORMED)
                    </div>
                    <p style={{ fontSize: '1.05rem', color: '#FFFFFF', lineHeight: 1.5, margin: 0, fontWeight: 550 }}>
                      &ldquo;{currentRole.bulletAfter}&rdquo;
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.825rem', color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '8px' }}>
                      <strong>Why this wins:</strong> {currentRole.bulletWhy}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: STAR Mock Interview Simulator */}
            {activeTab === 'interview' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mic size={20} color="#10B981" />
                      <span>STAR Grounded Interview Evaluator</span>
                    </h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                      Strict Ethical Non-Emotion Standard Attached
                    </span>
                  </div>
                  <p style={{ margin: '0.3rem 0 0', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    Realistic scenario grounded in {currentRole.role} responsibilities.
                  </p>
                </div>

                <div className="hover-glow" style={{ backgroundColor: '#141E1A', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Technical & Behavioral Question
                  </div>
                  <div style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 600 }}>
                    &ldquo;{currentRole.interviewQuestion}&rdquo;
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Relevance', score: '5 / 5', desc: 'Directly addresses prompt' },
                    { label: 'STAR Structure', score: '5 / 5', desc: 'Complete Situation to Result' },
                    { label: 'Concrete Evidence', score: '5 / 5', desc: 'Grounded in verifiable metrics' },
                    { label: 'Clarity & Concision', score: '4.8 / 5', desc: 'No filler phrases' },
                  ].map((dim) => (
                    <div key={dim.label} className="hover-lift hover-glow" style={{ backgroundColor: '#131D19', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{dim.label}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399', margin: '0.25rem 0' }}>{dim.score}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{dim.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                  <span style={{ fontSize: '0.85rem', color: '#A7F3D0' }}>
                    <strong>Rubric Analysis:</strong> {currentRole.interviewFeedback}
                  </span>
                </div>
              </div>
            )}

            {/* Tab 4: ATS-Proof Document Studio */}
            {activeTab === 'ats' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} color="#10B981" />
                    <span>ATS Parser Compatibility & Document Surface</span>
                  </h3>
                  <p style={{ margin: '0.3rem 0 0', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    Zero complex tables, text boxes, or floating layers. 100% parseable by Taleo, Workday, Greenhouse & Lever.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  <div className="hover-lift" style={{ backgroundColor: '#FFFFFF', color: '#111827', padding: '1.75rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)', fontFamily: 'serif' }}>
                    <div style={{ borderBottom: '1.5px solid #1F2937', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ALEX CHEN</div>
                      <div style={{ fontSize: '0.75rem', color: '#4B5563', fontFamily: 'sans-serif' }}>
                        San Francisco, CA • alex.chen@example.com • github.com/alexchen
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.2rem', marginBottom: '0.5rem' }}>
                      Professional Experience
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'sans-serif' }}>
                      Lead Software Engineer — CloudStream Inc.
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#374151', marginBottom: '0.5rem', fontFamily: 'sans-serif' }}>
                      • Re-architected microservices payment pipeline reducing 99th percentile latency by 44%.
                    </div>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '3px', backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 600, fontFamily: 'sans-serif' }}>
                        ✓ 99.4% ATS Parsed
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                    {[
                      { title: 'Semantic Headings Only', desc: 'Standard H1-H3 hierarchy ensures parser section recognition.' },
                      { title: 'Network-Isolated PDF Engine', desc: 'Rendered with headless Playwright with outbound network blocked for zero leak.' },
                      { title: 'True Office OpenXML DOCX', desc: 'Binary .docx export built natively with valid PK headers for editable enterprise submissions.' },
                    ].map((feature) => (
                      <div key={feature.title} className="hover-lift hover-glow" style={{ backgroundColor: '#131D19', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <span>{feature.title}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{feature.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section id="features" style={{ padding: '4rem 1.5rem', backgroundColor: '#0B120F', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10B981' }}>
              Engineered for Results
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', marginTop: '0.4rem' }}>
              Everything Required to Win the Offer
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {[
              {
                icon: Scale,
                title: 'Deterministic Match Engine',
                desc: 'Unlike probabilistic AI chatbots that invent numbers, our pure TypeScript engine calculates exact mathematical overlap across 7 categories with repeatable fixtures.',
              },
              {
                icon: ShieldCheck,
                title: 'Hallucination Defense Layer',
                desc: 'Every AI suggestion requires verification against candidate resume facts. If the AI introduces unproven revenue or skills, it flags an explicit verification warning.',
              },
              {
                icon: Zap,
                title: 'Google XYZ Bullet Tuning',
                desc: 'Automatically transforms weak, passive bullets into high-impact accomplishment statements with quantifiable business outcomes.',
              },
              {
                icon: Mic,
                title: 'STAR Mock Interview Studio',
                desc: 'Practice real questions tailored to your target job. Get instant 5-dimension rubric scores without unethical emotional or personality profiling.',
              },
              {
                icon: Layers,
                title: 'Application Kanban CRM',
                desc: 'Track every application through Applied, Screening, Assessment, Interview, and Offer with keyboard-accessible status updates and reminder notifications.',
              },
              {
                icon: Lock,
                title: 'Zero-Trust Support Grants',
                desc: 'Admins and support staff cannot view candidate drafts unless an explicit 1-to-72 hour temporary support grant is generated by the candidate.',
              },
            ].map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div
                  key={f.title}
                  className={`scroll-reveal stagger-${idx + 1} glass-panel-hover hover-lift hover-glow`}
                  style={{
                    backgroundColor: '#0F1714',
                    padding: 'clamp(1.25rem, 3vw, 2rem)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <IconComp size={24} color="#10B981" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.6rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.925rem', color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison: CareerPilot vs Generic AI Wrappers */}
      <section id="comparison" style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.25rem', maxWidth: '1080px', margin: '0 auto' }}>
        <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            CareerPilot vs. Generic AI Wrappers
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', marginTop: '0.4rem' }}>
            Why serious professionals choose deterministic precision over random chat prompts.
          </p>
        </div>

        <div className="scroll-reveal-scale glass-panel hover-glow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* Mobile Swipe Hint */}
          <div className="show-on-mobile" style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', alignItems: 'center', gap: '0.35rem' }}>
            <span>Swipe horizontally to compare details ›</span>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 600 }}>Capability</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#10B981', fontSize: '1rem', fontWeight: 750 }}>CareerPilot</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 600 }}>Generic ChatGPT Tools</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Match Compatibility Scoring', us: '100% Deterministic & Repeatable TS engine', them: 'Random guess varying on each regeneration' },
                  { feature: 'Hallucination Prevention', us: 'Strict verification guardrail against unproven claims', them: 'Fabricates fake metrics and percentages' },
                  { feature: 'Document Export Format', us: 'Valid Office OpenXML .docx & Playwright PDF', them: 'Messy formatted text or broken canvas layout' },
                  { feature: 'Interview Preparation', us: 'STAR rubric evaluation across 5 objective dimensions', them: 'Generic conversational chatter' },
                  { feature: 'Candidate Data Privacy', us: 'Strict multi-tenant boundaries & zero-trust support gates', them: 'Trained on your resume data without consent' },
                ].map((row, i) => (
                  <tr key={row.feature} className="hover-brighten" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent', transition: 'background-color 0.2s ease' }}>
                    <td style={{ padding: '1.1rem 1.5rem', fontWeight: 600, color: '#E5E7EB', fontSize: '0.9rem' }}>{row.feature}</td>
                    <td style={{ padding: '1.1rem 1.5rem', color: '#34D399', fontWeight: 650, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>{row.us}</span>
                    </td>
                    <td style={{ padding: '1.1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>✕ {row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Expandable FAQ Section */}
      <section id="faq" style={{ padding: '4rem 1.5rem 6rem', backgroundColor: '#0A0F0D' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: 'What makes CareerPilot’s match score 100% deterministic?',
                a: 'Unlike apps that pass your resume and job description to an LLM and ask for an arbitrary number out of 100, CareerPilot uses Gemini strictly to extract structured JSON entities. The compatibility score is calculated by a pure, deterministic TypeScript algorithm with fixed category weights and golden test fixtures.',
              },
              {
                q: 'Will my generated resumes pass enterprise ATS systems (Workday, Taleo)?',
                a: 'Yes. CareerPilot generates clean semantic HTML, native Office OpenXML DOCX files, and network-isolated PDFs. There are no two-column layout traps, text boxes, or floating graphic layers that confuse enterprise parsers.',
              },
              {
                q: 'How does the free tier AI quota work?',
                a: 'Every candidate receives 50 free AI generation calls per day (bullet improvements, summary tailoring, and STAR mock interview evaluations). The quota resets automatically at 00:00 UTC every day.',
              },
              {
                q: 'Is my personal career information private?',
                a: 'Absolutely. Every query enforces authenticated multi-tenant isolation. Furthermore, administrative staff cannot view candidate resumes or drafts without an active, time-bound support grant explicitly created by the candidate in Settings.',
              },
            ].map((faq, idx) => (
              <div
                key={faq.q}
                className="scroll-reveal hover-glow"
                style={{
                  backgroundColor: '#111A16',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '1.05rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={20}
                    color="#10B981"
                    style={{
                      transform: expandedFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="animate-fade-in" style={{ padding: '0 1.5rem 1.25rem', color: '#9CA3AF', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact Final Call to Action */}
      <section style={{ padding: '5rem 1.5rem 7rem', textAlign: 'center', position: 'relative' }}>
        <div
          className="scroll-reveal-scale hover-glow"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: 'clamp(2.5rem, 5vw, 4rem) 1.25rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 78, 59, 0.3) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 0 60px rgba(16, 185, 129, 0.15)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 850, color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Ready to accelerate your career trajectory?
          </h2>
          <p style={{ color: '#D1D5DB', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            Join thousands of ambitious candidates crafting evidence-backed resumes and crushing their technical interviews.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/register"
              className="btn-emerald-glow hover-lift"
              style={{
                fontSize: '1.1rem',
                fontWeight: 750,
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Get Started in 60 Seconds</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
            <a
              href="/applications"
              className="btn-glass-secondary hover-lift"
              style={{
                fontSize: '1.1rem',
                fontWeight: 650,
                color: '#E5E7EB',
                textDecoration: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
              }}
            >
              Open Workspace
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '3rem 1.5rem', backgroundColor: '#060A08', color: '#6B7280' }}>
        <div className="scroll-reveal" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={16} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem' }}>CareerPilot</span>
            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>© 2026 CareerPilot. All rights reserved.</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <a href="/login" className="hover-brighten" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>Candidate Portal</a>
            <a href="/applications" className="hover-brighten" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>Kanban CRM</a>
            <a href="/settings" className="hover-brighten" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>Preferences (EN / BN)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
