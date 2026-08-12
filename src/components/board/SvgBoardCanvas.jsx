import React from 'react';
import { PIECE_TYPES, INITIAL_PIECE_COUNTS } from '../../domain/types.js';
import { getPerspectiveTransform } from './perspectiveUtils.js';
import { isCommunityPieceAvailable } from '../../domain/moves.js';

export function SvgBoardCanvas({
  activeBoardImage,
  numPlayers,
  activeHotspots,
  calibrationMode,
  selectedCalibrateKeys,
  setSelectedCalibrateKeys,
  handleBoardMouseMove,
  handleBoardMouseUp,
  handleBoardMouseDown,
  handleRotateSelectedSpots,
  handleSpaceClick,
  selectedFrom,
  selectedTo,
  G,
  showSpotLabels = true,
  perspectiveRotation = 0,
  playerID = 0,
  perspectiveOffsets = {},
  selectedReceiverId = '',
  selectedTileId = '',
  onSelectReceiver = null,
  canSelfPlay = true,
  validDestinations = [],
  selectedPieceLoc = '',
  stagedMoves = [],
  onPieceClick = null,
  onDestinationClick = null,
  transientBoardState = null,
  zoomLevel = 1,
  peekPendingTile = false,
  onTogglePeekTile = null,
  validPromotionSpots = [],
  getPlayerLabel = null
}) {
  const counterRotationStyle = perspectiveRotation ? { transform: `rotate(${-perspectiveRotation}deg)` } : {};
  const transformStyle = getPerspectiveTransform(numPlayers, playerID, perspectiveOffsets, 1);
  const currentBoardState = transientBoardState || (G && G.boardState) || {};

  const getShortLabel = (locKey) => {
    if (locKey === 'community_target') return 'COM TARGET';
    if (locKey.startsWith('community_')) return `COM${locKey.replace('community_', '')}`;
    const [p, typePart] = locKey.split('_');
    const pNum = p.match(/^p(\d+)$/i)?.[1] || p;
    const labels = { office: 'OF', rostrum1: 'R1', rostrum2: 'R2', dropTile: 'DR', cred: 'CR' };
    const typeLabel = labels[typePart] || (typePart?.startsWith('seat') ? typePart.replace('seat', 'S') : typePart?.startsWith('bank') ? typePart.replace('bank', 'BA') : typePart);
    return `P${pNum} ${typeLabel}`;
  };

  const renderPiece = (piece) => {
    if (!piece) return null;
    let iconSrc = '';
    const isPawn = piece.type === PIECE_TYPES.PAWN;
    if (piece.type === PIECE_TYPES.MARK) iconSrc = '/images/mark-transparent_bg.png';
    if (piece.type === PIECE_TYPES.HEEL) iconSrc = '/images/heel-transparent_bg.png';
    if (isPawn) iconSrc = '/images/pawn-transparent_bg.png';

    return (
      <div className="piece-token-board" style={counterRotationStyle} title={`${piece.type}`}>
        <img src={iconSrc} alt={piece.type} className={`piece-img-board ${isPawn ? 'piece-pawn-img' : ''}`} />
      </div>
    );
  };

  return (
    <div
      className="board-image-overlay-container"
      style={{
        transform: transformStyle,
        transition: 'transform 0.4s ease-in-out'
      }}
      onMouseMove={(e) => handleBoardMouseMove(e, perspectiveRotation, zoomLevel)}
      onMouseUp={handleBoardMouseUp}
      onMouseLeave={handleBoardMouseUp}
      onClick={(e) => {
        if (calibrationMode && e.target.classList.contains('main-board-graphic')) {
          setSelectedCalibrateKeys([]);
        }
      }}
    >
      <img src={activeBoardImage} alt={`${numPlayers}-Player Board`} className="main-board-graphic" />

      {Object.entries(activeHotspots).map(([locKey, coords]) => {
        const currentTransform =
          coords.transform ||
          (coords.rot !== undefined
            ? `translate(-50%, -50%) rotate(${coords.rot}deg) scale(${coords.scale || 1.0})`
            : `translate(-50%, -50%) rotate(0deg) scale(${coords.scale || 1.0})`);

        if (calibrationMode) {
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

          return (
            <React.Fragment key={locKey}>
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
                  onWheel={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isAlreadySelected = selectedCalibrateKeys.includes(locKey);
                    const targetKeys = isAlreadySelected ? selectedCalibrateKeys : [locKey];
                    if (!isAlreadySelected) {
                      setSelectedCalibrateKeys([locKey]);
                    }
                    const delta = e.deltaY < 0 ? 1 : -1;
                    handleRotateSelectedSpots(delta, targetKeys);
                  }}
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
                  onWheel={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isAlreadySelected = selectedCalibrateKeys.includes(locKey);
                    const targetKeys = isAlreadySelected ? selectedCalibrateKeys : [locKey];
                    if (!isAlreadySelected) {
                      setSelectedCalibrateKeys([locKey]);
                    }
                    const delta = e.deltaY < 0 ? 1 : -1;
                    handleRotateSelectedSpots(delta, targetKeys);
                  }}
                  title={`${locKey} - Click to select, drag to move, scroll wheel to rotate`}
                >
                  <img
                    src="/images/3_credibility.svg"
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

        if (locKey === 'community_target') return null;

        if (locKey.endsWith('_cred')) {
          const credMatch = locKey.match(/^p(\d+)_cred$/);
          const domainNum = credMatch ? credMatch[1] : locKey.replace('p', '').replace('_cred', '');
          const targetPlayerId = String(parseInt(domainNum, 10) - 1);
          const notchesLost = G?.players?.[targetPlayerId]?.credibilityNotchesLost || 0;
          const credScore = Math.max(0, 3 - notchesLost);

          return (
            <div
              key={locKey}
              className="cred-token-container"
              style={{
                left: coords.left,
                top: coords.top,
                transform: currentTransform,
                zIndex: 12
              }}
              title={`Player ${domainNum} Credibility: ${credScore}/3`}
            >
              <img
                src={`/images/${credScore}_credibility.svg`}
                alt={`Player ${domainNum} Credibility: ${credScore}`}
                className="cred-token-img"
              />
            </div>
          );
        }

        if (locKey.endsWith('_dropTile')) {
          const dropMatch = locKey.match(/^p(\d+)_dropTile$/);
          const domainNum = dropMatch ? dropMatch[1] : locKey.replace('p', '').replace('_dropTile', '');
          const targetPlayerId = String(parseInt(domainNum, 10) - 1);
          const tilesPerPlayer = (INITIAL_PIECE_COUNTS[numPlayers] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
          const targetBankLength = (G?.players?.[targetPlayerId]?.bank || []).length;
          const bankFull = targetBankLength >= tilesPerPlayer;
          const isSelf = targetPlayerId === String(playerID);
          const selfLocked = isSelf && !canSelfPlay;
          const isReceiverLocked = bankFull || selfLocked;
          const isPendingReceiver = (G && G.pendingPlay && String(G.pendingPlay.receiverId) === String(targetPlayerId));
          const isStagedReceiver = (selectedReceiverId === targetPlayerId);
          const isDropActive = isPendingReceiver || isStagedReceiver;

          const isPendingActive = isPendingReceiver && G?.pendingPlay?.step === 'receipt';
          const isSelfReceiver = isPendingActive && isSelf;
          const isTargetable = Boolean(selectedTileId) && !selectedReceiverId && !isReceiverLocked;

          const pLabel = getPlayerLabel ? getPlayerLabel(targetPlayerId) : `Player ${domainNum}`;

          return (
            <div
              key={locKey}
              className={`domino-tile-container drop-tile-box ${isDropActive ? 'active-drop-target' : ''} ${isTargetable && !isDropActive ? 'selectable-drop-target' : ''} ${isReceiverLocked ? 'self-locked-drop-target' : ''}`}
              style={{
                left: coords.left,
                top: coords.top,
                transform: currentTransform,
                cursor: isReceiverLocked ? 'not-allowed' : (isSelfReceiver || isTargetable) ? 'pointer' : 'default',
                opacity: isReceiverLocked ? 0.4 : 1
              }}
              onClick={() => {
                if (isSelfReceiver && onTogglePeekTile) {
                  onTogglePeekTile();
                  return;
                }
                if (onSelectReceiver && !isReceiverLocked && isTargetable) {
                  onSelectReceiver(targetPlayerId);
                }
              }}
              title={
                isSelfReceiver ? (peekPendingTile ? "Click to flip face-down" : "Click to flip & view tile privately")
                : isStagedReceiver ? `Tile staged for ${pLabel}`
                : bankFull ? `${pLabel}'s bank is full (${targetBankLength}/${tilesPerPlayer} tiles)`
                : selfLocked ? `Cannot play to yourself — opponents with empty bank slots still exist`
                : isTargetable ? `Click to play tile face-down to ${pLabel}`
                : `Drop Zone ${pLabel}`
              }
            >
              {isDropActive ? (
                (isSelfReceiver && peekPendingTile && G?.pendingPlay?.tileIdPlayed) ? (
                  <img
                    src={`/images/${G.pendingPlay.tileIdPlayed}.svg`}
                    alt={G.pendingPlay.tileIdPlayed === 'BLANK' ? '' : `Tile ${G.pendingPlay.tileIdPlayed}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      background: '#ffffff',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <div
                    className="pending-drop-card-white"
                    title={isSelfReceiver ? "Click to flip & view tile privately" : "Tile Played Face-Down"}
                  />
                )
              ) : (
                <span className="drop-tile-label">{pLabel}</span>
              )}
            </div>
          );
        }

        const bankMatch = locKey.match(/^p(\d+)_bank(\d+)$/);
        if (bankMatch || locKey.endsWith('_bank')) {
          const domainNum = bankMatch ? bankMatch[1] : locKey.replace('p', '').replace('_bank', '');
          const targetPlayerId = String(parseInt(domainNum, 10) - 1);
          const slotIdx = bankMatch ? parseInt(bankMatch[2], 10) - 1 : 0;
          const bankTiles = G && G.players && G.players[targetPlayerId]?.bank || [];
          const bTile = bankTiles[slotIdx];

          if (bTile) {
            if (bTile.faceDown) {
              return (
                <div
                  key={locKey}
                  className="domino-tile-container domino-tile-facedown"
                  style={{
                    left: coords.left,
                    top: coords.top,
                    transform: currentTransform,
                    zIndex: 11
                  }}
                  title={`Bank Spot ${slotIdx + 1} (Face-Down)`}
                />
              );
            } else {
              return (
                <div
                  key={locKey}
                  className="domino-tile-container domino-tile-faceup"
                  style={{
                    left: coords.left,
                    top: coords.top,
                    transform: currentTransform,
                    zIndex: 11
                  }}
                  title={`Bank Spot ${slotIdx + 1}: Tile ${bTile.tileId}`}
                >
                  <img
                    src={`/images/${bTile.tileId}.svg`}
                    alt={bTile.tileId === 'BLANK' ? '' : `Tile ${bTile.tileId}`}
                    className="domino-tile-svg"
                  />
                </div>
              );
            }
          }

          return (
            <div
              key={locKey}
              className="domino-tile-container domino-tile-facedown"
              style={{
                left: coords.left,
                top: coords.top,
                transform: currentTransform,
                opacity: 0.15,
                zIndex: 11,
                pointerEvents: 'none'
              }}
            />
          );
        }

        // Regular Board Space (Office / Rostrum / Seat / Community)
        const isSelectedPiece = selectedPieceLoc === locKey;
        const isValidTarget = validDestinations.includes(locKey);
        const isCommunitySpot = locKey === 'community' || locKey.startsWith('community_');
        const piece = currentBoardState[locKey];
        const isLockedCommunityPiece = Boolean(
          locKey.startsWith('community_') &&
          piece &&
          !isCommunityPieceAvailable(piece.type, currentBoardState, G?.community, stagedMoves)
        );
        const hasAlreadyMovedInTurn = Boolean(
          stagedMoves.length === 1 &&
          ((stagedMoves[0].to === locKey) ||
           (piece && stagedMoves[0]?.pieceId && piece.id === stagedMoves[0].pieceId))
        );
        const isPromotionTarget = validPromotionSpots.includes(locKey);
        const isUnclickableOtherPiece = Boolean(
          !isPromotionTarget && (
            isLockedCommunityPiece ||
            hasAlreadyMovedInTurn ||
            (selectedPieceLoc && selectedPieceLoc !== locKey && piece && !isValidTarget)
          )
        );

        const handleHotspotClick = () => {
          if (isUnclickableOtherPiece) return;
          if (isValidTarget && onDestinationClick) {
            onDestinationClick(locKey);
          } else if (onPieceClick) {
            onPieceClick(locKey);
          }
        };

        return (
          <div
            key={locKey}
            className={`board-hotspot ${isSelectedPiece ? 'hotspot-selected-piece' : ''} ${isValidTarget ? 'hotspot-valid-target' : ''} ${isPromotionTarget ? 'hotspot-promotion-target' : ''}`}
            style={{
              left: coords.left,
              top: coords.top,
              pointerEvents: isUnclickableOtherPiece ? 'none' : 'auto',
              opacity: isLockedCommunityPiece ? 0.65 : 1
            }}
            onClick={handleHotspotClick}
            title={
              isPromotionTarget
                ? `Click to promote piece at ${locKey}`
                : hasAlreadyMovedInTurn
                ? 'This piece has already moved in this turn'
                : isLockedCommunityPiece
                ? `${piece.type}s locked until ${piece.type === 'Heel' ? 'Marks' : 'Marks and Heels'} are depleted from Community`
                : isValidTarget
                ? `Click to move piece here (${locKey})`
                : locKey
            }
          >
            {renderPiece(piece)}

            {isPromotionTarget && (
              <div
                className="gold-throbbing-circle"
                style={{
                  transform: perspectiveRotation
                    ? `translate(-50%, -50%) rotate(${-perspectiveRotation}deg)`
                    : 'translate(-50%, -50%)'
                }}
              >
                <div className="gold-circle-pulse" />
              </div>
            )}

            {isValidTarget && !isCommunitySpot && (
              <div
                className="green-throbbing-circle"
                style={{
                  transform: perspectiveRotation
                    ? `translate(-50%, -50%) rotate(${-perspectiveRotation}deg)`
                    : 'translate(-50%, -50%)'
                }}
              >
                <div className="green-circle-pulse" />
              </div>
            )}
          </div>
        );
      })}

      {/* Large Center Community Target overlay when community destination is valid */}
      {(() => {
        const commTargetSpot = validDestinations.find(d => d === 'community' || d.startsWith('community_'));
        if (!commTargetSpot) return null;

        const commTargetCoords = activeHotspots['community_target'] || { left: '50%', top: '50%' };
        const scaleVal = commTargetCoords.scale || 1.0;
        const rotVal = commTargetCoords.rot || 0;

        return (
          <div
            className="large-community-target"
            style={{
              left: commTargetCoords.left,
              top: commTargetCoords.top,
              transform: `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal})`
            }}
            onClick={() => onDestinationClick && onDestinationClick(commTargetSpot)}
            title="Click to move piece to Community"
          >
            <span className="large-community-target-text" style={counterRotationStyle}>
              Move to<br />Community
            </span>
          </div>
        );
      })()}
    </div>
  );
}

