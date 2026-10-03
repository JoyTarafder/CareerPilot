'use client';

import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Scale,
  Server,
  Zap,
  RefreshCw,
  Lock,
  ScrollText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Cloud,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  ip: string;
  severity: 'INFO' | 'WARN' | 'SEC_AUDIT';
  status: 'SUCCESS' | 'BLOCKED';
}

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'support' | 'scoring' | 'audit'>('telemetry');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [supportTicketApproved, setSupportTicketApproved] = useState(false);

  const initialLogs: AuditEvent[] = [
    {
      id: 'evt_99182a',
      timestamp: '2026-10-02 15:12:04',
      actor: 'candidate@careerpilot.dev',
      action: 'AUTH_SESSION_RENEW',
      ip: '103.114.98.12',
      severity: 'INFO',
      status: 'SUCCESS',
    },
    {
      id: 'evt_99181f',
      timestamp: '2026-10-02 15:10:21',
      actor: 'system.worker.scoring',
      action: 'RESUME_ANALYSIS_JOB_COMPLETE',
      ip: '10.0.4.19',
      severity: 'INFO',
      status: 'SUCCESS',
    },
    {
      id: 'evt_99180d',
      timestamp: '2026-10-02 15:05:43',
      actor: 'anonymous_probe',
      action: 'INVALID_PATH_BLOCKED: /admin/debug',
      ip: '185.220.101.5',
      severity: 'SEC_AUDIT',
      status: 'BLOCKED',
    },
    {
      id: 'evt_99179b',
      timestamp: '2026-10-02 14:58:12',
      actor: 'ops-lead@careerpilot.dev',
      action: 'SCORING_RULESET_VALIDATED (v1.2.0)',
      ip: '103.114.98.1',
      severity: 'INFO',
      status: 'SUCCESS',
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#080D0B',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)',
        color: '#FFFFFF',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Operations Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(52, 211, 153, 0.15)',
          backgroundColor: '#0C1210',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              CareerPilot <span style={{ color: '#34D399', fontWeight: 600, fontSize: '0.9rem' }}>Console</span>
            </span>
          </div>

          <div style={{ height: '16px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34D399',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            CLUSTER AP-SOUTHEAST-1
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#CBD5E1',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={13} style={{ transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }} />
            {isRefreshing ? 'Refreshing...' : 'Live Sync'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94A3B8' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#131D19',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              OP
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8rem' }}>ops-lead@careerpilot.dev</div>
              <div style={{ fontSize: '0.7rem', color: '#34D399' }}>SUPER_ADMIN (TTL: 42m)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem', width: '100%' }}>
        {/* Title & Quick Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Operational Mission Control
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Worker telemetry, zero-trust support access boundaries, and scoring ruleset governance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span
              style={{
                backgroundColor: '#10B981',
                color: '#080D0B',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle2 size={14} color="#080D0B" />
              ALL SYSTEMS HEALTHY
            </span>
          </div>
        </div>

        {/* KPI Cards Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Queue Jobs
              </div>
              <Server size={15} color="#34D399" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
              3 <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 500 }}>/ 0 failed</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
              BullMQ · Redis Cluster shard 01
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Security Audits
              </div>
              <ShieldCheck size={15} color="#34D399" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', marginTop: '0.35rem' }}>
              0 <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>incidents</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
              Argon2id · Zero PII leaks detected
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scoring Ruleset
              </div>
              <Scale size={15} color="#34D399" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
              v1.2.0 <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 500 }}>prod</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
              SHA256 verified · 7-pillar model
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                API Health & Latency
              </div>
              <Activity size={15} color="#34D399" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', marginTop: '0.35rem' }}>
              99.98% <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>p95 38ms</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
              Express 5 · 2 instances active
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Daily AI Token Budget
              </div>
              <Zap size={15} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
              $1.42 <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>/ $50.00</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.35rem' }}>
              2.8% of daily limit consumed
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: activeTab === 'telemetry' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'telemetry' ? '2px solid #10B981' : '2px solid transparent',
              color: activeTab === 'telemetry' ? '#34D399' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s',
            }}
          >
            <Activity size={15} /> Cluster Telemetry
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: activeTab === 'support' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'support' ? '2px solid #10B981' : '2px solid transparent',
              color: activeTab === 'support' ? '#34D399' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s',
            }}
          >
            <Lock size={15} /> Zero-Trust Support Boundary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scoring')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: activeTab === 'scoring' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'scoring' ? '2px solid #10B981' : '2px solid transparent',
              color: activeTab === 'scoring' ? '#34D399' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s',
            }}
          >
            <Scale size={15} /> Scoring Ruleset Engine
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: activeTab === 'audit' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'audit' ? '2px solid #10B981' : '2px solid transparent',
              color: activeTab === 'audit' ? '#34D399' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s',
            }}
          >
            <ScrollText size={15} /> Immutable Audit Log
          </button>
        </div>

        {/* Tab 1: Telemetry */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
            <div
              style={{
                backgroundColor: '#0C1210',
                borderRadius: '12px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={17} color="#10B981" /> Background Worker Fleet (BullMQ)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#111A16', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>worker-analysis-01</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Handling resume parsing & ATS extraction</div>
                  </div>
                  <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>● RUNNING (4.2% CPU)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#111A16', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>worker-scoring-01</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Deterministic 7-category scoring vector</div>
                  </div>
                  <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>● RUNNING (1.8% CPU)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#111A16', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>worker-interview-eval-01</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>STAR rubric evaluation & behavioral analysis</div>
                  </div>
                  <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>● IDLE READY (0.4% CPU)</span>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#0C1210',
                borderRadius: '12px',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={17} color="#10B981" /> Persistence & Storage Subsystems
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: '#111A16', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>PostgreSQL 16 Multi-Tenant DB</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>14/50 connections active · 12ms latency</div>
                  </div>
                  <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>HEALTHY</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: '#111A16', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Redis 7.2 In-Memory Store</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Rate limiting, session tokens, BullMQ state</div>
                  </div>
                  <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>38 MB / 512 MB</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: '#111A16', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Encrypted Artifact Storage (S3/GCS)</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>AES-256 server-side encryption with KMS</div>
                  </div>
                  <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>SYNCED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Zero-Trust Support Access */}
        {activeTab === 'support' && (
          <div
            style={{
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={18} color="#10B981" /> Privacy & Zero-Trust Governance Boundary
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
                  Per [SECURITY.md §13](file:///g:/New%20Projects/careerpilot/SECURITY.md), CareerPilot administrators cannot casually view or query candidate resume text or private interview logs. Direct candidate artifact inspection requires an explicit, cryptographically audited support ticket with 15-minute time-bound expiration.
                </p>
              </div>

              <span
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={14} /> ENFORCED BY ROW-LEVEL SECURITY
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#111A16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginTop: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Pending Support Access Ticket #SUP-2026-8942
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
                <div>Target Candidate ID: <code style={{ color: '#34D399' }}>usr_demo_candidate</code></div>
                <div>Requester: <code>support-agent-2@careerpilot.dev</code></div>
                <div>Reason: <code>Investigate LaTeX PDF generation font artifact</code></div>
                <div>TTL Requested: <code>15 minutes</code></div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {supportTicketApproved ? (
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      color: '#34D399',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={16} /> Ephemeral Support Token Granted (Expires in 14m 58s) · Audited to Immutable Log
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSupportTicketApproved(true)}
                      style={{
                        backgroundColor: '#10B981',
                        color: '#080D0B',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <CheckCircle2 size={14} /> Authorize Ephemeral 15m Token
                    </button>
                    <button
                      type="button"
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#F87171',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <XCircle size={14} /> Deny Request
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Scoring Ruleset */}
        {activeTab === 'scoring' && (
          <div
            style={{
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={18} color="#10B981" /> Deterministic Scoring Engine (Ruleset v1.2.0)
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                  Algorithmic weights applied deterministically across candidate resume vs target job descriptions.
                </p>
              </div>

              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34D399',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                WEIGHT_SUM: 100%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { category: 'Role Title & Seniority Alignment', weight: '20%', desc: 'Matches target title, years of experience, and scope.' },
                { category: 'Hard Technical & Domain Skills', weight: '20%', desc: 'Exact and synonymous technology stack matches.' },
                { category: 'Measurable Quantified Impact', weight: '20%', desc: 'Google XYZ formula (metrics, percentages, dollars saved).' },
                { category: 'ATS Layout & Parser Friendliness', weight: '15%', desc: 'Standard section headings, UTF-8 clean text, single column.' },
                { category: 'Leadership & Soft Skills', weight: '10%', desc: 'Collaboration, mentorship, cross-functional ownership.' },
                { category: 'Brevity & Information Density', weight: '10%', desc: 'Word count limits, filler deletion, concise bullet structure.' },
                { category: 'Tone & Executive Presentation', weight: '5%', desc: 'Active voice, high-confidence professional terminology.' },
              ].map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#111A16',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{rule.category}</span>
                    <span style={{ color: '#34D399', fontWeight: 800, fontSize: '0.85rem' }}>{rule.weight}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.4 }}>{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Log */}
        {activeTab === 'audit' && (
          <div
            style={{
              backgroundColor: '#0C1210',
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ScrollText size={18} color="#10B981" /> Live System Audit Trail
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>
                  Cryptographically chained audit events stored with retention policy of 365 days.
                </p>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Streaming live events...</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>EVENT ID</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>TIMESTAMP</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>ACTOR</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>ACTION</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>IP ADDRESS</th>
                    <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {initialLogs.map((log) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: log.severity === 'SEC_AUDIT' ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#94A3B8' }}>{log.id}</td>
                      <td style={{ padding: '0.75rem', color: '#94A3B8' }}>{log.timestamp}</td>
                      <td style={{ padding: '0.75rem', color: '#FFFFFF', fontWeight: 600 }}>{log.actor}</td>
                      <td style={{ padding: '0.75rem', color: log.severity === 'SEC_AUDIT' ? '#F87171' : '#34D399', fontWeight: 500 }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#94A3B8' }}>{log.ip}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: log.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: log.status === 'SUCCESS' ? '#34D399' : '#F87171',
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
