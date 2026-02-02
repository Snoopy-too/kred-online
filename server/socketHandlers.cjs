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
  
  // Deal tiles evenly to players
  let tileIndex = 0;
  while (tileIndex < shuffledTiles.length) {
    for (let i = 0; i < playerCount && tileIndex < shuffledTiles.length; i++) {
      players[i].hand.push(shuffledTiles[tileIndex]);
      tileIndex++;
    }
  }
  
  return players;
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
      io.in(`kred:${roomId}`).emit('kred:stateUpdate', {
        players: initialState.players,
        phase: initialState.phase,
        livePlayerIndex: initialState.livePlayerIndex,
        currentPlayerIndex: initialState.currentPlayerIndex
      });

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
      io.in(`kred:${roomId}`).emit('kred:stateUpdate', broadcastData);
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
    const { roomId } = data;
    
    try {
      console.log(`[KRED] Game start requested for room: ${roomId}`);
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
      state.phase = 'DRAFTING';
      state.playerCount = playerCount;
      // Save updated state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      // Broadcast game start with full game state to all players
      io.to(`kred:${roomId}`).emit('kred:game:started', {
        playerCount: playerCount,
        initialGameState: state
      });
      console.log(`[KRED] Game ${roomId} started with ${playerCount} players (tiles dealt)`);
      callback({ success: true, playerCount: playerCount, initialGameState: state });
    } catch (error) {
      console.error('[KRED] Error starting game:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Request game state (for players loading the game after it started)
  socket.on('kred:request:state', async (data, callback) => {
    const { roomId } = data;
    
    try {
      console.log(`[KRED] State requested for room: ${roomId}`);
      
      // Join the KRED-specific room to receive updates
      socket.join(`kred:${roomId}`);
      console.log(`[KRED] Socket ${socket.id} joined kred:${roomId}`);
      
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
      
      const initialGameState = gameState.length > 0 ? JSON.parse(gameState[0].game_state) : null;
      
      console.log(`[KRED] Sending state for room ${roomId}:`, {
        playerCount: players[0].player_count,
        hasState: !!initialGameState,
        playersInState: initialGameState?.players?.length || 0,
        phase: initialGameState?.phase
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
  
  // Play a tile to a target player during Campaign phase
  socket.on('kred:campaign:play', async (data, callback) => {
    const { roomId, playerIndex, targetPlayerIndex, tileId, hand } = data;
    
    try {
      console.log(`[KRED] Play tile: player ${playerIndex} → player ${targetPlayerIndex}, tile ${tileId}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Update the target player's played tile
      const tile = state.players[playerIndex].hand.find(t => t.id === tileId);
      if (!tile) {
        return callback({ success: false, error: 'Tile not in hand' });
      }
      
      state.players[targetPlayerIndex].playedTile = tile;
      state.players[playerIndex].hand = hand; // Update hand after removing tile
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast update to all players
      io.to(`kred:${roomId}`).emit('kred:campaign:update', { players: state.players });
      
      console.log(`[KRED] Tile ${tileId} played to player ${targetPlayerIndex}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error playing tile:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Discard a tile after resolving play
  socket.on('kred:campaign:discard', async (data, callback) => {
    const { roomId, playerIndex, tileId, sourcePlayerIndex } = data;
    
    try {
      console.log(`[KRED] Discard tile: player ${playerIndex}, tile ${tileId}, source ${sourcePlayerIndex}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Clear the played tile from source player
      if (sourcePlayerIndex !== undefined) {
        state.players[sourcePlayerIndex].playedTile = null;
      }
      
      // Add tile to player's discarded tiles
      const tile = { id: tileId, flipped: false }; // Tiles start face-down
      if (!state.players[playerIndex].discardedTiles) {
        state.players[playerIndex].discardedTiles = [];
      }
      state.players[playerIndex].discardedTiles.push(tile);
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast update
      io.to(`kred:${roomId}`).emit('kred:campaign:update', { players: state.players });
      
      console.log(`[KRED] Tile ${tileId} discarded by player ${playerIndex}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error discarding tile:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Get all tiles on the board (with proper hiding of opponents' tiles)
  socket.on('kred:campaign:get_tiles', async (data, callback) => {
    const { roomId, playerIndex } = data;
    
    try {
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Build response with hidden information
      const tiles = {
        hands: [],
        playedTiles: [],
        discardedTiles: []
      };
      
      state.players.forEach((player, i) => {
        // Hands: show yours, hide others'
        if (i === playerIndex) {
          tiles.hands[i] = player.hand;
        } else {
          tiles.hands[i] = player.hand.map(() => ({ hidden: true }));
        }
        
        // Played tiles: show if it's your tile, otherwise hide
        if (player.playedTile) {
          tiles.playedTiles[i] = (i === playerIndex) ? player.playedTile : { hidden: true };
        } else {
          tiles.playedTiles[i] = null;
        }
        
        // Discarded tiles: show flipped tiles, hide unflipped
        tiles.discardedTiles[i] = (player.discardedTiles || []).map(tile => 
          tile.flipped ? tile : { hidden: true }
        );
      });
      
      callback({ success: true, tiles });
    } catch (error) {
      console.error('[KRED] Error getting tiles:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Flip a discarded tile face-up (for challenges/reveals)
  socket.on('kred:campaign:flip_tile', async (data, callback) => {
    const { roomId, playerIndex, tileIndex } = data;
    
    try {
      console.log(`[KRED] Flip tile: player ${playerIndex}, tile index ${tileIndex}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      if (!state.players[playerIndex].discardedTiles[tileIndex]) {
        return callback({ success: false, error: 'Tile not found' });
      }
      
      // Flip the tile face-up
      state.players[playerIndex].discardedTiles[tileIndex].flipped = true;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.to(`kred:${roomId}`).emit('kred:tile_flipped', { 
        playerIndex, 
        tileIndex,
        tile: state.players[playerIndex].discardedTiles[tileIndex]
      });
      
      console.log(`[KRED] Tile flipped at player ${playerIndex}, index ${tileIndex}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error flipping tile:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Update current player (turn management)
  socket.on('kred:campaign:next_turn', async (data, callback) => {
    const { roomId, currentPlayerIndex } = data;
    
    try {
      console.log(`[KRED] Next turn: player ${currentPlayerIndex}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      state.currentPlayer = currentPlayerIndex;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.to(`kred:${roomId}`).emit('kred:turn_update', { currentPlayerIndex });
      
      console.log(`[KRED] Turn updated to player ${currentPlayerIndex}`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error updating turn:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // ============================================================================
  // CAMPAIGN PHASE HANDLERS
  // ============================================================================
  
  // Play a tile to another player
  socket.on('kred:campaign:playTile', async (data, callback) => {
    const { roomId, playerIndex, tileId, targetPlayerId } = data;
    
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
      const player = state.players[playerIndex];
      
      // Find and remove tile from hand
      const tileIndex = player.hand.findIndex(t => t.id === tileId || t.id === parseInt(tileId));
      if (tileIndex === -1) {
        return callback({ success: false, error: 'Tile not in hand' });
      }
      
      const tile = player.hand.splice(tileIndex, 1)[0];
      player.playedTile = tile;
      
      // Track that player has played a tile this turn
      state.hasPlayedTileThisTurn = true;
      
      // Create playedTile tracking object
      state.playedTile = {
        tileId: tileId.toString(),
        playerId: player.id,
        receivingPlayerId: targetPlayerId,
        playedAt: Date.now(),
        movesPerformed: [], // Will be populated when turn ends
        originalPieces: state.pieces.map(p => ({...p})), // Snapshot for validation
        gameStateSnapshot: {
          pieces: state.pieces.map(p => ({...p})),
          boardTiles: state.boardTiles.map(b => ({...b}))
        }
      };
      
      // Update phase to PENDING_ACCEPTANCE
      state.phase = 'PENDING_ACCEPTANCE';
      
      // Also keep tileTransaction for legacy compatibility
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
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.in(`kred:${roomId}`).emit('kred:stateUpdate', { 
        gameState: {
          players: state.players,
          phase: state.phase,
          playedTile: state.playedTile,
          tileTransaction: state.tileTransaction,
          hasPlayedTileThisTurn: state.hasPlayedTileThisTurn,
          currentPlayerIndex: state.currentPlayerIndex,
          playerCount: state.playerCount,
          pieces: state.pieces,
          boardTiles: state.boardTiles,
          community: state.community
        }
      });
      
      console.log(`[KRED] Tile ${tileId} played, phase: ${state.phase}`);
      callback({ success: true, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error playing tile:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Move a piece on the board
  socket.on('kred:campaign:movePiece', async (data, callback) => {
    const { roomId, pieces, movedPiecesThisTurn } = data;
    
    try {
      console.log(`[KRED] Updating piece positions: ${pieces.length} pieces`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      state.pieces = pieces;
      if (movedPiecesThisTurn !== undefined) {
        state.movedPiecesThisTurn = movedPiecesThisTurn;
      }
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.in(`kred:${roomId}`).emit('kred:stateUpdate', { 
        gameState: {
          players: state.players,
          pieces: state.pieces,
          movedPiecesThisTurn: state.movedPiecesThisTurn,
          currentPlayerIndex: state.currentPlayerIndex,
          playerCount: state.playerCount,
          phase: state.phase
        }
      });
      
      console.log(`[KRED] Piece positions updated`);
      callback({ success: true });
    } catch (error) {
      console.error('[KRED] Error moving piece:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // End current player's turn
  socket.on('kred:campaign:endTurn', async (data, callback) => {
    const { roomId } = data;
    
    try {
      console.log(`[KRED] Ending turn for room ${roomId}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      // Move to next player
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
      state.phase = 'CAMPAIGN';
      state.hasPlayedTileThisTurn = false;
      state.movedPiecesThisTurn = [];
      
      // Clear transaction
      state.tileTransaction = null;
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.in(`kred:${roomId}`).emit('kred:stateUpdate', { 
        gameState: {
          players: state.players,
          phase: state.phase,
          currentPlayerIndex: state.currentPlayerIndex,
          hasPlayedTileThisTurn: state.hasPlayedTileThisTurn,
          movedPiecesThisTurn: state.movedPiecesThisTurn,
          tileTransaction: state.tileTransaction,
          playerCount: state.playerCount,
          pieces: state.pieces,
          boardTiles: state.boardTiles,
          community: state.community
        }
      });
      
      console.log(`[KRED] Turn ended. Now player ${state.currentPlayerIndex}'s turn`);
      callback({ success: true, currentPlayerIndex: state.currentPlayerIndex });
    } catch (error) {
      console.error('[KRED] Error ending turn:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Receiver accepts or rejects tile
  socket.on('kred:campaign:receiverDecision', async (data, callback) => {
    const { roomId, accepted } = data;
    
    try {
      console.log(`[KRED] Receiver decision: ${accepted ? 'ACCEPT' : 'REJECT'}`);
      
      const [gameState] = await db.query(
        `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
        [roomId.toLowerCase()]
      );
      
      if (gameState.length === 0) {
        return callback({ success: false, error: 'Game not found' });
      }
      
      const state = JSON.parse(gameState[0].game_state);
      
      if (accepted) {
        // Move to pending challenge phase
        state.phase = 'PENDING_CHALLENGE';
      } else {
        // Rejected - return to placer's turn (CAMPAIGN)
        state.phase = 'CAMPAIGN';
        state.tileTransaction = null;
      }
      
      // Save state
      await db.query(
        `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
        [JSON.stringify(state), roomId.toLowerCase()]
      );
      
      // Broadcast to all players
      io.in(`kred:${roomId}`).emit('kred:stateUpdate', { 
        gameState: {
          players: state.players,
          phase: state.phase,
          tileTransaction: state.tileTransaction,
          currentPlayerIndex: state.currentPlayerIndex,
          playerCount: state.playerCount,
          pieces: state.pieces,
          boardTiles: state.boardTiles,
          community: state.community
        }
      });
      
      console.log(`[KRED] Receiver decision processed. Phase: ${state.phase}`);
      callback({ success: true, phase: state.phase });
    } catch (error) {
      console.error('[KRED] Error processing receiver decision:', error);
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
