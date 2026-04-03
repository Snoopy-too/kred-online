import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';

type ActionHandler = (action: { type: string; playerId: string; payload: any }) => void;

export function useSupabaseActions() {
  const { lobbyId, userId, isHost } = useLobby();
  const onActionReceivedRef = useRef<ActionHandler | null>(null);

  /**
   * Register a handler for incoming actions (host only).
   * When the host emits an action, it processes locally instead of writing to DB.
   */
  const setActionHandler = useCallback((handler: ActionHandler) => {
    onActionReceivedRef.current = handler;
  }, []);

  /**
   * Emit a game action.
   * - Host: processes locally via onActionReceivedRef
   * - Guest: inserts into kred_game_actions table
   */
  const emitAction = useCallback(async (actionType: string, payload: any = {}) => {
    if (!lobbyId || !userId) return;

    if (isHost) {
      // Host processes locally — no DB round-trip
      onActionReceivedRef.current?.({ type: actionType, playerId: userId, payload });
      return;
    }

    // Guest: insert action into DB for host to pick up
    const { error } = await supabase
      .from('kred_game_actions')
      .insert({
        lobby_id: lobbyId,
        player_id: userId,
        action_type: actionType,
        payload,
      });

    if (error) {
      console.error(`Failed to emit action ${actionType}:`, error);
    }
  }, [lobbyId, userId, isHost]);

  // -------------------------------------------------------------------------
  // Typed action methods matching the MultiplayerProps interface in App.tsx
  // -------------------------------------------------------------------------

  const selectDraftTile = useCallback(
    (tileId: string) => emitAction('SELECT_DRAFT_TILE', { tileId }),
    [emitAction]
  );

  const playTile = useCallback(
    (tileId: string, targetPlayerId: number) => emitAction('PLAY_TILE', { tileId, targetPlayerId }),
    [emitAction]
  );

  const movePiece = useCallback(
    (pieceId: string, position: { x: number; y: number }, location: string) =>
      emitAction('MOVE_PIECE', { pieceId, position, location }),
    [emitAction]
  );

  const endTurn = useCallback(() => emitAction('END_TURN'), [emitAction]);

  const acceptTile = useCallback(() => emitAction('RECEIVER_DECISION', { accepted: true }), [emitAction]);
  const rejectTile = useCallback(() => emitAction('RECEIVER_DECISION', { accepted: false }), [emitAction]);
  const viewTilePrivate = useCallback(() => emitAction('VIEW_TILE_PRIVATE'), [emitAction]);

  const initiateChallenge = useCallback(() => emitAction('CHALLENGER_DECISION', { challenge: true }), [emitAction]);
  const passChallenge = useCallback(() => emitAction('CHALLENGER_DECISION', { challenge: false }), [emitAction]);

  const completeBonusMove = useCallback(() => emitAction('COMPLETE_BONUS_MOVE'), [emitAction]);
  const completeCorrection = useCallback(() => emitAction('COMPLETE_CORRECTION'), [emitAction]);

  const selectAdvantageTiles = useCallback(
    (tileIds: string[]) => emitAction('ADVANTAGE_SELECT_TILES', { tileIds }),
    [emitAction]
  );

  const purchaseAdvantage = useCallback(
    (purchase: any) => emitAction('ADVANTAGE_PURCHASE', { purchase }),
    [emitAction]
  );

  const receiverRewardChoice = useCallback(
    (choice: 'credibility' | 'advance') => emitAction('RECEIVER_REWARD', { choice }),
    [emitAction]
  );

  const purchaseBureaucracy = useCallback(
    (purchase: any) => emitAction('BUREAUCRACY_PURCHASE', { purchase }),
    [emitAction]
  );

  const bureaucracyComplete = useCallback(() => emitAction('BUREAUCRACY_COMPLETE'), [emitAction]);

  return {
    // Core
    emitAction,
    setActionHandler,

    // Typed actions (matching MultiplayerProps.multiplayerActions)
    selectDraftTile,
    playTile,
    movePiece,
    endTurn,
    acceptTile,
    rejectTile,
    viewTilePrivate,
    initiateChallenge,
    passChallenge,
    completeBonusMove,
    completeCorrection,
    selectAdvantageTiles,
    purchaseAdvantage,
    receiverRewardChoice,
    purchaseBureaucracy,
    bureaucracyComplete,
  };
}
