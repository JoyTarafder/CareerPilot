'use client';

import React, { useState } from 'react';
import { SupportedLocale, getDictionary, NotificationPreferences } from '@careerpilot/contracts';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  Globe,
  Bell,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function SettingsPage() {
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const dict = getDictionary(locale);

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailFollowUpReminders: true,
    emailInterviewReminders: true,
    weeklyDigest: true,
    locale: 'en',
  });
  const [prefsSavedMessage, setPrefsSavedMessage] = useState<string | null>(null);

  // Temporary Support Access State
  const [supportActive, setSupportActive] = useState(false);
  const [supportReason, setSupportReason] = useState('Help debugging resume PDF layout');
  const [supportExpiresAt, setSupportExpiresAt] = useState<string | null>(null);
  const [supportNotice, setSupportNotice] = useState<string | null>(null);

  const handleToggleLocale = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setPreferences((prev) => ({ ...prev, locale: newLocale }));
  };

  const handleSavePreferences = () => {
    setPrefsSavedMessage(
      locale === 'bn'
        ? 'আপনার পছন্দসমূহ সফলভাবে সংরক্ষিত হয়েছে।'
        : 'Your notification preferences have been saved successfully.'
    );
    setTimeout(() => setPrefsSavedMessage(null), 3000);
  };

  const handleGrantSupport = () => {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString();
    setSupportActive(true);
    setSupportExpiresAt(expires);
    setSupportNotice(
      locale === 'bn'
        ? `সাপোর্ট অনুমোদন সক্রিয় করা হয়েছে। মেয়াদ শেষ হবে: ${expires}`
        : `Temporary support access granted. Access expires at: ${expires}`
    );
  };

  const handleRevokeSupport = () => {
    setSupportActive(false);
    setSupportExpiresAt(null);
    setSupportNotice(
      locale === 'bn'
        ? 'সাপোর্ট অ্যাক্সেস সফলভাবে প্রত্যাহার করা হয়েছে।'
        : 'Support access has been revoked immediately.'
    );
  };

  return (
    <WorkspaceShell
      activeRoute="settings"
      title={dict.settings.title}
      subtitle="Manage bilingual localization, reminder notifications, and zero-trust support privacy"
    >
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Language & Localization Card */}
        <div
          className="animate-slide-up stagger-1"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={18} color="#10B981" />
                <span>{dict.settings.language} / ভাষা নির্বাচন</span>
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#9CA3AF' }}>
                Instant client-side translation across English and Bangla (বাংলা)
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}
            >
              Active: {locale === 'bn' ? 'বাংলা' : 'English'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleToggleLocale('en')}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                border: locale === 'en' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: locale === 'en' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 700, color: locale === 'en' ? '#34D399' : '#FFFFFF' }}>English</div>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.2rem' }}>Default international interface</div>
            </button>

            <button
              type="button"
              onClick={() => handleToggleLocale('bn')}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                border: locale === 'bn' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: locale === 'bn' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 700, color: locale === 'bn' ? '#34D399' : '#FFFFFF' }}>বাংলা (Bangla)</div>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.2rem' }}>বাংলাদেশ ও আন্তর্জাতিক বাংলাভাষী প্রার্থীদের জন্য</div>
            </button>
          </div>
        </div>

        {/* Notifications & Reminders Card */}
        <div
          className="animate-slide-up stagger-2"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="#10B981" />
                <span>{dict.settings.notifications}</span>
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#9CA3AF' }}>
                Control which email alerts are dispatched by the reminder engine
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                key: 'emailFollowUpReminders',
                title: 'Application Follow-Up Alerts',
                desc: 'Receive alerts when an application has had no response past your configured follow-up date.',
                checked: preferences.emailFollowUpReminders,
              },
              {
                key: 'emailInterviewReminders',
                title: 'Scheduled Interview Reminders',
                desc: 'Receive preparation digests 24 hours and 2 hours before scheduled interview rounds.',
                checked: preferences.emailInterviewReminders,
              },
              {
                key: 'weeklyDigest',
                title: 'Weekly Velocity Report',
                desc: 'Summary of applications sent, response rates, and recommended skills to add.',
                checked: preferences.weeklyDigest,
              },
            ].map((pref) => (
              <label
                key={pref.key}
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: '#131D19',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={pref.checked}
                  onChange={(e) => {
                    setPreferences({ ...preferences, [pref.key]: e.target.checked });
                  }}
                  style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: '#10B981' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{pref.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.2rem' }}>{pref.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={handleSavePreferences}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {dict.settings.saveChanges}
            </button>
            {prefsSavedMessage && (
              <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 650 }}>
                {prefsSavedMessage}
              </span>
            )}
          </div>
        </div>

        {/* Temporary Support Access Card (Zero-Trust) */}
        <div
          className="animate-slide-up stagger-3"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="#10B981" />
                <span>{dict.settings.supportAccess} (Zero-Trust Privacy)</span>
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#9CA3AF' }}>
                Admins and engineers cannot view candidate drafts without an active temporary grant
              </p>
            </div>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: supportActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                color: supportActive ? '#34D399' : '#F87171',
                border: supportActive ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {supportActive ? 'GRANT ACTIVE' : 'LOCKED (ZERO ACCESS)'}
            </span>
          </div>

          <div style={{ backgroundColor: '#131D19', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.35rem', fontWeight: 600 }}>
              Reason for Granting Support Access
            </label>
            <input
              type="text"
              disabled={supportActive}
              value={supportReason}
              onChange={(e) => setSupportReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: supportActive ? 'rgba(255, 255, 255, 0.03)' : '#141E1A',
                color: '#FFFFFF',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
            {supportExpiresAt && (
              <div style={{ fontSize: '0.8rem', color: '#34D399', marginTop: '0.5rem', fontWeight: 600 }}>
                Access expires automatically at: {supportExpiresAt}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {!supportActive ? (
              <button
                type="button"
                onClick={handleGrantSupport}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: '#1E2D27',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34D399',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Grant 24-Hour Temporary Access
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRevokeSupport}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Immediately Revoke Support Access
              </button>
            )}
            {supportNotice && (
              <span style={{ fontSize: '0.85rem', color: '#A7F3D0', fontWeight: 600 }}>
                {supportNotice}
              </span>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
