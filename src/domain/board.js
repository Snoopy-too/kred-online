/**
 * Spatial Domain Graph & Support Rule Enforcer for KRED
 */

// Helper to extract player ID from location string like "p1_seat1", "p2_rostrum1", "p3_office"
export function parseLocation(loc) {
  if (!loc) return null;
  if (loc === 'community' || loc.startsWith('community_')) return { type: 'community' };
  const match = loc.match(/^p(\d+)_(seat|rostrum|office)(\d+)?$/);
  if (!match) return null;
  const domainNum = parseInt(match[1], 10);
  const playerId = String(domainNum - 1); // p1 -> '0', p2 -> '1', p3 -> '2'
  return {
    domainNum,
    playerId,
    type: match[2],
    index: match[3] ? parseInt(match[3], 10) : null
  };
}

// Clockwise player order array based on numPlayers ('0', '1', '2'...)
export function getClockwiseOrder(numPlayers) {
  const order = [];
  for (let i = 0; i < numPlayers; i++) {
    order.push(String(i));
  }
  return order;
}

export function getNextPlayer(currentId, numPlayers) {
  const order = getClockwiseOrder(numPlayers);
  const idx = order.indexOf(String(currentId));
  return order[(idx + 1) % order.length];
}

export function getPrevPlayer(currentId, numPlayers) {
  const order = getClockwiseOrder(numPlayers);
  const idx = order.indexOf(String(currentId));
  return order[(idx - 1 + order.length) % order.length];
}

// Ordered list of eligible challengers starting clockwise from receiverId
export function getOrderedChallengers(G) {
  if (!G || !G.pendingPlay) return [];
  const np = G.numPlayers || 3;
  const recIdx = parseInt(G.pendingPlay.receiverId, 10);
  const list = [];
  for (let i = 1; i < np; i++) {
    const candidateIdx = (recIdx + i) % np;
    const candidateId = String(candidateIdx);
    if (
      candidateId !== G.pendingPlay.moverId &&
      candidateId !== G.pendingPlay.receiverId &&
      (G.players[candidateId]?.credibilityNotchesLost || 0) < 3
    ) {
      list.push(candidateId);
    }
  }
  return list;
}

export function getActiveChallenger(G) {
  if (!G || !G.pendingPlay || G.pendingPlay.step !== 'challenge') return null;
  const challengers = getOrderedChallengers(G);
  const remaining = challengers.filter(
    id => !(G.pendingPlay.challengesPassed || []).includes(id)
  );
  return remaining.length > 0 ? remaining[0] : null;
}

export function getPendingPlayActivePlayer(G) {
  if (!G || !G.pendingPlay) return null;
  const { step, receiverId, moverId } = G.pendingPlay;
  if (step === 'receipt') return receiverId;
  if (step === 'challenge') return getActiveChallenger(G);
  if (step === 'reexecute' || step === 'penaltyWithdraw') return moverId;
  if (step === 'freeAdvance') return receiverId;
  return null;
}

// Checks if seat A and seat B are adjacent
export function areSeatsAdjacent(locA, locB, numPlayers) {
  const pA = parseLocation(locA);
  const pB = parseLocation(locB);
  if (!pA || !pB || pA.type !== 'seat' || pB.type !== 'seat') return false;

  // Same domain
  if (pA.playerId === pB.playerId) {
    return Math.abs(pA.index - pB.index) === 1;
  }

  // Cross-domain wrapping
  const nextP = getNextPlayer(pA.playerId, numPlayers);
  const prevP = getPrevPlayer(pA.playerId, numPlayers);

  if (pB.playerId === nextP && pA.index === 6 && pB.index === 1) return true;
  if (pB.playerId === prevP && pA.index === 1 && pB.index === 6) return true;

  return false;
}

// Checks if rostrum A and rostrum B are adjacent
export function areRostrumsAdjacent(locA, locB, numPlayers) {
  const pA = parseLocation(locA);
  const pB = parseLocation(locB);
  if (!pA || !pB || pA.type !== 'rostrum' || pB.type !== 'rostrum') return false;

  // Rostrums within same domain are NOT adjacent
  if (pA.playerId === pB.playerId) return false;

  const nextP = getNextPlayer(pA.playerId, numPlayers);
  const prevP = getPrevPlayer(pA.playerId, numPlayers);

  if (pB.playerId === nextP && pA.index === 2 && pB.index === 1) return true;
  if (pB.playerId === prevP && pA.index === 1 && pB.index === 2) return true;

  return false;
}

