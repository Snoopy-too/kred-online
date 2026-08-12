import React from 'react';

export function BoardZoomControls({ zoomLevel, setZoomLevel }) {
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 2.2;
  const STEP = 0.01;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, parseFloat((prev + STEP).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, parseFloat((prev - STEP).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
  };

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <div className="board-zoom-container">
      <div className="board-zoom-controls" title="Board Area Zoom">
        <span className="zoom-label">🔍 ZOOM</span>
        <button
          type="button"
          className="zoom-btn"
          onClick={handleZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
          title="Zoom Out board area"
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
          onClick={handleZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
          title="Zoom In board area"
        >
          +
        </button>
      </div>
      {zoomLevel !== 1.0 && (
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
