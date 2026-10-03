'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Globe,
} from 'lucide-react';

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  bulletPoints: string[];
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export default function ProfilePage() {
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [headline, setHeadline] = useState('Senior Distributed Systems & Backend Engineer');
  const [summary, setSummary] = useState(
    'Backend Engineer with 6+ years designing event-driven distributed microservices, low-latency APIs, and scalable PostgreSQL/Redis data pipelines across fintech and cloud systems.'
  );
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [location, setLocation] = useState('Dhaka / Remote');
  const [website, setWebsite] = useState('https://github.com/candidate-demo');
  const [skills, setSkills] = useState<string[]>([
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'Redis',
    'Distributed Systems',
    'Docker',
    'Kubernetes',
    'GraphQL',
    'Prisma',
    'AWS',
  ]);
  const [newSkill, setNewSkill] = useState('');

  const [educations] = useState<EducationItem[]>([
    {
      id: 'edu-1',
      institution: 'University of Engineering and Technology',
      degree: 'B.Sc. in Computer Science & Engineering',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-06',
    },
  ]);

  const [experiences] = useState<ExperienceItem[]>([
    {
      id: 'exp-1',
      company: 'Pathao Technologies',
      title: 'Senior Software Engineer (Core Platform)',
      location: 'Dhaka, Bangladesh',
      startDate: '2022-03',
      isCurrent: true,
      bulletPoints: [
        'Architected real-time geospatial dispatch service handling 45,000 requests/minute with p99 latency < 28ms using Go and Redis.',
        'Redesigned PostgreSQL indexing strategy and connection pooling, reducing database IOPS by 40% and eliminating query timeouts.',
        'Mentored 5 junior engineers and instituted deterministic automated testing pipelines across microservices.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Shohoz Cloud',
      title: 'Software Engineer',
      location: 'Dhaka, Bangladesh',
      startDate: '2020-07',
      endDate: '2022-02',
      isCurrent: false,
      bulletPoints: [
        'Engineered high-throughput booking transactional system using Node.js, TypeScript, and RabbitMQ.',
        'Integrated automated idempotency locks preventing double-charging across payment gateways.',
      ],
    },
  ]);

  const [projects] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      name: 'EventFlow MQ',
      description: 'Hermetic distributed message broker implementation with raft consensus and persistent WAL.',
      technologies: ['TypeScript', 'Node.js', 'Redis', 'Docker'],
      link: 'https://github.com/example/eventflow-mq',
    },
  ]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  // Load user name from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careerpilot_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.fullName) setFullName(u.fullName);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const triggerAutosave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      triggerAutosave();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    triggerAutosave();
  };

  return (
    <WorkspaceShell
      activeRoute="profile"
      title="Candidate Career Profile"
      subtitle="Canonical professional profile, verified skills, and background facts"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: saveStatus === 'saved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: saveStatus === 'saved' ? '#34D399' : '#FDE68A',
              border: saveStatus === 'saved' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle2 size={13} color="#34D399" />
                <span>Autosaved to database</span>
              </>
            ) : (
              <>
                <Clock size={13} color="#FDE68A" />
                <span>Saving changes...</span>
              </>
            )}
          </span>
        </div>
      }
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Contact & Headline Card */}
        <div
          className="animate-slide-up stagger-1"
          style={{
            backgroundColor: '#0F1714',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1.25rem' }}>
            Primary Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  triggerAutosave();
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Headline / Title
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  triggerAutosave();
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
              Professional Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                triggerAutosave();
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#141E1A',
                color: '#FFFFFF',
                outline: 'none',
                fontSize: '0.9rem',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  triggerAutosave();
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  triggerAutosave();
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                Portfolio / GitHub
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  triggerAutosave();
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#141E1A',
                  color: '#FFFFFF',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Verified Skills Ledger */}
        <div
          className="animate-slide-up stagger-2"
          style={{
            backgroundColor: '#0F1714',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={20} color="#10B981" /> Verified Skill Ledger
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#9CA3AF' }}>
                Skills backed by real experience bullet points and projects
              </p>
            </div>
          </div>

          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              placeholder="Add skill (e.g. Next.js, System Design, GraphQL)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#141E1A',
                color: '#FFFFFF',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
            <button
              type="submit"
              className="press-effect"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <Plus size={15} strokeWidth={2.5} /> Add
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.map((skill) => (
              <span
                key={skill}
                className="hover-scale"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  color: '#A7F3D0',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                }}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6EE7B7',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div
          className="animate-slide-up stagger-3"
          style={{
            backgroundColor: '#0F1714',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} color="#10B981" /> Work Experience
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="hover-glow"
                style={{
                  backgroundColor: '#131D19',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 750, color: '#FFFFFF' }}>{exp.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                    {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 650, margin: '0.25rem 0 0.75rem' }}>
                  {exp.company} • {exp.location}
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#D1D5DB', lineHeight: 1.6 }}>
                  {exp.bulletPoints.map((b, i) => (
                    <li key={i} style={{ marginBottom: '0.35rem' }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Education */}
          <div
            style={{
              backgroundColor: '#0F1714',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1rem' }}>
              Education & Degrees
            </h2>
            {educations.map((edu) => (
              <div key={edu.id} style={{ backgroundColor: '#131D19', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{edu.degree}</div>
                <div style={{ fontSize: '0.825rem', color: '#9CA3AF', margin: '0.2rem 0' }}>{edu.institution}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {edu.startDate} — {edu.endDate}
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div
            style={{
              backgroundColor: '#0F1714',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', margin: '0 0 1rem' }}>
              Verified Projects
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} style={{ backgroundColor: '#131D19', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{proj.name}</div>
                <div style={{ fontSize: '0.825rem', color: '#D1D5DB', margin: '0.35rem 0' }}>{proj.description}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {proj.technologies.map((t) => (
                    <span key={t} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: '#9CA3AF' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
