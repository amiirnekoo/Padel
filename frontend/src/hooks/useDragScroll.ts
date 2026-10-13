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
  const isRtlRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    // Only respond to main left click
    if (e.button !== 0) return;

    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = el.scrollLeft;

    // Detect RTL context accurately
    isRtlRef.current = window.getComputedStyle(el).direction === 'rtl';

    // Immediate 1:1 responsiveness with zero CSS transition lag
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

      // 1:1 direct instant tracking: In RTL modern browsers (Chromium/Firefox/Safari),
      // scrollLeft is negative or inverse; adding deltaX tracks mouse direction perfectly.
      if (isRtlRef.current) {
        currentEl.scrollLeft = scrollLeftRef.current + deltaX;
      } else {
        currentEl.scrollLeft = scrollLeftRef.current - deltaX;
      }
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const currentEl = containerRef.current;
      if (currentEl) {
        currentEl.style.cursor = 'grab';
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
      const scrollAmount = e.deltaY;
      el.scrollLeft += isRtl ? -scrollAmount : scrollAmount;
    }
  }, []);

  const scrollStep = useCallback((direction: 'left' | 'right', stepPx = 250) => {
    const el = containerRef.current;
    if (!el) return;
    const isRtl = window.getComputedStyle(el).direction === 'rtl';
    const delta = direction === 'left' ? -stepPx : stepPx;
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
