import React from 'react';
import { getCredibilityIconUrl } from '../../utils/assets.js';

export function CalibrationSpotOverlay({
  locKey,
  coords,
  currentTransform,
  selectedCalibrateKeys,
  setSelectedCalibrateKeys,
  handleBoardMouseDown,
  handleRotateSelectedSpots,
  perspectiveRotation,
  zoomLevel,
  showSpotLabels,
  counterRotationStyle,
  getShortLabel
}) {
  let dotColor = 'red';
  if (locKey.includes('_office')) dotColor = 'gold';
  else if (locKey.includes('_rostrum')) dotColor = 'brown';
  else if (locKey.includes('_seat')) dotColor = 'green';
  else if (locKey.includes('_bank')) dotColor = 'blue';
  else if (locKey.includes('_dropTile')) dotColor = 'orange';
  else if (locKey.includes('_cred')) dotColor = '#06b6d4';
  else if (locKey === 'community_target') dotColor = '#22c55e';
  else if (locKey.startsWith('community_')) dotColor = '#a855f7';

  const shortLabel = getShortLabel(locKey);
  const isTileSpot = locKey.includes('_bank') || locKey.includes('_dropTile');
  const isCredSpot = locKey.includes('_cred');
  const isSelected = selectedCalibrateKeys.includes(locKey);

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isAlreadySelected = selectedCalibrateKeys.includes(locKey);
    const targetKeys = isAlreadySelected ? selectedCalibrateKeys : [locKey];
    if (!isAlreadySelected) {
      setSelectedCalibrateKeys([locKey]);
    }
    const delta = e.deltaY < 0 ? 1 : -1;
    handleRotateSelectedSpots(delta, targetKeys);
  };

  return (
    <React.Fragment>
      {isTileSpot && (
        <div
          className={`domino-tile-container domino-tile-placeholder ${isSelected ? 'selected-tile' : ''}`}
          style={{
            left: coords.left,
            top: coords.top,
            transform: currentTransform,
            zIndex: 999,
            transition: 'none'
          }}
          onMouseDown={(e) => handleBoardMouseDown(e, locKey, coords.left, coords.top, perspectiveRotation, zoomLevel)}
          onWheel={handleWheel}
          title={`${locKey} - Click to select, drag to move, scroll wheel to rotate`}
        />
      )}

      {isCredSpot && (
        <div
          className={`cred-token-container cred-token-placeholder ${isSelected ? 'selected-cred' : ''}`}
          style={{
            left: coords.left,
            top: coords.top,
            transform: currentTransform,
            zIndex: 999,
            transition: 'none'
          }}
          onMouseDown={(e) => handleBoardMouseDown(e, locKey, coords.left, coords.top, perspectiveRotation, zoomLevel)}
          onWheel={handleWheel}
          title={`${locKey} - Click to select, drag to move, scroll wheel to rotate`}
        >
          <img
            src={getCredibilityIconUrl(3)}
            alt="Cred Token Preview"
            className="cred-token-img"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
            draggable={false}
          />
        </div>
      )}

      <div
        onMouseDown={(isTileSpot || isCredSpot) ? undefined : (e) => handleBoardMouseDown(e, locKey, coords.left, coords.top, perspectiveRotation, zoomLevel)}
        style={{
          position: 'absolute',
          left: coords.left,
          top: coords.top,
          width: '16px',
          height: '16px',
          backgroundColor: isSelected ? '#ff9800' : dotColor,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          cursor: (isTileSpot || isCredSpot) ? 'default' : 'grab',
          zIndex: 1000,
          border: isSelected ? '3px solid #ffffff' : '2px solid white',
          boxShadow: isSelected ? '0 0 10px #ff9800' : 'none',
          pointerEvents: (isTileSpot || isCredSpot) ? 'none' : 'auto',
          transition: 'none'
        }}
        title={locKey}
      >
        {showSpotLabels && (
          <span
            style={{
              position: 'absolute',
              top: '-15px',
              left: '15px',
              background: 'rgba(0,0,0,0.75)',
              color: isSelected ? '#ff9800' : 'white',
              fontSize: '10px',
              padding: '2px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              fontWeight: isSelected ? 'bold' : 'normal',
              ...counterRotationStyle
            }}
          >
            {shortLabel}
          </span>
        )}
      </div>
    </React.Fragment>
  );
}
