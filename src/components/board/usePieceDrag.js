import { useState, useEffect, useRef } from 'react';

export function usePieceDrag({
  boardRef,
  perspectiveRotation = 0,
  zoomLevel = 1,
  selectedPieceLoc = '',
  validDestinations = [],
  onPieceClick = null,
  onDestinationClick = null,
  disabled = false
}) {
  const [dragState, setDragState] = useState(null);
  const dragRef = useRef(null);
  const suppressClickUntilRef = useRef(0);

  const latestRef = useRef({
    perspectiveRotation,
    zoomLevel,
    selectedPieceLoc,
    validDestinations,
    onPieceClick,
    onDestinationClick
  });
  latestRef.current = {
    perspectiveRotation,
    zoomLevel,
    selectedPieceLoc,
    validDestinations,
    onPieceClick,
    onDestinationClick
  };

  const clientToBoardPct = (clientX, clientY) => {
    const el = boardRef.current;
    if (!el) return { left: '50%', top: '50%' };
    const { perspectiveRotation: rot, zoomLevel: zoom } = latestRef.current;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const rad = (-rot * Math.PI) / 180;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
    const w = (el.offsetWidth || rect.width) * (zoom || 1);
    const h = (el.offsetHeight || rect.height) * (zoom || 1);
    return {
      left: `${50 + (rx / (w || 1)) * 100}%`,
      top: `${50 + (ry / (h || 1)) * 100}%`
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      const cur = dragRef.current;
      if (!cur) return;

      const dist = Math.hypot(e.clientX - cur.startX, e.clientY - cur.startY);
      if (!cur.isDragging && dist < 6) return;

      if (!cur.isDragging) {
        cur.isDragging = true;
        const { selectedPieceLoc: sel, onPieceClick: pick } = latestRef.current;
        if (sel !== cur.locKey && pick) {
          pick(cur.locKey);
        }
      }

      const pos = clientToBoardPct(e.clientX, e.clientY);
      cur.left = pos.left;
      cur.top = pos.top;
      setDragState({ ...cur });
    };

    const handlePointerUp = (e) => {
      const cur = dragRef.current;
      if (!cur) return;
      dragRef.current = null;

      if (cur.isDragging) {
        suppressClickUntilRef.current = performance.now() + 250;
        const root = boardRef.current?.getRootNode?.() || document;
        const hits = typeof root.elementsFromPoint === 'function'
          ? root.elementsFromPoint(e.clientX, e.clientY)
          : [];
        const { validDestinations: targets, onDestinationClick: drop } = latestRef.current;

        for (const el of hits) {
          const dropEl = el.closest?.('[data-drop-loc]');
          const dropLoc = dropEl?.getAttribute('data-drop-loc');
          if (dropLoc && targets.includes(dropLoc) && drop) {
            drop(dropLoc);
            break;
          }
        }
      }
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [boardRef]);

  const startPieceDrag = (e, locKey, piece) => {
    if (disabled || !piece || (e.button !== undefined && e.button !== 0)) return;
    const pos = clientToBoardPct(e.clientX, e.clientY);
    dragRef.current = {
      locKey,
      piece,
      startX: e.clientX,
      startY: e.clientY,
      left: pos.left,
      top: pos.top,
      isDragging: false
    };
  };

  const shouldSuppressClick = () => performance.now() < suppressClickUntilRef.current;

  return {
    draggedPiece: dragState?.isDragging ? dragState : null,
    startPieceDrag,
    shouldSuppressClick
  };
}
