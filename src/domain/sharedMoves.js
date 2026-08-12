import { INVALID_MOVE } from 'boardgame.io/core';
import { TILES } from './types.js';

export function sanitizeLoadedState(targetG) {
  if (!targetG || !targetG.players) return;

  const ALL_TILE_IDS = Object.keys(TILES).filter(k => k !== 'BLANK');
  const usedTileIds = new Set();

  Object.values(targetG.players).forEach(p => {
    (p.hand || []).forEach(t => { if (t && t !== 'HIDDEN') usedTileIds.add(t); });
    (p.bank || []).forEach(b => { if (b && b.tileId && b.tileId !== 'HIDDEN') usedTileIds.add(b.tileId); });
  });

  const unusedTiles = ALL_TILE_IDS.filter(id => !usedTileIds.has(id));

  Object.values(targetG.players).forEach(p => {
    if (p.hand) {
      p.hand = p.hand.map(t => {
        if (t === 'HIDDEN' || !t) {
          return unusedTiles.pop() || '01';
        }
        return t;
      });
    }
    if (p.bank) {
      p.bank = p.bank.map(b => {
        if (b && b.tileId === 'HIDDEN') {
          return { ...b, tileId: unusedTiles.pop() || '01' };
        }
        return b;
      });
    }
  });
}

export function handleLoadSaveState({ G, ctx, events }, savedSnapshot) {
  if (!savedSnapshot || typeof savedSnapshot !== 'object') return INVALID_MOVE;

  const targetG = savedSnapshot.G || savedSnapshot;
  if (!targetG || typeof targetG !== 'object') return INVALID_MOVE;

  sanitizeLoadedState(targetG);

  if (targetG.boardState) G.boardState = JSON.parse(JSON.stringify(targetG.boardState));
  if (targetG.community) G.community = JSON.parse(JSON.stringify(targetG.community));
  if (targetG.players) G.players = JSON.parse(JSON.stringify(targetG.players));
  if (targetG.draftPacks) G.draftPacks = JSON.parse(JSON.stringify(targetG.draftPacks));
  if (targetG.draftSelectionsThisRound) G.draftSelectionsThisRound = JSON.parse(JSON.stringify(targetG.draftSelectionsThisRound));
  if (targetG.numPlayers) G.numPlayers = targetG.numPlayers;
  G.pendingPlay = targetG.pendingPlay ? JSON.parse(JSON.stringify(targetG.pendingPlay)) : null;
  G.nextMoverId = targetG.nextMoverId !== undefined ? targetG.nextMoverId : null;
  G.winner = targetG.winner || null;
  if (targetG.history) G.history = JSON.parse(JSON.stringify(targetG.history));

  const targetPhase = savedSnapshot.phase || targetG.phase;
  if (targetPhase && events && events.setPhase) {
    events.setPhase(targetPhase);
  }

  const targetPlayer = savedSnapshot.currentPlayer !== undefined ? savedSnapshot.currentPlayer : targetG.currentPlayer;
  if (targetPlayer !== undefined && events && events.endTurn) {
    events.endTurn({ next: String(targetPlayer) });
  }
}
