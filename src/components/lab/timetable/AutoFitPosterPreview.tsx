import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AutoFitPosterPreviewProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: number | string;
  fitHeight?: boolean;
  padding?: number;
  maxScale?: number;
  minScale?: number;
}

/**
 * AutoFitPosterPreview
 * 
 * Ensures the 480px fixed-width timetable poster card ALWAYS fits perfectly
 * inside any preview container (desktop columns, tablets, mobile screens)
 * without clipping, overflowing, or requiring horizontal scrolling.
 */
export const AutoFitPosterPreview: React.FC<AutoFitPosterPreviewProps> = ({
  children,
  className = '',
  maxHeight,
  fitHeight = false,
  padding = 8,
  maxScale = 1.0,
  minScale = 0.2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [naturalHeight, setNaturalHeight] = useState<number>(720);
  const [isReady, setIsReady] = useState<boolean>(false);

  const calculateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the inner poster card element
    const cardEl = container.querySelector<HTMLElement>(
      '[data-poster-card="true"], #timetable-poster-card, [id*="poster-card"]'
    );

    const cardBaseWidth = 480;
    let cardHeight = 720;

    if (cardEl && cardEl.offsetHeight > 0) {
      cardHeight = cardEl.offsetHeight;
      setNaturalHeight(cardHeight);
    }

    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;

    const availableWidth = Math.max(containerWidth - (padding * 2), 60);
    let targetScale = availableWidth / cardBaseWidth;

    // If height constraint is specified (e.g. viewport fitting on desktop)
    if (fitHeight || maxHeight) {
      let availableHeight = 0;
      if (typeof maxHeight === 'number') {
        availableHeight = maxHeight - (padding * 2);
      } else if (container.clientHeight > 0) {
        availableHeight = container.clientHeight - (padding * 2);
      }

      if (availableHeight > 60 && cardHeight > 0) {
        const heightScale = availableHeight / cardHeight;
        targetScale = Math.min(targetScale, heightScale);
      }
    }

    // Apply limits: cap at maxScale so high-DPI desktop view stays razor-sharp
    targetScale = Math.min(targetScale, maxScale);
    targetScale = Math.max(targetScale, minScale);

    setScale(targetScale);
    setIsReady(true);
  }, [fitHeight, maxHeight, padding, maxScale, minScale]);

  useEffect(() => {
    calculateScale();

    const container = containerRef.current;
    if (!container) return;

    // Observe container size changes
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(calculateScale);
    });

    resizeObserver.observe(container);

    // Observe card content size changes (e.g., adding/removing subjects, notes)
    const cardEl = container.querySelector<HTMLElement>(
      '[data-poster-card="true"], #timetable-poster-card, [id*="poster-card"]'
    );
    if (cardEl) {
      resizeObserver.observe(cardEl);
    }

    // Window resize fallback
    window.addEventListener('resize', calculateScale);

    // Document font ready fallback (web fonts alter card height)
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(calculateScale).catch(() => {});
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [calculateScale, children]);

  const scaledWidth = Math.round(480 * scale);
  const scaledHeight = Math.round(naturalHeight * scale);

  return (
    <div
      ref={containerRef}
      className={`w-full flex items-center justify-center overflow-hidden transition-opacity duration-150 ${
        isReady ? 'opacity-100' : 'opacity-95'
      } ${className}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.1s ease-out, height 0.1s ease-out'
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '480px',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
