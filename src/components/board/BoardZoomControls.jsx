import React, { useRef, useEffect } from 'react';

export function BoardZoomControls({ zoomLevel, setZoomLevel, style }) {
  const MIN_ZOOM = 0.45;
  const MAX_ZOOM = 1.65;
  const STEP = 0.01;
  const DEFAULT_ZOOM = 0.75;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, parseFloat((prev + STEP).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, parseFloat((prev - STEP).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoomLevel(DEFAULT_ZOOM);
  };

  const timerRef = useRef({ timeout: null, interval: null });

  useEffect(() => {
    return () => {
      if (timerRef.current.timeout) clearTimeout(timerRef.current.timeout);
      if (timerRef.current.interval) clearInterval(timerRef.current.interval);
    };
  }, []);

  const startZooming = (direction) => {
    const zoomFn = direction === 'in' ? handleZoomIn : handleZoomOut;
    zoomFn();

    timerRef.current.timeout = setTimeout(() => {
      timerRef.current.interval = setInterval(() => {
        zoomFn();
      }, 40);
    }, 250);
  };

  const stopZooming = () => {
    if (timerRef.current.timeout) {
      clearTimeout(timerRef.current.timeout);
      timerRef.current.timeout = null;
    }
    if (timerRef.current.interval) {
      clearInterval(timerRef.current.interval);
      timerRef.current.interval = null;
    }
  };

  const zoomPercent = Math.round((zoomLevel / DEFAULT_ZOOM) * 100);

  return (
    <div className="board-zoom-container" style={style}>
      <div className="board-zoom-controls" title="Board Area Zoom">
        <span className="zoom-label">🔍 ZOOM</span>
        <button
          type="button"
          className="zoom-btn"
          disabled={zoomLevel <= MIN_ZOOM}
          title="Zoom Out board area"
          onMouseDown={() => startZooming('out')}
          onMouseUp={stopZooming}
          onMouseLeave={stopZooming}
          onTouchStart={(e) => { e.preventDefault(); startZooming('out'); }}
          onTouchEnd={stopZooming}
        >
          −
        </button>
        <span
          className="zoom-percentage-badge"
          onClick={handleZoomReset}
          title="Click to reset zoom to 100%"
        >
          {zoomPercent}%
        </span>
        <button
          type="button"
          className="zoom-btn"
          disabled={zoomLevel >= MAX_ZOOM}
          title="Zoom In board area"
          onMouseDown={() => startZooming('in')}
          onMouseUp={stopZooming}
          onMouseLeave={stopZooming}
          onTouchStart={(e) => { e.preventDefault(); startZooming('in'); }}
          onTouchEnd={stopZooming}
        >
          +
        </button>
      </div>
      {zoomLevel !== DEFAULT_ZOOM && (
        <button
          type="button"
          className="zoom-reset-btn"
          onClick={handleZoomReset}
          title="Reset zoom to 100%"
        >
          ↺ Reset
        </button>
      )}
    </div>
  );
}
