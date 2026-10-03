'use client';

import React, { useState, useMemo } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  Plus,
  Kanban as KanbanIcon,
  Table as TableIcon,
  Search,
  Briefcase,
  Activity,
  TrendingUp,
  Video,
  Award,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  salaryNote?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  interviewDate?: string;
  followUpDate?: string;
  matchScore?: number;
  resumeTitle?: string;
  notes?: string;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    company: 'Stripe',
    role: 'Software Engineer, Infrastructure',
    location: 'Remote (APAC / Dhaka)',
    salaryNote: '$85,000 - $110,000 USD',
    status: 'INTERVIEW',
    appliedDate: '2026-09-20',
    interviewDate: '2026-10-15T15:30:00+06:00',
    matchScore: 92,
    resumeTitle: 'Backend Engineer Resume (v2)',
    notes: 'Technical screen completed. System design interview scheduled for Oct 15.',
  },
  {
    id: 'app-2',
    company: 'Wise',
    role: 'Senior Backend Engineer',
    location: 'Singapore / Hybrid',
    salaryNote: '$120,000 SGD',
    status: 'SCREENING',
    appliedDate: '2026-09-28',
    followUpDate: '2026-10-08',
    matchScore: 85,
    resumeTitle: 'Backend Engineer Resume (v2)',
  },
  {
    id: 'app-3',
    company: 'Vercel',
    role: 'Frontend Infrastructure Engineer',
    location: 'Remote',
    salaryNote: '$95,000 USD',
    status: 'APPLIED',
    appliedDate: '2026-10-01',
    matchScore: 88,
    resumeTitle: 'Fullstack Profile Resume (v1)',
  },
  {
    id: 'app-4',
    company: 'GitHub',
    role: 'Developer Relations Specialist',
    location: 'Remote',
    status: 'OFFER',
    appliedDate: '2026-08-15',
    interviewDate: '2026-09-10',
    matchScore: 94,
    notes: 'Offer package received. Reviewing benefits and compensation terms.',
  },
  {
    id: 'app-5',
    company: 'Cloudflare',
    role: 'Edge Systems Engineer',
    location: 'Remote',
    status: 'SAVED',
    matchScore: 78,
    resumeTitle: 'Systems Resume (v1)',
  },
];

