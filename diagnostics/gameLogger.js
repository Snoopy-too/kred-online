/**
 * Diagnostic Game Logger for Kred boardgame.io engine.
 * Records every tile played, piece movement, challenge, turn reset, and phase change in sequence.
 */
export class GameLogger {
  constructor(matchID = 'local', numPlayers = 3) {
    this.matchID = matchID;
    this.numPlayers = numPlayers;
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.winner = null;
    this.events = [];
    this.lastStateID = null;
    this.lastPendingStep = null;
    this.lastTurn = null;
    this.lastPhase = null;
    this.listeners = new Set();

    this.logEvent({
      actionType: 'GAME_START',
      details: { matchID, numPlayers }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getLogPayload()));
  }

  logEvent({ phase, turn, playerID, actionType, details, boardState }) {
    const seq = this.events.length + 1;
    const timestamp = new Date().toISOString();

    const event = {
      seq,
      timestamp,
      phase: phase || this.lastPhase || 'unknown',
      turn: turn ?? this.lastTurn ?? 0,
      playerID: playerID !== undefined ? String(playerID) : undefined,
      actionType,
      details: details ? JSON.parse(JSON.stringify(details)) : {},
      boardState: boardState ? JSON.parse(JSON.stringify(boardState)) : undefined
    };

    this.events.push(event);
    this.notify();
  }

  handleStateChange(state) {
    if (!state || !state.G || !state.ctx) return;

    const stateID = state._stateID;
    if (stateID === this.lastStateID) return;
    this.lastStateID = stateID;

    const { G, ctx } = state;
    const currentPhase = ctx.phase || 'default';
    const currentTurn = ctx.turn || 0;
    const currentPlayer = String(ctx.currentPlayer);

    // Track phase change
    if (this.lastPhase && this.lastPhase !== currentPhase) {
      this.logEvent({
        phase: currentPhase,
        turn: currentTurn,
        actionType: 'PHASE_CHANGE',
        details: { from: this.lastPhase, to: currentPhase }
      });
    }
    this.lastPhase = currentPhase;

    // Track turn reset / progression
    if (this.lastTurn !== null && this.lastTurn !== currentTurn) {
      this.logEvent({
        phase: currentPhase,
        turn: currentTurn,
        playerID: currentPlayer,
        actionType: 'TURN_CHANGE',
        details: { previousTurn: this.lastTurn, newTurn: currentTurn, activePlayer: currentPlayer }
      });
    }
    this.lastTurn = currentTurn;

    // Track winner / end game
    if (G.winner && !this.winner) {
      this.winner = G.winner;
      this.endTime = new Date().toISOString();
      this.logEvent({
        phase: currentPhase,
        turn: currentTurn,
        actionType: 'GAME_OVER',
        details: { winner: G.winner }
      });
    }

    // Track pendingPlay state machine (Tile Plays & Challenges)
    const pending = G.pendingPlay;
    if (pending) {
      const pendingKey = `${pending.step}_${pending.moverId}_${pending.tileIdPlayed}_${pending.challengesPassed?.length || 0}`;
      if (this.lastPendingStep !== pendingKey) {
        this.lastPendingStep = pendingKey;

        if (pending.step === 'receipt') {
          this.logEvent({
            phase: currentPhase,
            turn: currentTurn,
            playerID: pending.moverId,
            actionType: 'TILE_PLAYED',
            details: {
              tileId: pending.tileIdPlayed,
              receiverId: pending.receiverId,
              moverId: pending.moverId,
              playType: pending.playType,
              movesMade: pending.movesMade
            },
            boardState: G.boardState
          });
        } else if (pending.step === 'challenge') {
          this.logEvent({
            phase: currentPhase,
            turn: currentTurn,
            playerID: currentPlayer,
            actionType: 'CHALLENGE_PHASE_STEP',
            details: {
              step: 'challenge',
              moverId: pending.moverId,
              receiverId: pending.receiverId,
              challengesPassed: pending.challengesPassed || [],
              tileIdPlayed: pending.tileIdPlayed
            }
          });
        } else if (pending.step === 'reexecute') {
          this.logEvent({
            phase: currentPhase,
            turn: currentTurn,
            playerID: pending.moverId,
            actionType: 'TURN_RESET_REEXECUTE',
            details: {
              reason: 'Challenge succeeded or tile rejected',
              moverId: pending.moverId,
              tileIdToReexecute: pending.reexecuteTileId,
              receiverFreeAdvance: pending.receiverFreeAdvance || false
            },
            boardState: G.boardState
          });
        } else if (pending.step === 'penaltyWithdraw') {
          this.logEvent({
            phase: currentPhase,
            turn: currentTurn,
            playerID: pending.moverId,
            actionType: 'PENALTY_WITHDRAW_REQUIRED',
            details: { moverId: pending.moverId }
          });
        } else if (pending.step === 'freeAdvance') {
          this.logEvent({
            phase: currentPhase,
            turn: currentTurn,
            playerID: pending.receiverId,
            actionType: 'FREE_ADVANCE_GRANTED',
            details: { receiverId: pending.receiverId }
          });
        }
      }
    } else {
      this.lastPendingStep = null;
    }
  }

  getLogPayload() {
    return {
      matchID: this.matchID,
      numPlayers: this.numPlayers,
      startTime: this.startTime,
      endTime: this.endTime,
      winner: this.winner,
      totalEvents: this.events.length,
      events: this.events
    };
  }

  async saveToFile() {
    const payload = this.getLogPayload();
    try {
      const res = await fetch('/api/diagnostics/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[GameLogger] Failed to save log to file:', err);
      return { success: false, error: err.message };
    }
  }
}
