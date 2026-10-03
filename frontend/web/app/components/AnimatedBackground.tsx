'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * AnimatedBackground — Cinematic 3D Aesthetic & Magic Motion Engine
 * Powered by Framer Motion, 3D spatial perspective, interactive cursor parallax,
 * rotating polyhedral crystal prisms, floating gyro rings, and dynamic stardust constellations.
 */

// Stardust particle configuration (deterministic seed for clean SSR/hydration matching)
interface Particle {
  id: number;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  size: number; // px (1.5 - 4)
  depth: number; // z-axis parallax multiplier
  duration: number; // animation cycle duration
  delay: number;
  glowColor: string;
}

const SEEDED_PARTICLES: Particle[] = [
  { id: 1, x: 8, y: 15, size: 2.5, depth: 1.4, duration: 7, delay: 0.2, glowColor: '#34D399' },
  { id: 2, x: 22, y: 38, size: 3.5, depth: 2.0, duration: 9, delay: 1.1, glowColor: '#10B981' },
  { id: 3, x: 14, y: 72, size: 2.0, depth: 0.8, duration: 8, delay: 2.4, glowColor: '#06B6D4' },
  { id: 4, x: 35, y: 22, size: 3.0, depth: 1.6, duration: 11, delay: 0.8, glowColor: '#6EE7B7' },
  { id: 5, x: 42, y: 85, size: 2.2, depth: 1.1, duration: 7.5, delay: 3.2, glowColor: '#10B981' },
  { id: 6, x: 55, y: 12, size: 2.8, depth: 1.8, duration: 10, delay: 1.7, glowColor: '#34D399' },
  { id: 7, x: 68, y: 45, size: 3.2, depth: 2.2, duration: 8.5, delay: 0.5, glowColor: '#06B6D4' },
  { id: 8, x: 78, y: 18, size: 2.0, depth: 0.9, duration: 9.5, delay: 2.8, glowColor: '#6EE7B7' },
  { id: 9, x: 88, y: 64, size: 3.8, depth: 2.4, duration: 12, delay: 1.4, glowColor: '#10B981' },
  { id: 10, x: 92, y: 30, size: 2.4, depth: 1.3, duration: 8, delay: 0.9, glowColor: '#34D399' },
  { id: 11, x: 28, y: 58, size: 2.0, depth: 0.7, duration: 10.5, delay: 3.6, glowColor: '#06B6D4' },
  { id: 12, x: 62, y: 78, size: 3.4, depth: 1.9, duration: 9, delay: 2.1, glowColor: '#6EE7B7' },
  { id: 13, x: 48, y: 48, size: 1.8, depth: 0.6, duration: 7, delay: 1.9, glowColor: '#10B981' },
  { id: 14, x: 82, y: 88, size: 2.6, depth: 1.5, duration: 11.5, delay: 0.3, glowColor: '#34D399' },
  { id: 15, x: 5, y: 82, size: 3.0, depth: 1.7, duration: 8.2, delay: 2.7, glowColor: '#06B6D4' },
  { id: 16, x: 74, y: 35, size: 2.2, depth: 1.0, duration: 9.8, delay: 1.5, glowColor: '#6EE7B7' },
  { id: 17, x: 38, y: 92, size: 2.5, depth: 1.2, duration: 8.8, delay: 3.1, glowColor: '#10B981' },
  { id: 18, x: 95, y: 10, size: 3.2, depth: 2.1, duration: 10.2, delay: 0.6, glowColor: '#34D399' },
  { id: 19, x: 18, y: 95, size: 2.0, depth: 0.8, duration: 7.8, delay: 2.0, glowColor: '#06B6D4' },
  { id: 20, x: 85, y: 42, size: 2.8, depth: 1.6, duration: 9.2, delay: 1.2, glowColor: '#6EE7B7' },
];

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Raw mouse coordinates normalized to [-1, 1]
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Organic spring physics for smooth, weightless 3D camera parallax
  const springConfig = { damping: 28, stiffness: 100, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax layer transforms for multi-depth 3D illusion
  const backgroundX = useTransform(smoothX, [-1, 1], [-14, 14]);
  const backgroundY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const midgroundX = useTransform(smoothX, [-1, 1], [-28, 28]);
  const midgroundY = useTransform(smoothY, [-1, 1], [-20, 20]);
  const midgroundRotateX = useTransform(smoothY, [-1, 1], [4, -4]);
  const midgroundRotateY = useTransform(smoothX, [-1, 1], [-5, 5]);

  const foregroundX = useTransform(smoothX, [-1, 1], [-45, 45]);
  const foregroundY = useTransform(smoothY, [-1, 1], [-32, 32]);
  const foregroundRotateX = useTransform(smoothY, [-1, 1], [7, -7]);
  const foregroundRotateY = useTransform(smoothX, [-1, 1], [-8, 8]);

  // Cursor spotlight follower coordinates
  const spotlightX = useTransform(smoothX, [-1, 1], ['25%', '75%']);
  const spotlightY = useTransform(smoothY, [-1, 1], ['20%', '70%']);

  useEffect(() => {
    setMounted(true);

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch gestures on mobile to prevent scrolling jitter
      if (e.pointerType === 'touch') return;

      // Normalize to [-1, 1] relative to viewport center
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 1. Volumetric Overhead Projector Beam (Cinematic Stage Light) */}
      <div className="cinematic-projector-beam" />

      {/* 2. Flowing Aurora Mesh Gradient */}
      <div className="aurora-mesh-canvas" />

      {/* 3. Interactive Magic Cursor Spotlight Aura (Desktop only) */}
      {mounted && !shouldReduceMotion && (
        <motion.div
          className="hide-on-mobile"
          style={{
            position: 'absolute',
            left: spotlightX,
            top: spotlightY,
            transform: 'translate(-50%, -50%)',
            width: '640px',
            height: '640px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.05) 45%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 1,
            willChange: 'transform, left, top',
          }}
        />
      )}

      {/* 4. Deep Background Layer: Floating 3D Luminous Orbs with Parallax */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          x: shouldReduceMotion ? 0 : backgroundX,
          y: shouldReduceMotion ? 0 : backgroundY,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
        <div className="subtle-animated-grid" />
      </motion.div>

      {/* 5. Midground 3D Spatial Plane: Geometric Polyhedra & Gyro Rings */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          x: shouldReduceMotion ? 0 : midgroundX,
          y: shouldReduceMotion ? 0 : midgroundY,
          rotateX: shouldReduceMotion ? 0 : midgroundRotateX,
          rotateY: shouldReduceMotion ? 0 : midgroundRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 3D Polyhedral Floating Crystal Prism (Top-Right) */}
        <motion.div
          className="bg-3d-crystal"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotateX: [0, 360],
                  rotateY: [0, -360],
                  rotateZ: [0, 180],
                  y: [-12, 14, -12],
                }
          }
          transition={{
            rotateX: { duration: 32, ease: 'linear', repeat: Infinity },
            rotateY: { duration: 26, ease: 'linear', repeat: Infinity },
            rotateZ: { duration: 40, ease: 'linear', repeat: Infinity },
            y: { duration: 8, ease: 'easeInOut', repeat: Infinity },
          }}
          style={{
            position: 'absolute',
            top: '12%',
            right: '8%',
            width: '130px',
            height: '130px',
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 0.45)) drop-shadow(0 0 50px rgba(6, 182, 212, 0.25))',
            opacity: 0.85,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* 3D Wireframe Icosahedron / Crystal Prism */}
            <polygon
              points="50,5 90,30 50,55 10,30"
              stroke="#34D399"
              strokeWidth="1.2"
              fill="rgba(16, 185, 129, 0.08)"
            />
            <polygon
              points="50,55 90,30 85,75 50,95"
              stroke="#10B981"
              strokeWidth="1.2"
              fill="rgba(5, 150, 105, 0.12)"
            />
            <polygon
              points="50,55 10,30 15,75 50,95"
              stroke="#06B6D4"
              strokeWidth="1.2"
              fill="rgba(6, 182, 212, 0.09)"
            />
            <line x1="50" y1="5" x2="50" y2="55" stroke="#6EE7B7" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50" y1="55" x2="50" y2="95" stroke="#34D399" strokeWidth="1.5" />
            <circle cx="50" cy="5" r="2.5" fill="#6EE7B7" filter="drop-shadow(0 0 6px #6EE7B7)" />
            <circle cx="90" cy="30" r="2" fill="#34D399" />
            <circle cx="10" cy="30" r="2" fill="#34D399" />
            <circle cx="50" cy="55" r="3" fill="#10B981" filter="drop-shadow(0 0 8px #10B981)" />
            <circle cx="85" cy="75" r="2" fill="#06B6D4" />
            <circle cx="15" cy="75" r="2" fill="#06B6D4" />
            <circle cx="50" cy="95" r="2.5" fill="#34D399" />
          </svg>
        </motion.div>

        {/* 3D Celestial Gyroscope / Orbital Ring Astrolabe (Top-Left / Center-Left) */}
        <div
          className="bg-3d-gyro"
          style={{
            position: 'absolute',
            top: '24%',
            left: '5%',
            width: '160px',
            height: '160px',
            transformStyle: 'preserve-3d',
            perspective: '800px',
            opacity: 0.75,
            filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.35))',
          }}
        >
          {/* Outer Ring */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotateX: [0, 360],
                    rotateY: [0, 180],
                  }
            }
            transition={{
              rotateX: { duration: 22, ease: 'linear', repeat: Infinity },
              rotateY: { duration: 28, ease: 'linear', repeat: Infinity },
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1.5px dashed rgba(52, 211, 153, 0.55)',
              transformStyle: 'preserve-3d',
            }}
          />
          {/* Middle Ring */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotateX: [0, -360],
                    rotateZ: [0, 360],
                  }
            }
            transition={{
              rotateX: { duration: 18, ease: 'linear', repeat: Infinity },
              rotateZ: { duration: 24, ease: 'linear', repeat: Infinity },
            }}
            style={{
              position: 'absolute',
              inset: '16px',
              borderRadius: '50%',
              border: '1.2px solid rgba(6, 182, 212, 0.5)',
              borderTopColor: '#34D399',
              borderBottomColor: 'transparent',
              transformStyle: 'preserve-3d',
            }}
          />
          {/* Inner Glowing Crystal Core */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [0.85, 1.25, 0.85],
                    opacity: [0.6, 1, 0.6],
                  }
            }
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #6EE7B7 0%, #10B981 60%, transparent 100%)',
              boxShadow: '0 0 16px #34D399, 0 0 32px rgba(16, 185, 129, 0.8)',
            }}
          />
        </div>

        {/* 3D Floating Diamond Node (Bottom-Left) */}
        <motion.div
          className="bg-3d-diamond"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotateY: [0, 360],
                  rotateZ: [-10, 10, -10],
                  y: [0, -18, 0],
                }
          }
          transition={{
            rotateY: { duration: 24, ease: 'linear', repeat: Infinity },
            rotateZ: { duration: 9, ease: 'easeInOut', repeat: Infinity },
            y: { duration: 7, ease: 'easeInOut', repeat: Infinity },
          }}
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '12%',
            width: '90px',
            height: '90px',
            transformStyle: 'preserve-3d',
            opacity: 0.7,
            filter: 'drop-shadow(0 0 18px rgba(16, 185, 129, 0.35))',
          }}
        >
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="40,6 74,40 40,74 6,40" stroke="#34D399" strokeWidth="1.2" fill="rgba(16, 185, 129, 0.08)" />
            <polygon points="40,20 60,40 40,60 20,40" stroke="#06B6D4" strokeWidth="1" fill="rgba(6, 182, 212, 0.12)" />
            <line x1="40" y1="6" x2="40" y2="74" stroke="#6EE7B7" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="6" y1="40" x2="74" y2="40" stroke="#6EE7B7" strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx="40" cy="40" r="3.5" fill="#34D399" filter="drop-shadow(0 0 6px #34D399)" />
          </svg>
        </motion.div>

        {/* 3D Floating Hexagonal Shield Node (Bottom-Right) */}
        <motion.div
          className="bg-3d-shield"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotateX: [0, -360],
                  rotateZ: [0, 180],
                  y: [0, 15, 0],
                }
          }
          transition={{
            rotateX: { duration: 28, ease: 'linear', repeat: Infinity },
            rotateZ: { duration: 34, ease: 'linear', repeat: Infinity },
            y: { duration: 8.5, ease: 'easeInOut', repeat: Infinity },
          }}
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '9%',
            width: '100px',
            height: '100px',
            transformStyle: 'preserve-3d',
            opacity: 0.65,
            filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.3))',
          }}
        >
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="40,8 70,24 70,56 40,72 10,56 10,24" stroke="#10B981" strokeWidth="1.2" fill="rgba(5, 150, 105, 0.08)" />
            <polygon points="40,20 60,32 60,48 40,60 20,48 20,32" stroke="#6EE7B7" strokeWidth="1" strokeDasharray="2 2" fill="rgba(52, 211, 153, 0.06)" />
            <circle cx="40" cy="8" r="2" fill="#34D399" />
            <circle cx="70" cy="24" r="2" fill="#34D399" />
            <circle cx="70" cy="56" r="2" fill="#06B6D4" />
            <circle cx="40" cy="72" r="2" fill="#10B981" />
            <circle cx="10" cy="56" r="2" fill="#06B6D4" />
            <circle cx="10" cy="24" r="2" fill="#34D399" />
          </svg>
        </motion.div>
      </motion.div>

      {/* 6. Foreground 3D Floating Magic Stardust & Constellations */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          x: shouldReduceMotion ? 0 : foregroundX,
          y: shouldReduceMotion ? 0 : foregroundY,
          rotateX: shouldReduceMotion ? 0 : foregroundRotateX,
          rotateY: shouldReduceMotion ? 0 : foregroundRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Constellation Link Vectors */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.35,
          }}
        >
          <line x1="8%" y1="15%" x2="22%" y2="38%" stroke="rgba(52, 211, 153, 0.28)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="22%" y1="38%" x2="35%" y2="22%" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.8" />
          <line x1="55%" y1="12%" x2="68%" y2="45%" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="68%" y1="45%" x2="78%" y2="18%" stroke="rgba(52, 211, 153, 0.22)" strokeWidth="0.8" />
          <line x1="78%" y1="18%" x2="92%" y2="30%" stroke="rgba(110, 231, 183, 0.28)" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="14%" y1="72%" x2="28%" y2="58%" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="0.8" />
          <line x1="62%" y1="78%" x2="88%" y2="64%" stroke="rgba(16, 185, 129, 0.24)" strokeWidth="0.8" strokeDasharray="3 3" />
        </svg>

        {/* 20 Magic Twinkling Stardust Nodes */}
        {SEEDED_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -18 * p.depth, 0, 12 * p.depth, 0],
                    x: [0, 8 * p.depth, -6 * p.depth, 0],
                    opacity: [0.3, 0.95, 0.4, 1, 0.3],
                    scale: [0.85, 1.4, 0.9, 1.25, 0.85],
                  }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.glowColor,
              boxShadow: `0 0 ${p.size * 3}px ${p.glowColor}, 0 0 ${p.size * 6}px ${p.glowColor}`,
              transform: `translateZ(${p.depth * 40}px)`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </motion.div>

      {/* 7. Flowing Cyber Laser Beams */}
      <div className="laser-beam-h" />
      <div className="laser-beam-v" />

      {/* 8. Authentic Cinematic Film Grain Noise Texture */}
      <div className="film-grain-layer" />

      {/* 9. Soft Camera Edge Vignette */}
      <div className="ambient-vignette" />
    </div>
  );
}

export default AnimatedBackground;

