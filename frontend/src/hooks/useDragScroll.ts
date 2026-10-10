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

      // 1:1 direct instant tracking
      currentEl.scrollLeft = scrollLeftRef.current - deltaX;
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.removeProperty('user-select');
    };
  }, []);

  return {
    containerRef,
    hasDraggedRef,
    dragProps: {
      onMouseDown,
    },
  };
}
