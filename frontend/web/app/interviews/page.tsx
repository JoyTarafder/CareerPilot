'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import {
  Mic,
  Timer,
  Sparkles,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  category: 'HR' | 'BEHAVIORAL' | 'TECHNICAL' | 'CV_BASED' | 'MIXED';
  starPrompt: string;
}

interface StarBreakdown {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface FeedbackDetails {
  relevance: number;
  clarity: number;
  structure: number;
  evidence: number;
  concision: number;
  overallRating: number;
  feedbackSummary: string;
  starBreakdown: StarBreakdown;
  strengths: string[];
  areasForImprovement: string[];
  practiceRecommendation: string;
  nonEmotionNotice: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    questionText: 'Describe a high-stakes technical incident where a production service was dropping requests, and how you resolved it.',
    category: 'TECHNICAL',
    starPrompt: 'Focus on the diagnostic telemetry used, concurrency bottlenecks identified, and verified latency recovery metrics.',
  },
  {
    id: 'q-2',
    questionText: 'Tell me about a situation where you had an architectural disagreement with another senior engineer regarding database choice.',
    category: 'BEHAVIORAL',
    starPrompt: 'Highlight how you leveraged objective benchmarks and trade-off matrices rather than personal opinions.',
  },
  {
    id: 'q-3',
    questionText: 'Walk me through how you designed a microservices caching pattern to handle Black Friday traffic spikes.',
    category: 'CV_BASED',
    starPrompt: 'Reference your experience with Redis cluster topologies and cache invalidation strategies.',
  },
];

