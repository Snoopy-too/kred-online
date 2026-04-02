// KRED Game Socket Handlers
// Handles KRED-specific gameplay events (called after a room selects KRED as the game)

// Helper function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Tile requirements for correction validation (tile ID → required move types)
const TILE_REQUIREMENTS = {
  '01': ['REMOVE', 'ADVANCE'],
  '02': ['REMOVE', 'ADVANCE'],
  '03': ['INFLUENCE', 'ADVANCE'],
  '04': ['INFLUENCE', 'ADVANCE'],
  '05': ['ADVANCE'],
  '06': ['ADVANCE'],
  '07': ['ASSIST', 'ADVANCE'],
  '08': ['ASSIST', 'ADVANCE'],
  '09': ['REMOVE', 'ORGANIZE'],
  '10': ['REMOVE', 'ORGANIZE'],
  '11': ['INFLUENCE'],
  '12': ['ORGANIZE'],
  '13': ['ASSIST', 'ORGANIZE'],
  '14': ['ASSIST', 'ORGANIZE'],
  '15': ['REMOVE'],
  '16': ['REMOVE'],
  '17': ['INFLUENCE', 'WITHDRAW'],
  '18': ['INFLUENCE', 'WITHDRAW'],
  '19': ['WITHDRAW'],
  '20': ['WITHDRAW'],
  '21': ['WITHDRAW'],
  '22': ['ASSIST', 'WITHDRAW'],
  '23': ['ASSIST', 'WITHDRAW'],
  '24': ['ASSIST', 'WITHDRAW'],
  'BLANK': [],
};

// Get tile ID string from tile object (e.g. { id: 19 } → '19')
function getTileIdFromTile(tile) {
  if (!tile) return null;
  if (tile.id === 25) return 'BLANK';
  return String(tile.id).padStart(2, '0');
}

// Determine the move type from source/destination locations
function determineMoveTypeServer(fromLocationId, toLocationId, playerId) {
  if (!fromLocationId || !toLocationId) return null;

  // REMOVE: opponent's seat → community
  if (fromLocationId.includes('_seat') &&
      !fromLocationId.includes(`p${playerId}_`) &&
      toLocationId.includes('community')) {
    return 'REMOVE';
  }

  // INFLUENCE:
  // A) opponent's rostrum → any rostrum (own or other opponent's)
  // B) opponent's seat → any other seat (own or opponent's)
  if (fromLocationId.includes('_rostrum') &&
      !fromLocationId.includes(`p${playerId}_`) &&
      toLocationId.includes('_rostrum')) {
    return 'INFLUENCE';
  }
  if (fromLocationId.includes('_seat') &&
      !fromLocationId.includes(`p${playerId}_`) &&
      toLocationId.includes('_seat')) {
    return 'INFLUENCE';
  }

  // ASSIST: community → opponent's seat
  if (fromLocationId.includes('community') &&
      toLocationId.includes('_seat') &&
      !toLocationId.includes(`p${playerId}_`)) {
    return 'ASSIST';
  }

  // ADVANCE: community→own seat, own seat→own rostrum, own rostrum1→own office
  if ((fromLocationId.includes('community') && toLocationId.includes(`p${playerId}_seat`)) ||
      (fromLocationId.includes(`p${playerId}_seat`) && toLocationId.includes(`p${playerId}_rostrum`)) ||
      (fromLocationId === `p${playerId}_rostrum1` && toLocationId === `p${playerId}_office`)) {
    return 'ADVANCE';
  }

  // WITHDRAW: own seat → community, own rostrum → own seat, own office → own rostrum
  if ((fromLocationId.includes(`p${playerId}_seat`) && toLocationId.includes('community')) ||
      (fromLocationId.includes(`p${playerId}_rostrum`) && toLocationId.includes(`p${playerId}_seat`)) ||
      (fromLocationId === `p${playerId}_office` && toLocationId.includes(`p${playerId}_rostrum`))) {
    return 'WITHDRAW';
  }

  // ORGANIZE: own rostrum↔rostrum or own seat↔seat
  if ((fromLocationId.includes(`p${playerId}_rostrum`) && toLocationId.includes(`p${playerId}_rostrum`)) ||
      (fromLocationId.includes(`p${playerId}_seat`) && toLocationId.includes(`p${playerId}_seat`))) {
    return 'ORGANIZE';
  }

  return null;
}

// Check if a move type is possible given the current board state
function isMoveTypePossible(moveType, moverPlayerId, pieces) {
  const moverPrefix = `p${moverPlayerId}_`;

  switch (moveType) {
    case 'REMOVE':
      // Any opponent has a Mark in their seat
      return pieces.some(p =>
        p.name?.toLowerCase() === 'mark' &&
        p.locationId?.includes('_seat') &&
        !p.locationId?.includes(moverPrefix)
      );

    case 'ADVANCE':
      // Mover has pieces that can move up the hierarchy
      return pieces.some(p => {
        if (!p.locationId) return false;
        // Community → own seat
        if (p.locationId.includes('community')) return true;
        // Own seat → own rostrum
        if (p.locationId.includes(`${moverPrefix}seat`)) return true;
        // Own rostrum1 → office (if office not occupied)
        if (p.locationId === `${moverPrefix}rostrum1`) {
          return !pieces.some(op => op.locationId === `${moverPrefix}office`);
        }
        return false;
      });

    case 'WITHDRAW':
      // Mover has pieces on their own seat, rostrum, or office
      return pieces.some(p =>
        p.locationId?.includes(`${moverPrefix}seat`) ||
        p.locationId?.includes(`${moverPrefix}rostrum`) ||
        p.locationId === `${moverPrefix}office`
      );

    case 'INFLUENCE':
      // Any opponent has a piece on their rostrum or seat
      return pieces.some(p =>
        (p.locationId?.includes('_rostrum') || p.locationId?.includes('_seat')) &&
        !p.locationId?.includes(moverPrefix)
      );

    case 'ASSIST':
      // Pieces in community AND some opponent seat exists
      return pieces.some(p => p.locationId?.includes('community'));

    case 'ORGANIZE':
      // Mover has any pieces on their own seat or rostrum
      return pieces.some(p =>
        p.locationId?.includes(`${moverPrefix}seat`) ||
        p.locationId?.includes(`${moverPrefix}rostrum`)
      );

    default:
      return false;
  }
}

// Validate that correction moves match tile requirements
function validateCorrectionMoves(state) {
  const tile = state.playedTile?.tile || state.tileTransaction?.tile;
  if (!tile) return { valid: true };

  const tileId = getTileIdFromTile(tile);
  if (!tileId) return { valid: true };

  const requiredMoves = TILE_REQUIREMENTS[tileId];
  if (!requiredMoves || requiredMoves.length === 0) return { valid: true };

  const moverId = state.playedTile?.playerId;
  const moverPlayer = state.players.find(p => p.id === moverId);
  if (!moverPlayer) return { valid: true };

  // Use the pieces from before correction (the restored original pieces)
  const originalPieces = state.playedTile?.originalPieces || state.piecesAtTurnStart || [];

  // Determine what moves the player actually made during correction
  const executedMoveTypes = new Set();

  if (state.movedPiecesThisTurn && state.movedPiecesThisTurn.length > 0) {
    for (const pieceId of state.movedPiecesThisTurn) {
      const originalPiece = originalPieces.find(p => p.id === pieceId);
      const currentPiece = state.pieces.find(p => p.id === pieceId);

      if (originalPiece && currentPiece) {
        const moveType = determineMoveTypeServer(
          originalPiece.locationId,
          currentPiece.locationId,
          moverPlayer.id
        );
        if (moveType) {
          executedMoveTypes.add(moveType);
        }
      }
    }
  }

  console.log(`[KRED] Correction validation - Tile ${tileId} requires: [${requiredMoves}], executed: [${[...executedMoveTypes]}]`);

  // Check for wrong move types (moves not on the tile)
  const wrongMoves = [];
  for (const executed of executedMoveTypes) {
    if (!requiredMoves.includes(executed)) {
      wrongMoves.push(executed);
    }
  }

  if (wrongMoves.length > 0) {
    return {
      valid: false,
      error: `Tile requires: ${requiredMoves.join(' + ')}. You made a ${wrongMoves.join(', ')} move which is not on this tile. Pieces have been reset — try again.`
    };
  }

  // Check for missing required moves (only if they were possible)
  const missingMoves = [];
  for (const required of requiredMoves) {
    if (!executedMoveTypes.has(required)) {
      if (isMoveTypePossible(required, moverPlayer.id, originalPieces)) {
        missingMoves.push(required);
      }
    }
  }

  if (missingMoves.length > 0) {
    return {
      valid: false,
      error: `Tile requires: ${requiredMoves.join(' + ')}. Missing: ${missingMoves.join(', ')}. Pieces have been reset — try again.`
    };
  }

  return { valid: true };
}