// Automatic Support Rule Enforcement
export function enforceSupportRule(boardState, numPlayers) {
  let changed = false;
  const newBoard = JSON.parse(JSON.stringify(boardState));

  for (let p = 0; p < numPlayers; p++) {
    const domainKey = `p${p + 1}`;
    const officeLoc = `${domainKey}_office`;
    const r1Loc = `${domainKey}_rostrum1`;
    const r2Loc = `${domainKey}_rostrum2`;

    // 1. Office Check: If Office has piece but BOTH rostrums empty -> move Office piece to Rostrum 1
    if (newBoard[officeLoc] && !newBoard[r1Loc] && !newBoard[r2Loc]) {
      newBoard[r1Loc] = newBoard[officeLoc];
      newBoard[officeLoc] = null;
      changed = true;
    }

    // 2. Rostrum 1 Check: If Rostrum 1 has piece but Seats 1, 2, 3 ALL empty -> move to Seat 1
    const f1Seats = [`${domainKey}_seat1`, `${domainKey}_seat2`, `${domainKey}_seat3`].map(s => newBoard[s]);
    if (newBoard[r1Loc] && f1Seats.every(s => s === null)) {
      newBoard[`${domainKey}_seat1`] = newBoard[r1Loc];
      newBoard[r1Loc] = null;
      changed = true;
    }

    // 3. Rostrum 2 Check: If Rostrum 2 has piece but Seats 4, 5, 6 ALL empty -> move to Seat 4
    const f2Seats = [`${domainKey}_seat4`, `${domainKey}_seat5`, `${domainKey}_seat6`].map(s => newBoard[s]);
    if (newBoard[r2Loc] && f2Seats.every(s => s === null)) {
      newBoard[`${domainKey}_seat4`] = newBoard[r2Loc];
      newBoard[r2Loc] = null;
      changed = true;
    }
  }

  if (changed) {
    // Recursively enforce if cascades occur
    return enforceSupportRule(newBoard, numPlayers);
  }

  return newBoard;
}

// Victory Condition Checker (Section 8.1)
export function checkVictory(boardState, pId) {
  const domainKey = `p${parseInt(pId, 10) + 1}`;
  const seatsOccupied = [1, 2, 3, 4, 5, 6].every(i => boardState[`${domainKey}_seat${i}`] !== null);
  const rostrum1Heel = boardState[`${domainKey}_rostrum1`]?.type === 'Heel';
  const rostrum2Heel = boardState[`${domainKey}_rostrum2`]?.type === 'Heel';
  const officePawn = boardState[`${domainKey}_office`]?.type === 'Pawn';

  return seatsOccupied && rostrum1Heel && rostrum2Heel && officePawn;
}

export function isPlayerActionRequired(pId, gameState) {
  if (!gameState || !gameState.G || !gameState.ctx) return false;

  const { G, ctx } = gameState;
  const pStr = String(pId);

  // 1. Pending Play Action (Receipt accept/expose, Challenge/pass, Re-execute honest, Penalty withdraw, Free advance)
  if (G.pendingPlay) {
    const activePendingPlayer = getPendingPlayActivePlayer(G);
    return activePendingPlayer !== null && String(activePendingPlayer) === pStr;
  }

  // 2. Draft Phase
  if (ctx.phase === 'draft') {
    const playerPack = G.draftPacks ? G.draftPacks[pStr] : null;
    const hasTilesInPack = Array.isArray(playerPack) && playerPack.length > 0;
    const hasNotSelectedThisRound = !G.draftSelectionsThisRound?.[pStr];
    return hasTilesInPack && hasNotSelectedThisRound;
  }

  // 3. Turn-based Phase (Campaign, Bureaucracy)
  if (ctx.currentPlayer !== undefined && ctx.currentPlayer !== null) {
    return String(ctx.currentPlayer) === pStr;
  }

  return false;
}