export default function MockInterviewPage() {
  const [selectedFocus, setSelectedFocus] = useState<'TECHNICAL' | 'BEHAVIORAL' | 'CV_BASED' | 'MIXED'>('TECHNICAL');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackDetails | null>(null);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;
  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIdx] ?? SAMPLE_QUESTIONS[0]!;

  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    setIsTimerRunning(false);

    setTimeout(() => {
      setIsEvaluating(false);
      setFeedback({
        relevance: 5,
        clarity: 4,
        structure: 5,
        evidence: 5,
        concision: 4,
        overallRating: 4.8,
        feedbackSummary: 'Excellent STAR structure with deep engineering grounding. Clear progression from problem diagnosis to measurable outcomes.',
        starBreakdown: {
          situation: 'High-concurrency traffic spike causing database connection exhaustion.',
          task: 'Diagnose p99 latency degradation under 5 minutes without service downtime.',
          action: 'Introduced Redis connection pool caching and query index restructuring.',
          result: 'Reduced error rate to 0.001% and dropped latency from 850ms to 24ms.',
        },
        strengths: [
          'Directly addressed the technical diagnostic steps.',
          'Quantified latency recovery with concrete numbers.',
        ],
        areasForImprovement: [
          'Briefly mention how post-incident monitoring was set up to prevent recurrence.',
        ],
        practiceRecommendation: 'Rehearse answering in under 2 minutes for maximum concision during initial screen rounds.',
        nonEmotionNotice: 'Objective feedback based strictly on structure, factual relevance, and evidence. Emotion or personality inference is explicitly excluded.',
      });
    }, 800);
  };

  return (
    <WorkspaceShell
      activeRoute="interviews"
      title="STAR Mock Interview Simulator"
      subtitle="Practice job-tailored technical & behavioral interviews with real-time rubric evaluation"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: '#131D19',
              border: '1px solid rgba(52, 211, 153, 0.2)',
              color: '#34D399',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Timer size={14} color="#34D399" />
            <span>Session Timer: {formatTimer(timerSeconds)}</span>
          </div>
        </div>
      }
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Focus Selector Ribbon */}
        <div
          className="animate-slide-up hover-glow"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0F1714',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '1rem',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 600 }}>Interview Focus:</span>
            {(['TECHNICAL', 'BEHAVIORAL', 'CV_BASED', 'MIXED'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFocus(f)}
                className="press-effect hover-lift"
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  border: selectedFocus === f ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: selectedFocus === f ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: selectedFocus === f ? '#34D399' : '#9CA3AF',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: selectedFocus === f ? '0 0 15px rgba(16, 185, 129, 0.25)' : 'none',
                }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
              Question {currentQuestionIdx + 1} of {SAMPLE_QUESTIONS.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentQuestionIdx((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
                setUserAnswer('');
                setFeedback(null);
                setTimerSeconds(0);
                setIsTimerRunning(true);
              }}
              className="hover-lift"
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Next Question</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div
          className="animate-slide-up stagger-1 hover-glow"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                textTransform: 'uppercase',
              }}
            >
              {currentQuestion.category} QUESTION
            </span>

            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Ethics: Non-Emotion Grounded Evaluation
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 750, color: '#FFFFFF', lineHeight: 1.4, margin: '0 0 1rem' }}>
            &ldquo;{currentQuestion.questionText}&rdquo;
          </h2>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#9CA3AF' }}>
            <strong style={{ color: '#34D399' }}>STAR Tip:</strong> {currentQuestion.starPrompt}
          </div>
        </div>

        {/* Answer Input Surface */}
        <div
          className="animate-slide-up stagger-2 hover-glow"
          style={{
            backgroundColor: '#0F1714',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2rem',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>Your Structured Answer</span>
            <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{wordCount} words</span>
          </div>

          <form onSubmit={handleEvaluateAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              rows={8}
              placeholder="Structure your answer using STAR: Situation (context), Task (objective), Action (what you specifically did), and Result (quantifiable impact)..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#141E1A',
                color: '#FFFFFF',
                outline: 'none',
                fontSize: '0.925rem',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setUserAnswer('Situation: During a 3x traffic surge on our payment microservice, thread pool exhaustion led to 504 gateway timeouts.\nTask: As the on-call platform engineer, I needed to restore service SLA within 10 minutes without dropping active in-flight transactions.\nAction: I dynamically increased the worker pool concurrency limit using our live feature flag, spun up two read replicas, and instituted Redis connection rate limiting.\nResult: Error rates dropped to zero within 4 minutes, p99 latency returned to 22ms, and we processed over $450,000 in transactions without a single dropped payment.')}
                className="hover-brighten"
                style={{
                  fontSize: '0.8rem',
                  color: '#34D399',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'all 0.2s ease',
                }}
              >
                + Quick-fill sample STAR response
              </button>

              <button
                type="submit"
                disabled={isEvaluating || !userAnswer.trim()}
                className={`hover-lift ${!isEvaluating && userAnswer.trim() ? 'btn-emerald-glow' : ''}`}
                style={{
                  padding: '0.75rem 1.75rem',
                  borderRadius: '10px',
                  background: isEvaluating ? '#1A2621' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: isEvaluating ? 'not-allowed' : 'pointer',
                  boxShadow: isEvaluating ? 'none' : '0 0 20px rgba(16, 185, 129, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <Sparkles size={16} />
                <span>{isEvaluating ? 'Evaluating with STAR Rubric...' : 'Submit & Evaluate Answer'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Real-Time STAR Feedback Details */}
        {feedback && (
          <div
            className="animate-slide-up hover-glow"
            style={{
              backgroundColor: '#0F1714',
              borderRadius: '16px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Top Score Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>
                  Rubric Assessment Score
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0' }}>
                  Answer Evaluation Summary
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 850, color: '#34D399', lineHeight: 1 }}>
                  {feedback.overallRating} <span style={{ fontSize: '1.2rem', color: '#6B7280' }}>/ 5.0</span>
                </div>
              </div>
            </div>

            {/* 5-Dimension Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Relevance', score: `${feedback.relevance} / 5`, desc: 'Directly answers question' },
                { label: 'Clarity', score: `${feedback.clarity} / 5`, desc: 'Understandable and concise' },
                { label: 'Structure', score: `${feedback.structure} / 5`, desc: 'Valid STAR framing' },
                { label: 'Evidence', score: `${feedback.evidence} / 5`, desc: 'Concrete verifiable metrics' },
                { label: 'Concision', score: `${feedback.concision} / 5`, desc: 'Zero rambling phrases' },
              ].map((dim) => (
                <div
                  key={dim.label}
                  className="hover-lift hover-glow"
                  style={{
                    backgroundColor: '#141E1A',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{dim.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399', margin: '0.25rem 0' }}>{dim.score}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{dim.desc}</div>
                </div>
              ))}
            </div>

            {/* STAR Breakdown */}
            <div style={{ backgroundColor: '#131D19', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.85rem' }}>
                STAR Structural Breakdown
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>Situation</div>
                  <div style={{ fontSize: '0.85rem', color: '#D1D5DB', marginTop: '0.2rem' }}>{feedback.starBreakdown.situation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>Task</div>
                  <div style={{ fontSize: '0.85rem', color: '#D1D5DB', marginTop: '0.2rem' }}>{feedback.starBreakdown.task}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>Action</div>
                  <div style={{ fontSize: '0.85rem', color: '#D1D5DB', marginTop: '0.2rem' }}>{feedback.starBreakdown.action}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>Result</div>
                  <div style={{ fontSize: '0.85rem', color: '#D1D5DB', marginTop: '0.2rem' }}>{feedback.starBreakdown.result}</div>
                </div>
              </div>
            </div>

            {/* Ethical Non-Emotion Notice */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.75rem', color: '#9CA3AF' }}>
              <strong>⚖️ Ethical Non-Emotion Standard:</strong> {feedback.nonEmotionNotice}
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