// Helper function to create and deal tiles to players
function createAndDealTiles(playerCount, playerNames = []) {
  // Create all 24 standard tiles
  const allTiles = [];
  for (let i = 1; i <= 24; i++) {
    allTiles.push({
      id: i,
      url: `./images/${String(i).padStart(2, '0')}.svg`
    });
  }
  
  // Add blank tile for 5-player games
  if (playerCount === 5) {
    allTiles.push({
      id: 25,
      url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`
    });
  }
  
  // Shuffle tiles once
  const shuffledTiles = shuffleArray(allTiles);
  
  console.log('[KRED] Shuffled tiles for dealing:', shuffledTiles.map(t => t.id).join(', '));
  
  // Create player objects with empty hands
  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    name: playerNames[i] || `Player ${i + 1}`,
    hand: [],
    keptTiles: [],
    bureaucracyTiles: [],
    bureaucracyPurchases: [],
    credibility: 3,
    pendingTiles: [],
    playedTile: null,
    discardedTiles: []
  }));
  
  // Deal tiles evenly to players (round-robin)
  let tileIndex = 0;
  while (tileIndex < shuffledTiles.length) {
    for (let i = 0; i < playerCount && tileIndex < shuffledTiles.length; i++) {
      players[i].hand.push(shuffledTiles[tileIndex]);
      tileIndex++;
    }
  }
  
  // DEBUG: Log each player's hand to verify uniqueness
  players.forEach((player, i) => {
    console.log(`[KRED] Player ${i + 1} (${player.name}) dealt tiles:`, player.hand.map(t => t.id).join(', '));
  });
  
  return players;
}

// Helper function to filter game state for a specific player
// Hides private information based on game phase and player role
function filterStateForPlayer(fullState, playerIndex) {
  const filteredState = { ...fullState };
  
  // During DRAFTING: Hide other players' unselected hands
  if (fullState.phase === 'DRAFTING') {
    filteredState.players = fullState.players.map((player, idx) => {
      if (idx === playerIndex) {
        return player;
      } else {
        return {
          ...player,
          hand: [],  // Hide tiles they haven't selected yet
        };
      }
    });
  }
  
  // During CAMPAIGN phases: Hide other players' hands, control tile visibility
  const campaignPhases = ['CAMPAIGN', 'TILE_PLAYED', 'PENDING_ACCEPTANCE', 'PENDING_CHALLENGE', 'CORRECTION_REQUIRED'];
  if (campaignPhases.includes(fullState.phase)) {
    const thisPlayerId = fullState.players[playerIndex]?.id;
    
    filteredState.players = fullState.players.map((player, idx) => {
      if (idx === playerIndex) {
        return player; // Full data for this player
      } else {
        return {
          ...player,
          hand: player.hand ? player.hand.map(() => ({ id: 0, url: '', hidden: true })) : [],
          // Keep handCount so other players know how many tiles they have
        };
      }
    });
    
    // Control playedTile visibility
    if (fullState.playedTile) {
      const isMover = thisPlayerId === fullState.playedTile.playerId;
      const isReceiver = thisPlayerId === fullState.playedTile.receivingPlayerId;
      const receiverPlayer = fullState.players.find(p => p.id === fullState.playedTile.receivingPlayerId);
      const receiverHasCredibility = receiverPlayer && receiverPlayer.credibility > 0;
      
      // Tile is revealed to all when:
      // - Receiver exposed the mover (wasExposed = true)
      // - Any challenge was made (challengeWasMade = true) - per manual: "the tile is turned over for all to see"
      // - During CORRECTION_REQUIRED (everyone needs to see the tile for verification)
      const tileRevealed = fullState.wasExposed || 
        fullState.challengeWasMade === true ||
        fullState.phase === 'CORRECTION_REQUIRED';
      
      // During PENDING_CHALLENGE, the current bystander needs tile data to evaluate the challenge
      const isCurrentChallenger = fullState.phase === 'PENDING_CHALLENGE' &&
        fullState.bystanders && fullState.bystanders[fullState.bystanderIndex || 0] &&
        fullState.bystanders[fullState.bystanderIndex || 0].id === thisPlayerId;
      
      if (tileRevealed) {
        // Everyone sees the tile during exposure/challenge/correction
        filteredState.playedTile = fullState.playedTile;
      } else if (isMover) {
        // Mover always knows what tile they played
        filteredState.playedTile = fullState.playedTile;
      } else if (isReceiver && receiverHasCredibility) {
        // Receiver can see the tile if they have credibility
        filteredState.playedTile = fullState.playedTile;
      } else if (isCurrentChallenger) {
        // Current challenger needs full playedTile data to compute challenge result
        filteredState.playedTile = fullState.playedTile;
      } else {
        // Other players: know a tile was played but not which one
        filteredState.playedTile = {
          ...fullState.playedTile,
          tileId: null, // Hide tile identity
          tile: null, // Hide tile object
        };
      }
    }
  }
  
  return filteredState;
}

// Helper: Build broadcast data for a specific player (filtered)
function buildFilteredBroadcast(state, playerIndex) {
  const filtered = filterStateForPlayer(state, playerIndex);
  // Only send pendingChallengerReward=true to the actual challenger
  const thisPlayerId = state.players[playerIndex]?.id;
  const isThisPlayerChallenger = state.pendingChallengerReward && thisPlayerId === state.challengerId;
  return {
    gameState: {
      players: filtered.players,
      phase: filtered.phase,
      currentPlayerIndex: filtered.currentPlayerIndex,
      playerCount: filtered.playerCount,
      pieces: filtered.pieces,
      boardTiles: filtered.boardTiles,
      community: filtered.community,
      playedTile: filtered.playedTile || null,
      tileTransaction: filtered.tileTransaction || null,
      hasPlayedTileThisTurn: filtered.hasPlayedTileThisTurn || false,
      bystanders: filtered.bystanders || [],
      bystanderIndex: filtered.bystanderIndex || 0,
      movedPiecesThisTurn: filtered.movedPiecesThisTurn || [],
      moverPlayerIndex: filtered.moverPlayerIndex,
      campaignRole: getCampaignRole(state, playerIndex),
      tileRevealed: !!(state.wasExposed || state.challengeWasMade),
      pendingReceiverReward: filtered.pendingReceiverReward || false,
      receiverAdvanceInProgress: !!state.receiverAdvanceInProgress,
      pendingChallengerReward: isThisPlayerChallenger,
      challengerId: filtered.challengerId || null,
    }
  };
}

// Helper: Determine a player's role in the current campaign turn
function getCampaignRole(state, playerIndex) {
  const campaignPhases = ['CAMPAIGN', 'TILE_PLAYED', 'PENDING_ACCEPTANCE', 'PENDING_CHALLENGE', 'CORRECTION_REQUIRED'];
  if (!campaignPhases.includes(state.phase)) return null;
  
  const playerId = state.players[playerIndex]?.id;
  if (!playerId) return null;
  
  // During CAMPAIGN: the mover is the currentPlayerIndex
  if (state.phase === 'CAMPAIGN') {
    if (playerIndex === state.currentPlayerIndex) return 'mover';
    return 'waiting';
  }
  
  // CORRECTION_REQUIRED must be checked before general playedTile check
  // so the mover gets 'correcting' instead of 'mover'
  if (state.phase === 'CORRECTION_REQUIRED') {
    // Free Advance in progress: receiver is active, mover waits
    if (state.receiverAdvanceInProgress) {
      const receiverId = state.playedTile?.receivingPlayerId;
      if (playerId === receiverId) return 'freeAdvance';
      return 'waiting';
    }
    if (state.playedTile && playerId === state.playedTile.playerId) return 'correcting';
    return 'waiting';
  }
  
  // After tile played: determine mover, receiver, bystander
  if (state.playedTile) {
    if (playerId === state.playedTile.playerId) return 'mover';
    if (playerId === state.playedTile.receivingPlayerId) {
      if (state.phase === 'PENDING_ACCEPTANCE') return 'receiver';
      return 'waiting';
    }
  }
  
  if (state.phase === 'PENDING_CHALLENGE') {
    const bystanders = state.bystanders || [];
    const currentBystander = bystanders[state.bystanderIndex || 0];
    if (currentBystander && currentBystander.id === playerId) return 'challenger';
    if (bystanders.some(b => b.id === playerId)) return 'bystander';
  }
  
  return 'waiting';
}

// Helper: Broadcast filtered state to each player individually
async function broadcastFilteredState(io, roomId, state, db) {
  // Get all players in the room
  const [playersInRoom] = await db.query(
    `SELECT player_id, player_index FROM room_players WHERE room_id = ?`,
    [roomId.toLowerCase()]
  );
  
  // Get all sockets in the kred room
  const room = io.sockets.adapter.rooms.get(`kred:${roomId}`);
  if (!room) {
    console.log(`[KRED] No sockets in room kred:${roomId}`);
    return;
  }
  
  for (const socketId of room) {
    const targetSocket = io.sockets.sockets.get(socketId);
    if (!targetSocket) continue;
    
    // Find this socket's playerIndex
    const playerData = playersInRoom.find(p => {
      // Match by stored socket_id or by querying the socket's data
      return targetSocket.data?.playerIndex === p.player_index;
    });
    
    const pIndex = playerData?.player_index ?? targetSocket.data?.playerIndex;
    
    if (pIndex !== undefined && pIndex !== null) {
      const filtered = buildFilteredBroadcast(state, pIndex);
      console.log(`[KRED] Broadcasting to player ${pIndex}: phase=${filtered.gameState.phase}, role=${filtered.gameState.campaignRole}, currentPlayerIndex=${filtered.gameState.currentPlayerIndex}`);
      targetSocket.emit('kred:stateUpdate', filtered);
    } else {
      // Fallback: send unfiltered (shouldn't happen normally)
      console.warn(`[KRED] Could not determine playerIndex for socket ${socketId}`);
      targetSocket.emit('kred:stateUpdate', { gameState: state });
    }
  }
}

// Helper: Finalize a campaign turn (tile accepted, no challenge or challenge resolved)
// Receiver becomes the next mover
function finalizeCampaignTurn(state) {
  const receiverId = state.playedTile?.receivingPlayerId;
  const moverId = state.playedTile?.playerId;
  const tile = state.playedTile?.tile || state.tileTransaction?.tile;
  const tileId = state.playedTile?.tileId;
  
  // Add tile to receiver's bureaucracyTiles
  if (receiverId && tile) {
    const receiver = state.players.find(p => p.id === receiverId);
    if (receiver) {
      if (!receiver.bureaucracyTiles) receiver.bureaucracyTiles = [];
      if (state.wasExposed) {
        // Exposed by receiver: face-up, no funding value
        receiver.bureaucracyTiles.push({ ...tile, faceUp: true, noFunding: true });
      } else if (state.challengeSucceeded && !state.receiverHadNoCredibility) {
        // Challenge succeeded but receiver had credibility (could see tile): face-up, no funding
        receiver.bureaucracyTiles.push({ ...tile, faceUp: true, noFunding: true });
      } else {
        // Normal acceptance OR challenge succeeded but receiver had 0 credibility:
        // face-down, counts as funding
        receiver.bureaucracyTiles.push(tile);
      }
    }
  }
  
  // Clear boardTiles — accepted tiles live in bureaucracyTiles (bank), not on the board
  state.boardTiles = [];
  
  // Receiver becomes next mover
  const receiverIndex = state.players.findIndex(p => p.id === receiverId);
  if (receiverIndex !== -1) {
    state.currentPlayerIndex = receiverIndex;
  }
  
  // Check if all players have used all their tiles - if so, transition to Bureaucracy
  const allTilesPlayed = state.players.every(p => (p.hand?.length || 0) === 0);
  
  if (allTilesPlayed) {
    state.phase = 'BUREAUCRACY';
    console.log('[KRED] All tiles played - transitioning to BUREAUCRACY');
  } else {
    state.phase = 'CAMPAIGN';
    // If current player has no tiles in hand, skip to next player who does
    const current = state.players[state.currentPlayerIndex];
    if ((current?.hand?.length || 0) === 0) {
      for (let i = 1; i < state.playerCount; i++) {
        const nextIdx = (state.currentPlayerIndex + i) % state.playerCount;
        if ((state.players[nextIdx]?.hand?.length || 0) > 0) {
          console.log(`[KRED] Player ${current.name} has no tiles - skipping to player ${state.players[nextIdx].name}`);
          state.currentPlayerIndex = nextIdx;
          break;
        }
      }
    }
  }
  
  // Reset turn state
  state.playedTile = null;
  state.tileTransaction = null;
  state.bystanders = [];
  state.bystanderIndex = 0;
  state.hasPlayedTileThisTurn = false;
  state.movedPiecesThisTurn = [];
  state.piecesAtTurnStart = state.pieces.map(p => ({...p})); // New snapshot for next turn
  state.receiverAccepted = null;
  state.wasExposed = false;
  state.challengeSucceeded = false;
  state.challengeWasMade = false;
  state.challengerId = null;
  state.moverMustWithdraw = false;
  state.moverPlayerIndex = null;
  state.moverCredibilityAtTurnStart = null;
  state.pendingReceiverReward = false;
  state.receiverFreeAdvancePending = false;
  state.receiverAdvanceInProgress = false;
}

// Room initialization lock to prevent race conditions
const initializationLocks = new Set();

module.exports = function setupKREDHandlers(io, socket, db) {
  
  // Initialize KRED game for a room (called when room selects KRED)
  socket.on('kred:initialize', async (data, callback) => {
    const { roomId } = data;
    
    // Use a lock to prevent redundant initialization
    if (initializationLocks.has(roomId)) {
      console.log(`[KRED] Initialization already in progress for room ${roomId}. Skipping.`);
      callback({ success: false, error: 'Initialization in progress' });
      return;
    }
    initializationLocks.add(roomId);

    try {
      // Check if the room_id already exists in the database
      const [existingState] = await db.query(
        `SELECT * FROM kred_game_state WHERE room_id = ?`,
        [roomId]
      );

      if (existingState.length > 0) {
        console.log(`[KRED] Game state already exists for room ${roomId}. Returning existing state.`);
        callback({ success: true, state: JSON.parse(existingState[0].game_state) });
        initializationLocks.delete(roomId);
        return;
      }

      // Initialize a new state
      console.log(`[KRED] No game state found for room ${roomId}. Initializing a new state.`);
      const initialState = {
        players: [],
        phase: 'PLAYER_SELECTION',
        playerCount: 0,
        livePlayerIndex: 0,
        currentPlayerIndex: 0,
        pieces: [],
        community: [],
        boardTiles: []
      };
      
      await db.query(
        `INSERT INTO kred_game_state (room_id, game_state) 
         VALUES (?, ?)`,
        [roomId, JSON.stringify(initialState)]
      );
      console.log(`[KRED] Initialized game state for room ${roomId}`);

      // Broadcast the initial state to all players
      const initBroadcast = {
        players: initialState.players,
        phase: initialState.phase,
        livePlayerIndex: initialState.livePlayerIndex,
        currentPlayerIndex: initialState.currentPlayerIndex
      };
      socket.emit('kred:stateUpdate', initBroadcast);
      socket.to(`kred:${roomId}`).emit('kred:stateUpdate', initBroadcast);

      callback({ success: true, initialState });
    } catch (error) {
      console.error('[KRED] Error initializing:', error);
      callback({ success: false, error: error.message });
    } finally {
      initializationLocks.delete(roomId);
    }
  });
  
  // Handle tile selection in drafting phase
  // Each player selects ONE tile to keep, then passes ALL remaining tiles to the next player
  // This repeats until each player has 6 kept tiles (or 5 in 5-player game)
  socket.on('kred:select:tile', async (data, callback) => {
    const { roomId, playerIndex, tileId } = data;
    
    try {
      console.log(`[KRED] Tile selection: room=${roomId}, player=${playerIndex}, tile=${tileId}`);
      
      // Validate input
      if (!roomId || playerIndex === undefined || !tileId) {
        console.error('[KRED] Missing required data:', { roomId, playerIndex, tileId });
        return callback({ success: false, error: 'Missing required data' });
      }
      
      // Get current game state
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );

      if (!gameState.length) {
        console.error(`[KRED] Game not found for room ${roomId}`);
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Validate player exists
      if (!state.players || !state.players[playerIndex]) {
        console.error(`[KRED] Invalid player index ${playerIndex} for room ${roomId}`);
        return callback({ success: false, error: 'Invalid player index' });
      }
      
      const player = state.players[playerIndex];
      
      // Initialize pending tiles queue if not exists
      if (!player.pendingTiles) player.pendingTiles = [];
      if (!player.hand) player.hand = [];
      if (!player.keptTiles) player.keptTiles = [];
      
      // Verify tile is in player's current hand
      const selectedTile = player.hand.find(t => t.id === tileId);
      if (!selectedTile) {
        console.error(`[KRED] Tile ${tileId} not found in player ${playerIndex}'s hand:`, player.hand.map(t => t.id));
        return callback({ success: false, error: 'Tile not in hand' });
      }
      
      // Keep the selected tile in keptTiles
      player.keptTiles.push(selectedTile);
      
      // Remove selected tile from hand - remaining tiles will be passed
      const remainingTiles = player.hand.filter(t => t.id !== tileId);
      
      console.log(`[KRED] Player ${playerIndex} kept tile ${tileId}. Remaining: ${remainingTiles.length}, Kept: ${player.keptTiles.length}`);
      
      // Pass remaining tiles to next player (left/clockwise)
      const nextPlayerIndex = (playerIndex + 1) % state.playerCount;
      const nextPlayer = state.players[nextPlayerIndex];
      
      if (!nextPlayer.pendingTiles) nextPlayer.pendingTiles = [];
      
      if (remainingTiles.length > 0) {
        // Add tiles to next player's pending queue
        nextPlayer.pendingTiles.push(remainingTiles);
        console.log(`[KRED] Passed ${remainingTiles.length} tiles to player ${nextPlayerIndex}. Pending packets: ${nextPlayer.pendingTiles.length}`);
        
        // If next player has no tiles in hand, immediately give them the pending tiles
        if (nextPlayer.hand.length === 0 && nextPlayer.pendingTiles.length > 0) {
          nextPlayer.hand = nextPlayer.pendingTiles.shift();
          console.log(`[KRED] Player ${nextPlayerIndex} automatically received ${nextPlayer.hand.length} tiles (hand was empty)`);
        }
      }
      
      // Check if player has pending tiles to process next
      if (player.pendingTiles.length > 0) {
        // Move next packet of tiles to hand
        player.hand = player.pendingTiles.shift();
        console.log(`[KRED] Player ${playerIndex} received ${player.hand.length} tiles from pending queue. Remaining packets: ${player.pendingTiles.length}`);
      } else {
        // No more tiles to process
        player.hand = [];
        console.log(`[KRED] Player ${playerIndex} has no more tiles to select from`);
      }
      
      // Debug: Log all players' state
      console.log('[KRED] Current state after selection:', state.players.map((p, i) => ({
        player: i,
        hand: p.hand?.length || 0,
        keptTiles: p.keptTiles?.length || 0,
        pendingPackets: p.pendingTiles?.length || 0
      })));
      
      // Check if drafting is complete for ALL players (no one has any tiles to select)
      const allPlayersComplete = state.players.every(p => 
        p.hand.length === 0 && (!p.pendingTiles || p.pendingTiles.length === 0)
      );
      
      if (allPlayersComplete) {
        // Drafting complete - move kept tiles to hand and transition to campaign
        state.players.forEach(p => {
          p.hand = p.keptTiles;
          p.keptTiles = [];
          p.pendingTiles = [];
          p.playedTile = null;
          p.discardedTiles = [];
        });
        
        // Find player with Tile 3 - they go first
        const startingTileId = 3;
        const startingPlayerIndex = state.players.findIndex(
          p => p.hand && p.hand.some(t => t.id === startingTileId)
        );
        state.currentPlayerIndex = startingPlayerIndex !== -1 ? startingPlayerIndex : 0;
        
        state.phase = 'CAMPAIGN';
        
        // Note: Pieces and boardTiles will be initialized by client
        // Server just manages game state, client handles rendering logic
        if (!state.pieces) state.pieces = [];
        if (!state.boardTiles) state.boardTiles = [];
        
        console.log(`[KRED] 🎉 Drafting complete for room ${roomId}. Transitioning to CAMPAIGN.`);
        console.log(`[KRED] Player ${startingPlayerIndex} has Tile 3 and will go first.`);
        console.log(`[KRED] Players have ${state.players[0].hand.length} tiles each.`);
      }
      
      // Save updated state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      console.log('[KRED] 📤 Broadcasting state update to all players in room:', roomId);
      console.log('[KRED] 📦 Players FULL DATA being broadcast:');
      state.players.forEach((p, i) => {
        console.log(`  Player ${i} (${p.name}):`, {
          hand: p.hand,
          keptTiles: p.keptTiles,
          pendingTiles: p.pendingTiles
        });
      });
      
      // Broadcast updated state to ALL players (including sender)
      const broadcastData = { 
        gameState: {
          players: state.players,
          phase: state.phase,
          livePlayerIndex: state.livePlayerIndex,
          currentPlayerIndex: state.currentPlayerIndex,
          playerCount: state.playerCount,
          pieces: state.pieces,
          boardTiles: state.boardTiles,
          community: state.community
        }
      };
      console.log('[KRED] Full broadcast payload:', JSON.stringify(broadcastData, null, 2));
      
      // Emit to sender's socket first (ensures they get the update)
      socket.emit('kred:stateUpdate', broadcastData);
      // Then broadcast to all others in the room
      socket.to(`kred:${roomId}`).emit('kred:stateUpdate', broadcastData);
      
      console.log('[KRED] ✅ Broadcast complete. Phase:', state.phase);
      
      callback({ success: true, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error selecting tile:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Handle game state updates
  socket.on('kred:state:update', async (data) => {
    const { roomId, gameState } = data;
    
    try {
      // Save state to database
      await db.query(
        `INSERT INTO kred_game_state (room_id, game_state) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE game_state = ?`,
        [roomId, JSON.stringify(gameState), JSON.stringify(gameState)]
      );
      
      // Broadcast to all players in room
      socket.to(`kred:${roomId}`).emit('kred:state:update', { gameState });
      
      console.log(`[KRED] State updated for room ${roomId}`);
    } catch (error) {
      console.error('[KRED] Error updating state:', error);
      socket.emit('kred:error', { message: error.message });
    }
  });

  
  // Handle player actions (tile play, piece movement, etc.)
  socket.on('kred:action', async (data) => {
    const { roomId, action } = data;
    
    try {
      // Get next sequence number
      const [rows] = await db.query(
        `SELECT COALESCE(MAX(sequence), 0) + 1 as next_seq FROM kred_game_history WHERE room_id = ?`,
        [roomId]
      );
      const sequence = rows[0].next_seq;
      
      // Log action
      await db.query(
        `INSERT INTO kred_game_history (room_id, sequence, action_type, action_data) 
         VALUES (?, ?, ?, ?)`,
        [roomId, sequence, action.type, JSON.stringify(action)]
      );
      
      // Broadcast action to all players
      io.to(`kred:${roomId}`).emit('kred:action', { action });
      
      console.log(`[KRED] Action ${action.type} in room ${roomId}`);
    } catch (error) {
      console.error('[KRED] Error processing action:', error);
      socket.emit('kred:error', { message: error.message });
    }
  });

  // Handle game start (transition from lobby to gameplay)
  socket.on('kred:game:start', async (data, callback) => {
    const { roomId, draftTiles = true } = data; // Default to true for backward compatibility
    
    try {
      console.log(`[KRED] Game start requested for room: ${roomId}, draftTiles: ${draftTiles}`);
      
      // Validate minimum players from generic room
      const [playersRes] = await db.query(
        `SELECT COUNT(*) as player_count FROM room_players WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      const playerCount = playersRes[0].player_count;
      // Debug: show all players in this room
      const [allPlayers] = await db.query(
        `SELECT player_name, player_index FROM room_players WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      console.log(`[KRED] Players in room:`, allPlayers);
      if (playerCount < 3) {
        return callback({ success: false, error: 'Need at least 3 players' });
      }
      // Update generic room status
      await db.query(
        `UPDATE game_rooms SET status = 'playing' WHERE id = ?`,
        [roomId.toLowerCase()]
      );
      // Get the initialized game state
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not initialized. Call kred:initialize first.' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Deal tiles now and update state
      const playerNames = allPlayers.map(p => p.player_name);
      const dealtPlayers = createAndDealTiles(playerCount, playerNames);
      state.players = dealtPlayers;
      
      // Set phase based on draftTiles option
      state.phase = draftTiles ? 'DRAFTING' : 'CAMPAIGN';
      state.playerCount = playerCount;
      
      // If skipping draft, move all dealt tiles to keptTiles
      if (!draftTiles) {
        state.players = state.players.map(player => ({
          ...player,
          keptTiles: [...player.hand],
          hand: []
        }));
        console.log('[KRED] Tiles moved to keptTiles for player 0:', state.players[0].keptTiles.length);
      }
      
      // Save updated state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Notify ALL players that game has started (without sending full state)
      // Each player will request their own filtered state when they load the game page
      io.to(`room:${roomId}`).emit('kred:game:started', {
        playerCount: playerCount,
        phase: state.phase,
        // Do NOT send full state here - players will request it individually
      });
      
      console.log(`[KRED] Game ${roomId} started with ${playerCount} players, phase: ${state.phase}`);
      console.log(`[KRED] Players will receive filtered state when they request it`);
      
      // Send response to requesting socket (lobby) - no state needed here either
      callback({ success: true, playerCount: playerCount });
    } catch (error) {
      console.error('[KRED] Error starting game:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Request game state (for players loading the game after it started)
  socket.on('kred:request:state', async (data, callback) => {
    const { roomId, playerId, playerIndex } = data;
    
    try {
      console.log(`[KRED] State requested for room: ${roomId} by player ${playerId} (index: ${playerIndex})`);
      
      // Join the KRED-specific room to receive updates
      socket.join(`kred:${roomId}`);
      socket.data.playerIndex = playerIndex;
      socket.data.roomId = roomId;
      console.log(`[KRED] Socket ${socket.id} joined kred:${roomId} as player ${playerIndex}`);
      
      // Get player count
      const [players] = await db.query(
        `SELECT COUNT(*) as player_count FROM room_players WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      // Get game state if it exists
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      const fullState = gameState.length > 0 ? JSON.parse(gameState[0].game_state) : null;
      
      // Use buildFilteredBroadcast for campaign phases so the initial state
      // has the same shape as regular state updates (includes tileRevealed, etc.)
      // For non-campaign phases, use raw filtered state to preserve phase-specific fields
      const campaignPhases = ['CAMPAIGN', 'TILE_PLAYED', 'PENDING_ACCEPTANCE', 'PENDING_CHALLENGE', 'CORRECTION_REQUIRED'];
      let initialGameState;
      if (fullState && typeof playerIndex === 'number' && campaignPhases.includes(fullState.phase)) {
        const broadcast = buildFilteredBroadcast(fullState, playerIndex);
        initialGameState = broadcast.gameState;
      } else if (fullState && typeof playerIndex === 'number') {
        initialGameState = filterStateForPlayer(fullState, playerIndex);
      } else {
        initialGameState = fullState;
      }
      
      console.log(`[KRED] Sending filtered state for room ${roomId}:`, {
        playerCount: players[0].player_count,
        hasState: !!initialGameState,
        playersInState: initialGameState?.players?.length || 0,
        phase: initialGameState?.phase,
        requestingPlayerIndex: playerIndex
      });
      
      callback({ 
        success: true, 
        playerCount: players[0].player_count,
        initialGameState
      });
    } catch (error) {
      console.error('[KRED] Error getting state:', error);
      callback({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // CAMPAIGN PHASE HANDLERS
  // ============================================================================
  
  // Receive initial campaign pieces from client
  // This ensures the server has piece positions BEFORE any moves are made
  socket.on('kred:campaign:initPieces', async (data, callback) => {
    const { roomId, pieces } = data;
    
    try {
      if (!pieces || !pieces.length) {
        return callback({ success: false, error: 'No pieces provided' });
      }
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Only set if server pieces are empty (first client to send wins)
      if (!state.pieces || state.pieces.length === 0) {
        state.pieces = pieces.map(p => ({...p}));
        state.piecesAtTurnStart = pieces.map(p => ({...p}));
        
        await db.query(
          `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
          [JSON.stringify(state), roomId.toLowerCase()]
        );
        console.log(`[KRED] Initialized ${pieces.length} campaign pieces for room ${roomId}`);
      }
      
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error initializing campaign pieces:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Play a tile to another player
  socket.on('kred:campaign:playTile', async (data, callback) => {
    const { roomId, playerIndex, tileId, targetPlayerId } = data;
    
    if (!callback || typeof callback !== 'function') {
      console.error('[KRED] playTile: callback not provided');
      return;
    }
    
    try {
      console.log(`[KRED] Player ${playerIndex} playing tile ${tileId} to player ${targetPlayerId}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // TURN VALIDATION: Only the active player (mover) can play tiles
      if (playerIndex !== state.currentPlayerIndex) {
        console.warn(`[KRED] Player ${playerIndex} attempted to play tile, but it's player ${state.currentPlayerIndex}'s turn`);
        return callback({ success: false, error: `It's not your turn. Current mover is player ${state.currentPlayerIndex}` });
      }
      
      // PHASE VALIDATION: Only allow tile play during CAMPAIGN phase
      if (state.phase !== 'CAMPAIGN') {
        return callback({ success: false, error: `Cannot play tile during ${state.phase} phase` });
      }
      
      const player = state.players[playerIndex];
      
      // Validate receiver eligibility
      const receiver = state.players.find(p => p.id === targetPlayerId);
      if (!receiver) {
        return callback({ success: false, error: 'Receiver not found' });
      }
      if ((receiver.hand?.length || 0) === 0) {
        return callback({ success: false, error: 'Cannot pass a tile to a player with no hand.' });
      }
      const tilesPerPlayer = Math.floor(24 / state.playerCount);
      if ((receiver.bureaucracyTiles?.length || 0) >= tilesPerPlayer) {
        return callback({ success: false, error: 'Cannot pass a tile to a player whose bank is full.' });
      }

      // Find and remove tile from hand
      const tileIndex = player.hand.findIndex(t => t.id === tileId || t.id === parseInt(tileId));
      if (tileIndex === -1) {
        return callback({ success: false, error: 'Tile not in hand' });
      }

      const tile = player.hand.splice(tileIndex, 1)[0];

      // Use piecesAtTurnStart as the baseline for comparison
      // This was captured at the START of the mover's turn, before any moves
      const originalPieces = state.piecesAtTurnStart 
        ? state.piecesAtTurnStart.map(p => ({...p}))
        : state.pieces.map(p => ({...p}));

      // Store the played tile with both snapshots for challenge comparison
      state.playedTile = {
        tileId: tileId.toString().padStart(2, '0'),
        playerId: player.id,
        receivingPlayerId: targetPlayerId,
        playedAt: Date.now(),
        movesPerformed: [],
        originalPieces: originalPieces, // Board state BEFORE mover moved pieces
        piecesAfterMoves: state.pieces.map(p => ({...p})), // Board state AFTER mover moved pieces
        tile: tile, // The actual tile object
      };

      state.hasPlayedTileThisTurn = true;
      state.moverPlayerIndex = playerIndex; // Track who the mover was
      state.moverCredibilityAtTurnStart = player.credibility; // Track credibility at turn start for challenge rules

      // Update phase to PENDING_ACCEPTANCE
      state.phase = 'PENDING_ACCEPTANCE';

      // Store transaction info for the workflow
      state.tileTransaction = {
        placerId: player.id,
        receiverId: targetPlayerId,
        tile: tile
      };

      // Switch to receiving player
      const receiverIndex = state.players.findIndex(p => p.id === targetPlayerId);
      if (receiverIndex !== -1) {
        state.currentPlayerIndex = receiverIndex;
      }
      
      // Check if receiver has 0 credibility - they must accept without viewing
      // Per manual: "If the Receiver has no remaining Credibility, skip to 'The Challenge'."
      const receiver = state.players.find(p => p.id === targetPlayerId);
      if (receiver && receiver.credibility === 0) {
        console.log(`[KRED] Receiver (player ${targetPlayerId}) has 0 credibility - auto-accepting, skip to challenge phase`);
        state.phase = 'PENDING_CHALLENGE';
        state.receiverAccepted = true;
        state.receiverHadNoCredibility = true;
        
        // Calculate bystanders (clockwise from receiver, excluding mover and receiver)
        const bystanderPlayers = [];
        for (let i = 1; i < state.playerCount; i++) {
          const idx = (receiverIndex + i) % state.playerCount;
          const bp = state.players[idx];
          if (bp.id !== player.id && bp.id !== targetPlayerId) {
            if (bp.credibility > 0) {
              bystanderPlayers.push(bp);
            }
          }
        }
        
        state.bystanders = bystanderPlayers;
        state.bystanderIndex = 0;
        
        if (bystanderPlayers.length > 0) {
          const firstBystanderIndex = state.players.findIndex(
            p => p.id === bystanderPlayers[0].id
          );
          state.currentPlayerIndex = firstBystanderIndex;
          console.log(`[KRED] ${bystanderPlayers.length} bystanders can challenge. First: player ${firstBystanderIndex}`);
        } else {
          console.log(`[KRED] No bystanders can challenge - finalizing tile play`);
          finalizeCampaignTurn(state);
        }
      }
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Store playerIndex on socket for filtered broadcasts
      socket.data = socket.data || {};
      socket.data.playerIndex = playerIndex;
      
      // Broadcast filtered state to each player
      await broadcastFilteredState(io, roomId, state, db);
      
      console.log(`[KRED] Tile ${tileId} played to player ${targetPlayerId}, phase: ${state.phase}`);
      callback({ success: true, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error playing tile:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Move a piece on the board (during campaign - mover only)
  socket.on('kred:campaign:movePiece', async (data, callback) => {
    const { roomId, playerIndex, pieces, movedPiecesThisTurn } = data;
    
    try {
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // TURN VALIDATION: Only the active player (mover) can move pieces
      if (playerIndex !== undefined && playerIndex !== state.currentPlayerIndex) {
        console.warn(`[KRED] Player ${playerIndex} attempted to move pieces, but it's player ${state.currentPlayerIndex}'s turn`);
        return callback({ success: false, error: `It's not your turn` });
      }
      
      // PHASE VALIDATION: Only allow moves during CAMPAIGN or CORRECTION_REQUIRED
      if (state.phase !== 'CAMPAIGN' && state.phase !== 'CORRECTION_REQUIRED') {
        return callback({ success: false, error: `Cannot move pieces during ${state.phase} phase` });
      }
      
      // Capture piecesAtTurnStart on FIRST move of a turn (if not already set)
      if (!state.piecesAtTurnStart || state.piecesAtTurnStart.length === 0) {
        state.piecesAtTurnStart = state.pieces.map(p => ({...p}));
        console.log(`[KRED] Captured piecesAtTurnStart (${state.piecesAtTurnStart.length} pieces)`);
      }
      
      state.pieces = pieces;
      if (movedPiecesThisTurn !== undefined) {
        state.movedPiecesThisTurn = movedPiecesThisTurn;
      }
      
      // Store playerIndex on socket for filtered broadcasts
      socket.data = socket.data || {};
      socket.data.playerIndex = playerIndex;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast piece positions to all players (pieces are public info)
      const pieceBroadcast = { 
        gameState: {
          pieces: state.pieces,
          movedPiecesThisTurn: state.movedPiecesThisTurn,
          currentPlayerIndex: state.currentPlayerIndex,
          phase: state.phase,
          playerCount: state.playerCount,
        }
      };
      socket.emit('kred:stateUpdate', pieceBroadcast);
      socket.to(`kred:${roomId}`).emit('kred:stateUpdate', pieceBroadcast);
      
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error moving piece:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // End current player's turn
  socket.on('kred:campaign:endTurn', async (data, callback) => {
    const { roomId, playerIndex } = data;
    
    try {
      console.log(`[KRED] End turn / correction complete for room ${roomId}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);

      // TURN VALIDATION: Only the active player can end their turn
      if (playerIndex !== undefined && playerIndex !== state.currentPlayerIndex) {
        return callback({ success: false, error: `It's not your turn` });
      }
      
      if (state.phase === 'CORRECTION_REQUIRED') {
        if (state.receiverAdvanceInProgress) {
          // Receiver finished their free Advance move
          console.log(`[KRED] Receiver free Advance complete - finalizing turn`);
          state.receiverAdvanceInProgress = false;
          finalizeCampaignTurn(state);
        } else if (state.receiverFreeAdvancePending) {
          // Mover finished correction — validate before proceeding
          const validation = validateCorrectionMoves(state);
          if (!validation.valid) {
            console.log(`[KRED] Correction validation failed: ${validation.error}`);
            // Auto-reset pieces to original positions
            if (state.playedTile?.originalPieces) {
              state.pieces = state.playedTile.originalPieces.map(p => ({...p}));
            }
            state.movedPiecesThisTurn = [];
            await db.query(
              `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
              [JSON.stringify(state), roomId.toLowerCase()]
            );
            await broadcastFilteredState(io, roomId, state, db);
            return callback({ success: false, error: validation.error });
          }
          console.log(`[KRED] Correction complete - receiver gets free Advance`);
          state.receiverFreeAdvancePending = false;
          state.receiverAdvanceInProgress = true;
          state.movedPiecesThisTurn = [];
          // Switch to receiver as active player
          const receiverId = state.playedTile?.receivingPlayerId;
          const receiverIndex = state.players.findIndex(p => p.id === receiverId);
          if (receiverIndex !== -1) {
            state.currentPlayerIndex = receiverIndex;
          }
        } else {
          // Mover finished making the correct play — validate before finalizing
          const validation = validateCorrectionMoves(state);
          if (!validation.valid) {
            console.log(`[KRED] Correction validation failed: ${validation.error}`);
            // Auto-reset pieces to original positions
            if (state.playedTile?.originalPieces) {
              state.pieces = state.playedTile.originalPieces.map(p => ({...p}));
            }
            state.movedPiecesThisTurn = [];
            await db.query(
              `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
              [JSON.stringify(state), roomId.toLowerCase()]
            );
            await broadcastFilteredState(io, roomId, state, db);
            return callback({ success: false, error: validation.error });
          }
          console.log(`[KRED] Correction complete - finalizing turn`);
          finalizeCampaignTurn(state);
        }
      } else if (state.phase === 'CAMPAIGN') {
        // Edge case: mover explicitly ends turn without playing a tile
        // This shouldn't normally happen but handle gracefully
        console.log(`[KRED] Mover ended turn during CAMPAIGN phase`);
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
        state.hasPlayedTileThisTurn = false;
        state.movedPiecesThisTurn = [];
        state.piecesAtTurnStart = state.pieces.map(p => ({...p}));
      } else {
        return callback({ success: false, error: `Cannot end turn during ${state.phase}` });
      }
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast filtered state to each player
      await broadcastFilteredState(io, roomId, state, db);
      
      console.log(`[KRED] Turn ended. Phase: ${state.phase}, Now player ${state.currentPlayerIndex}'s turn`);
      callback({ success: true, currentPlayerIndex: state.currentPlayerIndex, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error ending turn:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Receiver accepts or rejects (exposes) the played tile
  socket.on('kred:campaign:receiverDecision', async (data, callback) => {
    const { roomId, accepted, playerIndex: senderIndex } = data;
    
    try {
      console.log(`[KRED] Receiver decision: ${accepted ? 'ACCEPT' : 'EXPOSE'}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Validate phase
      if (state.phase !== 'PENDING_ACCEPTANCE') {
        return callback({ success: false, error: `Cannot accept/reject during ${state.phase}` });
      }
      
      const receiverId = state.playedTile?.receivingPlayerId || state.tileTransaction?.receiverId;
      const moverId = state.playedTile?.playerId || state.tileTransaction?.placerId;

      // IDENTITY VALIDATION: Only the actual receiver can accept/reject
      const receiverPlayer = state.players.find(p => p.id === receiverId);
      const receiverIdx = receiverPlayer ? state.players.indexOf(receiverPlayer) : -1;
      if (senderIndex !== undefined && receiverIdx !== -1 && senderIndex !== receiverIdx) {
        return callback({ success: false, error: 'Only the tile receiver can accept or reject' });
      }
      
      if (accepted) {
        // ACCEPTED: Move to challenge phase
        // Tile goes to Accept Line, bystanders can now challenge
        state.phase = 'PENDING_CHALLENGE';
        state.receiverAccepted = true;
        
        // Calculate bystanders (clockwise from receiver, excluding mover and receiver)
        const receiverIndex = state.players.findIndex(p => p.id === receiverId);
        const bystanderPlayers = [];
        
        for (let i = 1; i < state.playerCount; i++) {
          const idx = (receiverIndex + i) % state.playerCount;
          const player = state.players[idx];
          if (player.id !== moverId && player.id !== receiverId) {
            // Only players with credibility can challenge
            if (player.credibility > 0) {
              bystanderPlayers.push(player);
            }
          }
        }
        
        state.bystanders = bystanderPlayers;
        state.bystanderIndex = 0;
        
        if (bystanderPlayers.length > 0) {
          // Set current player to first bystander
          const firstBystanderIndex = state.players.findIndex(
            p => p.id === bystanderPlayers[0].id
          );
          state.currentPlayerIndex = firstBystanderIndex;
          console.log(`[KRED] ${bystanderPlayers.length} bystanders can challenge. First: player ${firstBystanderIndex}`);
        } else {
          // No bystanders with credibility - tile accepted, receiver becomes next mover
          console.log(`[KRED] No bystanders can challenge - finalizing tile play`);
          finalizeCampaignTurn(state);
        }
      } else {
        // EXPOSED (Rejected): Receiver exposes the dishonest tile
        // Per manual:
        // - Receiver restores up to 2 credibility OR gets a free Advance (choice pending)
        // - Mover returns pieces to original, makes play per tile, incurs 1 credibility notch
        // - Tile placed face-up in receiver's bank (no funding value)
        
        state.phase = 'CORRECTION_REQUIRED';
        state.receiverAccepted = false;
        state.wasExposed = true;
        
        // Revert pieces to the state before mover moved them
        if (state.playedTile?.originalPieces) {
          state.pieces = state.playedTile.originalPieces.map(p => ({...p}));
        }
        
        // Clear moved pieces so mover can make fresh moves
        state.movedPiecesThisTurn = [];
        
        // Per manual: Receiver reward is a CHOICE - restore up to 2 notches OR free Advance
        // Mark as pending so client can show choice UI
        state.pendingReceiverReward = true;
        
        // Mover loses 1 credibility
        const mover = state.players.find(p => p.id === moverId);
        if (mover && mover.credibility > 0) {
          mover.credibility -= 1;
          console.log(`[KRED] Mover credibility reduced to ${mover.credibility}`);
        }
        
        // Tile stays in drop location during correction, moved to bank face-up at finalization
        
        // Set current player to mover for correction
        const moverIndex = state.players.findIndex(p => p.id === moverId);
        if (moverIndex !== -1) {
          state.currentPlayerIndex = moverIndex;
        }
      }
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast filtered state to each player
      await broadcastFilteredState(io, roomId, state, db);
      
      console.log(`[KRED] Receiver decision processed. Phase: ${state.phase}`);
      callback({ success: true, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error processing receiver decision:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Receiver reward choice after exposing a dishonest play
  // Per manual: Receiver restores up to 2 notches on Credibility Token OR takes a free Advance action
  socket.on('kred:campaign:receiverReward', async (data, callback) => {
    const { roomId, choice } = data; // choice: 'credibility' or 'advance'
    
    try {
      console.log(`[KRED] Receiver reward choice: ${choice}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      if (!state.pendingReceiverReward) {
        return callback({ success: false, error: 'No pending receiver reward' });
      }
      
      const receiverId = state.playedTile?.receivingPlayerId || state.tileTransaction?.receiverId;
      const receiver = state.players.find(p => p.id === receiverId);
      
      if (!receiver) {
        return callback({ success: false, error: 'Receiver not found' });
      }
      
      if (choice === 'credibility') {
        // Restore up to 2 notches (max 3)
        const oldCred = receiver.credibility;
        receiver.credibility = Math.min(3, receiver.credibility + 2);
        console.log(`[KRED] Receiver chose credibility restore: ${oldCred} -> ${receiver.credibility}`);
      } else if (choice === 'advance') {
        // Free Advance: receiver gets to make one Advance move after mover corrects
        state.receiverFreeAdvancePending = true;
        console.log(`[KRED] Receiver chose free Advance - will execute after mover correction`);
      }
      
      state.pendingReceiverReward = false;
      
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      await broadcastFilteredState(io, roomId, state, db);
      
      console.log(`[KRED] Receiver reward processed: ${choice}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error processing receiver reward:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Handle challenger's decision (challenge/pass)
  socket.on('kred:campaign:challengerDecision', async (data, callback) => {
    const { roomId, challenge, challengeResult, playerIndex: senderIndex } = data;
    
    try {
      console.log(`[KRED] Challenger decision: ${challenge ? 'CHALLENGE' : 'PASS'}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      if (state.phase !== 'PENDING_CHALLENGE') {
        return callback({ success: false, error: `Cannot challenge during ${state.phase}` });
      }

      // IDENTITY VALIDATION: Only the current bystander can submit a challenge decision
      const currentBystander = (state.bystanders || [])[state.bystanderIndex || 0];
      if (currentBystander && senderIndex !== undefined) {
        const bystanderIdx = state.players.findIndex(p => p.id === currentBystander.id);
        if (bystanderIdx !== -1 && senderIndex !== bystanderIdx) {
          return callback({ success: false, error: 'It is not your turn to challenge' });
        }
      }
      
      const moverId = state.playedTile?.playerId;
      const receiverId = state.playedTile?.receivingPlayerId;
      
      if (challenge) {
        // CHALLENGED: Apply consequences based on challengeResult from client
        if (!challengeResult) {
          return callback({ success: false, error: 'Missing challenge result data' });
        }
        
        // Use server's bystander tracking as authoritative challenger identity
        const currentBystander = (state.bystanders || [])[state.bystanderIndex || 0];
        const challengerId = currentBystander?.id || challengeResult.challengerId;
        
        console.log(`[KRED] Challenge result:`, challengeResult, `challengerId: ${challengerId}`);
        
        if (challengeResult.isPerfect) {
          // Challenge FAILED - play was honest (WITCH HUNT)
          // Per manual: Mover restores 1 credibility IF they had credibility at the start of that turn
          const mover = state.players.find(p => p.id === moverId);
          const moverHadCredAtStart = (state.moverCredibilityAtTurnStart || 0) > 0;
          if (mover && moverHadCredAtStart && mover.credibility < 3) {
            mover.credibility += 1;
            console.log(`[KRED] Honest play - Mover restores credibility to ${mover.credibility}`);
          } else if (!moverHadCredAtStart) {
            console.log(`[KRED] Honest play - Mover had no credibility at turn start, no restore`);
          }
          
          // Challenger loses 1 credibility
          const challenger = state.players.find(p => p.id === challengerId);
          if (challenger && challenger.credibility > 0) {
            challenger.credibility -= 1;
            console.log(`[KRED] Unsuccessful challenge - Challenger credibility: ${challenger.credibility}`);
          } else {
            console.warn(`[KRED] Could not find challenger with id ${challengerId} to deduct credibility`);
          }
          
          // Tile revealed for all (challengeWasMade = true)
          state.challengeWasMade = true;
          
          // Tile goes to receiver face-down (counts as funding)
          // Finalize the turn - receiver becomes next mover
          finalizeCampaignTurn(state);
          
        } else {
          // Challenge SUCCEEDED - play was dishonest (SMOKING GUN)
          // Per manual: Mover loses 1 credibility. If 0 credibility at start of turn, must Withdraw
          const mover = state.players.find(p => p.id === moverId);
          const moverHadCredAtStart = (state.moverCredibilityAtTurnStart || 0) > 0;
          if (mover) {
            if (moverHadCredAtStart && mover.credibility > 0) {
              mover.credibility -= 1;
              console.log(`[KRED] Dishonest play caught - Mover credibility: ${mover.credibility}`);
            } else if (!moverHadCredAtStart) {
              // 0 credibility at start of turn - must take Withdraw action
              state.moverMustWithdraw = true;
              console.log(`[KRED] Mover had 0 credibility at turn start - must Withdraw`);
            } else {
              // Current credibility already 0 but had it at start
              console.log(`[KRED] Mover credibility already at 0`);
            }
          }
          
          // Receiver loses 1 credibility (accepted a dishonest play)
          const receiver = state.players.find(p => p.id === receiverId);
          if (receiver && receiver.credibility > 0) {
            receiver.credibility -= 1;
            console.log(`[KRED] Receiver accepted dishonest play - credibility: ${receiver.credibility}`);
          }
          
          // Challenger gets to choose: restore 1 credibility OR take advantage (use funding)
          state.challengeSucceeded = true;
          state.challengeWasMade = true;
          state.challengerId = challengerId;
          state.pendingChallengerReward = true;
          
          const challenger = state.players.find(p => p.id === challengerId);
          console.log(`[KRED] Challenger ${challengerId} gets reward choice. Credibility: ${challenger?.credibility}, Tiles: ${challenger?.bureaucracyTiles?.length || 0}`);
          
          // Revert pieces to original positions
          if (state.playedTile?.originalPieces) {
            state.pieces = state.playedTile.originalPieces.map(p => ({...p}));
          }
          
          // Clear moved pieces so mover can make fresh correction moves
          state.movedPiecesThisTurn = [];
          
          // Tile stays in drop location during correction, moved to bank face-up at finalization
          
          // Set phase to CORRECTION_REQUIRED - mover must make correct play
          state.phase = 'CORRECTION_REQUIRED';
          
          // Set current player to mover for correction
          const moverIndex = state.players.findIndex(p => p.id === moverId);
          if (moverIndex !== -1) {
            state.currentPlayerIndex = moverIndex;
          }
          
          // Tile goes face-up in receiver's bank (no funding value)
        }
      } else {
        // PASS: Move to next bystander or finalize
        const nextBystanderIndex = (state.bystanderIndex || 0) + 1;
        
        if (nextBystanderIndex >= (state.bystanders || []).length) {
          // No more bystanders - all passed, finalize turn
          console.log(`[KRED] All bystanders passed - finalizing`);
          finalizeCampaignTurn(state);
          
        } else {
          // Move to next bystander
          state.bystanderIndex = nextBystanderIndex;
          const nextBystander = state.bystanders[nextBystanderIndex];
          const nextBystanderPlayerIndex = state.players.findIndex(p => p.id === nextBystander.id);
          state.currentPlayerIndex = nextBystanderPlayerIndex;
          console.log(`[KRED] Next bystander: player ${nextBystanderPlayerIndex}`);
        }
      }
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast filtered state
      await broadcastFilteredState(io, roomId, state, db);
      
      console.log(`[KRED] Challenger decision processed. Phase: ${state.phase}`);
      callback({ success: true, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error processing challenger decision:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Challenger reward choice after successful challenge
  socket.on('kred:campaign:challengerReward', async (data, callback) => {
    const { roomId, choice } = data; // choice: 'credibility' or 'advantage'
    
    try {
      console.log(`[KRED] Challenger reward choice: ${choice}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      if (!state.pendingChallengerReward) {
        return callback({ success: false, error: 'No pending challenger reward' });
      }
      
      const challengerId = state.challengerId;
      const challenger = state.players.find(p => p.id === challengerId);
      
      if (!challenger) {
        return callback({ success: false, error: 'Challenger not found' });
      }
      
      if (choice === 'credibility') {
        // Restore 1 credibility (max 3)
        const oldCred = challenger.credibility;
        challenger.credibility = Math.min(3, challenger.credibility + 1);
        console.log(`[KRED] Challenger chose credibility: ${oldCred} → ${challenger.credibility}`);
      }
      // 'advantage' choice: client handles the bureaucracy action locally
      // (tile selection + action purchase is done client-side)
      
      // Clear the pending reward flag
      state.pendingChallengerReward = false;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast updated state
      await broadcastFilteredState(io, roomId, state, db);
      
      console.log(`[KRED] Challenger reward processed: ${choice}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error processing challenger reward:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // ============================================================================
  // BUREAUCRACY PHASE HANDLERS
  // ============================================================================
  
  // Transition to Bureaucracy phase
  socket.on('kred:bureaucracy:start', async (data, callback) => {
    const { roomId } = data;
    
    try {
      console.log(`[KRED] Starting Bureaucracy phase for room ${roomId}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      state.phase = 'BUREAUCRACY';
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.to(`kred:${roomId}`).emit('kred:bureaucracy:started', { 
        phase: 'BUREAUCRACY'
      });
      
      console.log(`[KRED] Bureaucracy phase started for room ${roomId}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error starting bureaucracy:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Purchase in Bureaucracy phase
  socket.on('kred:bureaucracy:purchase', async (data, callback) => {
    const { roomId, playerIndex, purchase } = data;
    
    try {
      console.log(`[KRED] Bureaucracy purchase: player ${playerIndex}`, purchase);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);

      // PHASE VALIDATION
      if (state.phase !== 'BUREAUCRACY') {
        return callback({ success: false, error: `Cannot purchase during ${state.phase} phase` });
      }

      // BOUNDS VALIDATION: playerIndex must be valid
      if (playerIndex < 0 || playerIndex >= state.players.length) {
        return callback({ success: false, error: 'Invalid player index' });
      }
      
      // Track purchases in player state
      if (!state.players[playerIndex].bureaucracyPurchases) {
        state.players[playerIndex].bureaucracyPurchases = [];
      }
      state.players[playerIndex].bureaucracyPurchases.push(purchase);
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.to(`kred:${roomId}`).emit('kred:bureaucracy:purchase_made', { 
        playerIndex,
        purchase
      });
      
      console.log(`[KRED] Purchase recorded for player ${playerIndex}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error recording purchase:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // ============================================================================
  // PIECE & TOKEN HANDLERS
  // ============================================================================
  
  // Update credibility token for a player
  socket.on('kred:set_token', async (data, callback) => {
    const { roomId, playerIndex, credibility } = data;
    
    try {
      console.log(`[KRED] Set token: player ${playerIndex}, credibility ${credibility}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      state.players[playerIndex].credibility = credibility;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast all tokens to all players
      const tokens = state.players.map(p => p.credibility);
      io.to(`kred:${roomId}`).emit('kred:tokens_update', { tokens });
      
      console.log(`[KRED] Tokens updated:`, tokens);
      callback({ success: true, tokens });
    } catch (error) {
      console.error('[KRED] Error setting token:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Update piece positions on the board
  socket.on('kred:set_position', async (data, callback) => {
    const { roomId, pieces, community } = data;
    
    try {
      console.log(`[KRED] Set position: ${pieces.length} pieces, community size ${community.length}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      state.pieces = pieces;
      state.community = community;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to OTHER players (sender already updated locally)
      socket.to(`kred:${roomId}`).emit('kred:position_update', { pieces, community });
      
      console.log(`[KRED] Position updated and broadcast`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error setting position:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Handle player disconnect
  socket.on('disconnect', async () => {
    try {
      console.log(`[KRED] Socket ${socket.id} disconnected`);
      
      // Find any rooms this socket was in and mark player as disconnected
      // Note: This would require tracking socket.id to player_id mapping
      // For now, we rely on room:rejoin to reconnect players
    } catch (error) {
      console.error('[KRED] Error handling disconnect:', error);
    }
  });

  console.log('[KRED] Game handlers registered for socket', socket.id);
};
