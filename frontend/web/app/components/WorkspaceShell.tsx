'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  FileText,
  Target,
  Kanban,
  PenTool,
  Mic,
  Settings,
  Zap,
  Sparkles,
  Compass,
  Search,
  Command,
  Clock,
  ArrowRight,
  X,
  Menu,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

interface WorkspaceShellProps {
  activeRoute: 'profile' | 'resumes' | 'analyze' | 'applications' | 'writing' | 'interviews' | 'settings';
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  category: 'Navigation' | 'Tools' | 'Quick Actions';
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

export function WorkspaceShell({
  activeRoute,
  title,
  subtitle,
  actions,
  children,
}: WorkspaceShellProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('02:00 AM');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update Dhaka live time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatted in UTC+6 (Dhaka)
      const dhakaTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      setCurrentTime(dhakaTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'profile',
      label: 'Career Profile',
      href: '/profile',
      icon: User,
      step: 1,
    },
    {
      id: 'resumes',
      label: 'ATS Resumes',
      href: '/resumes',
      icon: FileText,
      step: 2,
    },
    {
      id: 'analyze',
      label: 'Match Analyzer',
      href: '/analyze',
      icon: Target,
      step: 3,
    },
    {
      id: 'applications',
      label: 'Applications CRM',
      href: '/applications',
      icon: Kanban,
      step: 4,
    },
    {
      id: 'writing',
      label: 'AI Writing Studio',
      href: '/writing',
      icon: PenTool,
      step: 5,
    },
    {
      id: 'interviews',
      label: 'Mock Interviews',
      href: '/interviews',
      icon: Mic,
      step: 6,
    },
    {
      id: 'settings',
      label: 'Settings & i18n',
      href: '/settings',
      icon: Settings,
      step: 7,
    },
  ];

  const careerThreadStages = [
    { id: 'profile', label: '1. Profile', href: '/profile' },
    { id: 'resumes', label: '2. Resume', href: '/resumes' },
    { id: 'analyze', label: '3. Match', href: '/analyze' },
    { id: 'applications', label: '4. Tracker', href: '/applications' },
    { id: 'writing', label: '5. Writing', href: '/writing' },
    { id: 'interviews', label: '6. Interview', href: '/interviews' },
  ];

  const commandItems: CommandItem[] = [
    {
      id: 'nav-profile',
      label: 'Career Profile & Verified Skills',
      description: 'Manage verified technical skills, experiences, and education',
      category: 'Navigation',
      href: '/profile',
      icon: User,
    },
    {
      id: 'nav-resumes',
      label: 'ATS Resumes & Export',
      description: 'Build ATS-safe templates, snapshot versions, and export PDF/DOCX',
      category: 'Navigation',
      href: '/resumes',
      icon: FileText,
    },
    {
      id: 'nav-analyze',
      label: 'Job Match Analyzer',
      description: 'Deterministic 7-category CV scoring with live Evidence Map',
      category: 'Navigation',
      href: '/analyze',
      icon: Target,
    },
    {
      id: 'nav-applications',
      label: 'Job Applications CRM',
      description: 'Kanban board, status tracker, and candidate opportunity pipeline',
      category: 'Navigation',
      href: '/applications',
      icon: Kanban,
    },
    {
      id: 'nav-writing',
      label: 'AI Writing Studio',
      description: 'Bullet improver (Google XYZ), tailored summary, and cover letters',
      category: 'Tools',
      href: '/writing',
      icon: PenTool,
    },
    {
      id: 'nav-interviews',
      label: 'STAR Mock Interview Studio',
      description: 'Practice grounded questions with live 5-dimension rubric scoring',
      category: 'Tools',
      href: '/interviews',
      icon: Mic,
    },
    {
      id: 'nav-settings',
      label: 'Candidate Settings & Preferences',
      description: 'English / বাংলা language switcher, reminders, and support grants',
      category: 'Navigation',
      href: '/settings',
      icon: Settings,
    },
    {
      id: 'action-new-job',
      label: 'Add New Job Opportunity',
      description: 'Open the job application modal and record a target role',
      category: 'Quick Actions',
      href: '/applications?action=new',
      icon: Sparkles,
    },
    {
      id: 'action-language',
      label: 'Language: English / বাংলা',
      description: 'Configure candidate interface localization',
      category: 'Quick Actions',
      href: '/settings#language',
      icon: Globe,
    },
  ];

