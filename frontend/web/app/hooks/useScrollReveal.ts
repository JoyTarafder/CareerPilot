'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Applies `.revealed` class to elements with `.scroll-reveal`,
 * `.scroll-reveal-left`, or `.scroll-reveal-scale` when they enter the viewport.
 *
 * Usage: call `useScrollReveal()` once in a page component.
 * Optionally pass a `containerRef` to scope observation to a specific subtree.
 */
export function useScrollReveal(containerRef?: React.RefObject<HTMLElement | null>) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observerRef.current?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const root = containerRef?.current ?? document;
    const targets = root.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-scale'
    );

    targets.forEach((el) => observerRef.current?.observe(el));
  }, [containerRef]);

  useEffect(() => {
    /* Small delay to allow DOM to settle after React hydration */
    const timer = setTimeout(setupObserver, 60);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [setupObserver]);
}
