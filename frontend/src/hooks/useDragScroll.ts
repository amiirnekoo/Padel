import { useRef, useCallback, useState } from 'react';

/**
 * 🖱️ useDragScroll
 * Enables freeform horizontal click-and-drag (Grab-to-Scroll) for track containers.
 * Prevents accidental image selection when dragging, prevents browser ghost image drag,
 * and handles smooth mouse wheel horizontal scrolling.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    
    // Temporarily disable CSS smooth scrolling during active drag for 1:1 responsive feel
    el.classList.remove('scroll-smooth');
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.4; // 1.4x speed for satisfying glide

    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }

    el.scrollLeft = scrollLeftRef.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDownRef.current = false;
    setIsDragging(false);
    const el = containerRef.current;
    if (el) {
      // Re-enable smooth scrolling after drag finishes
      setTimeout(() => {
        el.classList.add('scroll-smooth');
      }, 50);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isDownRef.current) {
      isDownRef.current = false;
      setIsDragging(false);
      const el = containerRef.current;
      if (el) {
        setTimeout(() => {
          el.classList.add('scroll-smooth');
        }, 50);
      }
    }
  }, []);

  // Handle horizontal mouse wheel rolling
  const onWheel = useCallback((e: React.WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
    }
  }, []);

  return {
    containerRef,
    isDragging,
    hasDraggedRef,
    dragProps: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onWheel,
    },
  };
}