const COLUMNS: { status: ApplicationStatus; label: string; description: string }[] = [
  { status: 'SAVED', label: 'Saved', description: 'Opportunities under review' },
  { status: 'APPLIED', label: 'Applied', description: 'Application submitted' },
  { status: 'SCREENING', label: 'Screening', description: 'Recruiter review & chat' },
  { status: 'ASSESSMENT', label: 'Assessment', description: 'Take-home & coding' },
  { status: 'INTERVIEW', label: 'Interview', description: 'Live rounds in progress' },
  { status: 'OFFER', label: 'Offer', description: 'Offer received' },
  { status: 'REJECTED', label: 'Archived', description: 'Rejected or withdrawn' },
];

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New form fields
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SAVED');
  const [newNotes, setNewNotes] = useState('');

  // Handle keyboard-accessible status change
  const handleStatusChange = (appId: string, nextStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const nowStr = new Date().toISOString().split('T')[0];
        return {
          ...app,
          status: nextStatus,
          appliedDate:
            nextStatus !== 'SAVED' && !app.appliedDate ? nowStr : app.appliedDate,
        };
      })
    );
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      company: newCompany.trim(),
      role: newRole.trim(),
      location: newLocation.trim() || undefined,
      salaryNote: newSalary.trim() || undefined,
      status: newStatus,
      appliedDate: newStatus !== 'SAVED' ? new Date().toISOString().split('T')[0] : undefined,
      notes: newNotes.trim() || undefined,
    };

    setApplications([newApp, ...applications]);
    setNewCompany('');
    setNewRole('');
    setNewLocation('');
    setNewSalary('');
    setNewStatus('SAVED');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        (app.location && app.location.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((a) =>
      ['SAVED', 'APPLIED', 'SCREENING', 'ASSESSMENT', 'INTERVIEW'].includes(a.status)
    ).length;

    const enteredPipeline = applications.filter((a) => a.status !== 'SAVED');
    const responses = applications.filter((a) =>
      ['SCREENING', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status)
    );
    const interviews = applications.filter((a) => ['INTERVIEW', 'OFFER'].includes(a.status));
    const offers = applications.filter((a) => a.status === 'OFFER');

    const responseRate = enteredPipeline.length > 0 ? Math.round((responses.length / enteredPipeline.length) * 100) : 0;
    const interviewRate = enteredPipeline.length > 0 ? Math.round((interviews.length / enteredPipeline.length) * 100) : 0;
    const offerRate = enteredPipeline.length > 0 ? Math.round((offers.length / enteredPipeline.length) * 100) : 0;

    return { total, active, responseRate, interviewRate, offerRate };
  }, [applications]);

  return (
    <WorkspaceShell
      activeRoute="applications"
      title="Application Tracker & Kanban CRM"
      subtitle="Track active opportunities, pipeline velocity, and interview dates in real-time"
      actions={
        <>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('board')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 650,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'board' ? '#10B981' : 'transparent',
                color: viewMode === 'board' ? '#FFFFFF' : '#9CA3AF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <KanbanIcon size={14} /> Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 650,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#10B981' : 'transparent',
                color: viewMode === 'table' ? '#FFFFFF' : '#9CA3AF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <TableIcon size={14} /> Table
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="press-effect"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
              transition: 'box-shadow 0.25s ease, filter 0.25s ease',
            }}
          >
            <Plus size={16} strokeWidth={2.5} /> Add Opportunity
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Analytics KPI Ribbon */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { label: 'Total Tracked', value: metrics.total, sub: 'All opportunities', color: '#FFFFFF', icon: Briefcase },
            { label: 'Active Pipeline', value: metrics.active, sub: 'Under consideration', color: '#34D399', icon: Activity },
            { label: 'Response Rate', value: `${metrics.responseRate}%`, sub: 'Moved past applied', color: '#6EE7B7', icon: TrendingUp },
            { label: 'Interview Rate', value: `${metrics.interviewRate}%`, sub: 'Reached interviews', color: '#10B981', icon: Video },
            { label: 'Offer Rate', value: `${metrics.offerRate}%`, sub: 'Offers received', color: '#F59E0B', icon: Award },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className={`animate-slide-up stagger-${idx + 1} hover-glow`}
                style={{
                  backgroundColor: '#0F1714',
                  border: '1px solid rgba(52, 211, 153, 0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 650, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {kpi.label}
                  </div>
                  <Icon size={16} color={kpi.color} strokeWidth={2} />
                </div>
                <div className="animate-count" style={{ fontSize: '1.85rem', fontWeight: 850, color: kpi.color, marginTop: '0.25rem', letterSpacing: '-0.03em', animationDelay: `${0.2 + idx * 0.08}s` }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>{kpi.sub}</div>
              </div>
            );
          })}
        </section>

        {/* Filters and Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '1rem 1.25rem',
            backgroundColor: '#0F1714',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 650,
                border: statusFilter === 'ALL' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: statusFilter === 'ALL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: statusFilter === 'ALL' ? '#34D399' : '#9CA3AF',
                cursor: 'pointer',
              }}
            >
              All ({applications.length})
            </button>
            {COLUMNS.map((col) => {
              const count = applications.filter((a) => a.status === col.status).length;
              const isSelected = statusFilter === col.status;
              return (
                <button
                  key={col.status}
                  type="button"
                  onClick={() => setStatusFilter(col.status)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 650,
                    border: isSelected ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#34D399' : '#9CA3AF',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search company, role, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#141E1A',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* View Content: Kanban Board or Table */}
        {viewMode === 'board' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              alignItems: 'start',
            }}
          >
            {COLUMNS.map((col) => {
              const colApps = filteredApps.filter((a) => a.status === col.status);
              return (
                <div
                  key={col.status}
                  style={{
                    backgroundColor: '#0C1210',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 240px)',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{col.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{col.description}</div>
                    </div>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: colApps.length > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: colApps.length > 0 ? '#34D399' : '#6B7280',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {colApps.length}
                    </span>
                  </div>

                  {/* Card List */}
                  <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
                    {colApps.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#4B5563', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No opportunities in this stage
                      </div>
                    ) : (
                      colApps.map((app, cardIdx) => (
                        <div
                          key={app.id}
                          className={`hover-glow animate-scale-in`}
                          style={{
                            backgroundColor: '#131D19',
                            border: '1px solid rgba(52, 211, 153, 0.15)',
                            borderRadius: '10px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            animationDelay: `${cardIdx * 0.06}s`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{app.company}</div>
                              <div style={{ fontSize: '0.825rem', color: '#9CA3AF', marginTop: '0.1rem' }}>{app.role}</div>
                            </div>
                            {app.matchScore && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 750,
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '6px',
                                  backgroundColor: app.matchScore >= 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                                  color: app.matchScore >= 90 ? '#34D399' : '#FDE68A',
                                  border: app.matchScore >= 90 ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Sparkles size={11} /> {app.matchScore}% Match
                              </span>
                            )}
                          </div>

                          {app.location && (
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MapPin size={12} color="#9CA3AF" /> {app.location}
                            </div>
                          )}

                          {app.salaryNote && (
                            <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <DollarSign size={12} color="#34D399" /> {app.salaryNote}
                            </div>
                          )}

                          {app.interviewDate && (
                            <div
                              style={{
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#93C5FD',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <Calendar size={12} color="#93C5FD" /> Round: {new Date(app.interviewDate).toLocaleDateString()}
                            </div>
                          )}

                          {/* Quick Stage Move Dropdown */}
                          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Stage:</span>
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                              style={{
                                backgroundColor: '#1A2621',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#E5E7EB',
                                fontSize: '0.75rem',
                                borderRadius: '4px',
                                padding: '0.2rem 0.4rem',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {COLUMNS.map((c) => (
                                <option key={c.status} value={c.status}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div
            style={{
              backgroundColor: '#0F1714',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Company & Role</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Match</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Applied Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Compensation</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: '#9CA3AF' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app, idx) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>{app.company}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{app.role}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: app.status === 'OFFER' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: app.status === 'OFFER' ? '#34D399' : '#D1D5DB',
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#34D399', fontWeight: 700, fontSize: '0.85rem' }}>
                      {app.matchScore ? `${app.matchScore}%` : '—'}
                    </td>
                    <td style={{ padding: '1rem', color: '#9CA3AF', fontSize: '0.85rem' }}>
                      {app.appliedDate || '—'}
                    </td>
                    <td style={{ padding: '1rem', color: '#E5E7EB', fontSize: '0.85rem' }}>
                      {app.salaryNote || '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        style={{
                          backgroundColor: '#141E1A',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#E5E7EB',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          padding: '0.3rem 0.5rem',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Opportunity Modal */}
      {isAddModalOpen && (
        <div
          className="animate-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="animate-modal"
            style={{
              backgroundColor: '#0F1714',
              borderRadius: '16px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)',
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#FFFFFF', margin: 0 }}>Add New Career Opportunity</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Stripe, Vercel"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
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
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Remote / City"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
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
                    Target Salary
                  </label>
                  <input
                    type="text"
                    placeholder="$100k - $130k"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Pipeline Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
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
                >
                  {COLUMNS.map((c) => (
                    <option key={c.status} value={c.status}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Notes & Next Actions
                </label>
                <textarea
                  rows={3}
                  placeholder="Key referral contact, technical round specs, interview date..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#9CA3AF',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