  // Filter commands by search query
  const filteredCommands = commandItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Focus search input when command palette opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Command palette keyboard navigation (Up, Down, Enter)
  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        window.location.href = selected.href;
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080D0B', color: '#E2E8E5', position: 'relative' }}>
      {/* UI/UX Pro Max: Animated Aurora Ambient Background */}
      <AnimatedBackground />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
          }}
        />
      )}

      {/* Persistent Left Workspace Rail / Mobile Drawer */}
      <aside
        className={`workspace-sidebar ${isMobileMenuOpen ? 'workspace-sidebar-open' : ''}`}
      >
        <div>
          {/* Logo & Version Pill */}
          <div style={{ padding: '0.25rem 0.5rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
                }}
              >
                <Compass size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                CareerPilot
              </span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                }}
              >
                PRO
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="show-on-mobile"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Spotlight Trigger Button in Sidebar */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.75rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#9CA3AF',
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="hover-lift"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={14} color="#10B981" />
              <span>Quick Actions...</span>
            </span>
            <kbd
              style={{
                fontSize: '0.65rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '0.15rem 0.35rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#D1D5DB',
              }}
            >
              Ctrl+K
            </kbd>
          </button>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item, index) => {
              const isActive = activeRoute === item.id;
              const IconComponent = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`animate-fade-in stagger-${index + 1} press-effect`}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 650 : 500,
                    color: isActive ? '#34D399' : '#9CA3AF',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                    border: isActive ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <IconComponent
                    size={18}
                    color={isActive ? '#10B981' : '#6B7280'}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    style={{ transition: 'color 0.2s ease' }}
                  />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Candidate & Quota Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Daily AI Quota Indicator */}
          <div
            className="bento-card"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={13} color="#10B981" /> Daily AI Quota
              </span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>42 / 50</span>
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #059669, #34D399)', borderRadius: '9999px' }} />
            </div>
          </div>

          {/* User Profile Pill with Time & Beacon */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#111A16',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#175C4C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                }}
              >
                AA
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 650, color: '#FFFFFF' }}>Arif Ahmed</div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={11} color="#10B981" />
                  <span>{currentTime} (UTC+6)</span>
                </div>
              </div>
            </div>
            <div
              className="animate-breathe"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
              title="Online Active"
            />
          </div>
        </div>
      </aside>

      {/* Main Workspace Surface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Header */}
        <header
          className="animate-slide-down workspace-header"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(12, 18, 16, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="workspace-mobile-toggle"
                aria-label="Open navigation menu"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', fontWeight: 750, margin: 0, letterSpacing: '-0.025em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {title}
                </h1>
                <p style={{ margin: '0.15rem 0 0', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', color: '#9CA3AF' }}>
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Header Right Actions & Spotlight Trigger */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="btn-glass-secondary hover-lift"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                }}
                title="Search commands (Ctrl+K)"
              >
                <Command size={14} color="#34D399" />
                <span className="hide-on-mobile">Commands</span>
                <kbd className="hide-on-mobile" style={{ fontSize: '0.7rem', opacity: 0.6, background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  ⌘K
                </kbd>
              </button>
              {actions}
            </div>
          </div>

          {/* Career Thread Milestone Stepper (DESIGN.md Signature Idea) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              paddingTop: '0.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
              <Sparkles size={12} color="#10B981" /> Career Thread:
            </span>
            {careerThreadStages.map((stage, idx) => {
              const isActive = activeRoute === stage.id;
              return (
                <React.Fragment key={stage.id}>
                  <a
                    href={stage.href}
                    className={`career-thread-step ${isActive ? 'active' : ''}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <span>{stage.label}</span>
                  </a>
                  {idx < careerThreadStages.length - 1 && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '0.7rem' }}>›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </header>

        {/* Content Body */}
        <main className="page-enter workspace-main-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / Cmd+K) Modal */}
      {isCommandPaletteOpen && (
        <div
          onClick={() => setIsCommandPaletteOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-palette"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#0F1714',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Input Search Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Search size={18} color="#10B981" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Jump to a tool, feature, or action... (e.g. Resume, STAR, Bangla)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handlePaletteKeyDown}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
              <kbd
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#9CA3AF',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Filtered Command List */}
            <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '0.5rem' }}>
              {filteredCommands.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                  No matching shortcuts found. Try searching for "Resume", "Score", or "Interview".
                </div>
              ) : (
                filteredCommands.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`command-item ${isSelected ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        margin: '0.2rem 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} color={isSelected ? '#34D399' : '#9CA3AF'} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#FFFFFF' : '#E5E7EB' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#9CA3AF' }}>{item.description}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        {item.category}
                      </span>
                    </a>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div
              style={{
                padding: '0.65rem 1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.725rem',
                color: '#6B7280',
              }}
            >
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to close</span>
              </div>
              <span style={{ color: '#10B981', fontWeight: 600 }}>CareerPilot OS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
