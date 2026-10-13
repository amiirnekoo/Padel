import { useRef, useCallback, useEffect } from 'react';

/**
 * 🖱️ useDragScroll
 * Enables ultra-smooth 1:1 horizontal click-and-drag (Grab-to-Scroll) for track containers.
 * - Uses window-level event listeners during active drag so dragging never stutters when mouse leaves the element.
 * - Pure 1:1 direct tracking (instant movement with zero delay).
 * - Disables CSS scroll-behavior during drag for instantaneous response.
 * - Prevents accidental item clicks when a drag gesture was made.
 * - Does NOT intercept mouse wheel events, preserving natural page vertical scrolling.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T | null>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const momentumRafRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    // Only respond to main left click
    if (e.button !== 0) return;

    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }

    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    scrollLeftRef.current = el.scrollLeft;
    velocityRef.current = 0;

    // Immediate responsiveness with zero CSS transition lag during active drag
    el.style.scrollBehavior = 'auto';
    el.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDownRef.current) return;
      const currentEl = containerRef.current;
      if (!currentEl) return;

      const deltaX = moveEvent.clientX - startXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasDraggedRef.current = true;
      }

      const instantDelta = moveEvent.clientX - lastXRef.current;
      velocityRef.current = instantDelta;
      lastXRef.current = moveEvent.clientX;

      // Natural drag direction: pulling left moves track smoothly, with 1.45x velocity multiplier for crisp responsiveness
      const SPEED_MULTIPLIER = 1.45;
      currentEl.scrollLeft = scrollLeftRef.current - (deltaX * SPEED_MULTIPLIER);
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const currentEl = containerRef.current;
      if (currentEl) {
        currentEl.style.cursor = 'grab';

        // Gentle momentum inertia when released with speed
        let vel = velocityRef.current * 1.45;
        if (Math.abs(vel) > 3) {
          const glide = () => {
            if (!currentEl) return;
            vel *= 0.88;
            currentEl.scrollLeft -= vel;
            if (Math.abs(vel) > 0.5) {
              momentumRafRef.current = requestAnimationFrame(glide);
            }
          };
          momentumRafRef.current = requestAnimationFrame(glide);
        }

        // Restore smooth scrolling after drag finishes for programmatic navigation
        setTimeout(() => {
          if (currentEl) {
            currentEl.style.scrollBehavior = '';
          }
        }, 50);
      }
      document.body.style.removeProperty('user-select');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Optional horizontal wheel scrolling when hovered over horizontal tracks
  const onWheel = useCallback((e: React.WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;

    // If already scrolling horizontally via trackpad or shift-scroll, let browser handle naturally
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    // Convert vertical wheel to horizontal track scroll
    if (Math.abs(e.deltaY) > 5) {
      const isRtl = window.getComputedStyle(el).direction === 'rtl';
      const scrollAmount = e.deltaY * 1.2;
      el.scrollLeft += isRtl ? -scrollAmount : scrollAmount;
    }
  }, []);

  const scrollStep = useCallback((direction: 'left' | 'right', stepPx = 300) => {
    const el = containerRef.current;
    if (!el) return;
    const isRtl = window.getComputedStyle(el).direction === 'rtl';
    const delta = direction === 'left' ? -stepPx : stepPx;
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (momentumRafRef.current) {
        cancelAnimationFrame(momentumRafRef.current);
      }
      document.body.style.removeProperty('user-select');
    };
  }, []);

  return {
    containerRef,
    hasDraggedRef,
    scrollStep,
    dragProps: {
      onMouseDown,
      onWheel,
    },
  };
}
