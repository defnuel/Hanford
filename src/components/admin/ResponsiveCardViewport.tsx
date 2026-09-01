import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ResponsiveCardViewportProps {
  children: React.ReactNode;
  nativeWidth?: number;
  className?: string;
}

/**
 * ResponsiveCardViewport automatically scales fixed-width luxury cards (e.g. 960px)
 * to perfectly fit mobile and tablet screens without squishing, breaking text,
 * or causing messy column overlapping.
 */
export const ResponsiveCardViewport: React.FC<ResponsiveCardViewportProps> = ({
  children,
  nativeWidth = 960,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'fit' | 'full'>('fit');

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || !contentRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const originalHeight = contentRef.current.scrollHeight || contentRef.current.offsetHeight || 600;
      setContentHeight(originalHeight);

      if (viewMode === 'fit') {
        const availableWidth = Math.max(containerWidth - 8, 280);
        const calculatedScale = Math.min(1, availableWidth / nativeWidth);
        setScale(calculatedScale);
      } else {
        setScale(1);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [nativeWidth, viewMode]);

  const scaledHeight = contentHeight > 0 ? contentHeight * scale : 'auto';

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Mobile-Friendly Zoom & View Controls */}
      <div className="w-full flex items-center justify-between px-2 pb-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Scale:</span>
          <span className="px-2 py-0.5 bg-slate-200/80 rounded-md font-mono text-[10px] text-slate-700 font-bold">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('fit')}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'fit'
                ? 'bg-white text-[#51867E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Auto Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit Screen</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'full'
                ? 'bg-white text-[#51867E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="100% Original Size (Scrollable)"
          >
            <ZoomIn className="w-3 h-3" />
            <span>100% (Scroll)</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center items-start ${
          viewMode === 'full' ? 'overflow-x-auto pb-4' : 'overflow-hidden'
        }`}
        style={{
          height: viewMode === 'fit' && typeof scaledHeight === 'number' ? `${scaledHeight + 12}px` : 'auto',
          transition: 'height 0.2s ease-out',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${nativeWidth}px`,
            minWidth: `${nativeWidth}px`,
            maxWidth: `${nativeWidth}px`,
            transform: viewMode === 'fit' && scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shrink-0"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
