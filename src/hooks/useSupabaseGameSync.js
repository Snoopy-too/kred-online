import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { GameStatePayloadSchema } from '../lib/lobbySchemas.js';

export function useSupabaseGameSync(lobbyId, userId) {
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState('WAITING');
  const [stateVersion, setStateVersion] = useState(0);
  const [syncError, setSyncError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const channelRef = useRef(null);

  // 1. Fetch initial room state, players, and lobby status
  const fetchRoomData = useCallback(async () => {
    if (!lobbyId) return;

    try {
      // Fetch lobby
      const { data: lobbyData, error: lobbyErr } = await supabase
        .from('kred_lobbies')
        .select('*')
        .eq('id', lobbyId)
        .single();

      if (lobbyErr) throw lobbyErr;
      if (lobbyData) setLobbyStatus(lobbyData.status);

      // Fetch players
      const { data: playerData, error: playerErr } = await supabase
        .from('kred_players')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('player_index', { ascending: true });

      if (playerErr) throw playerErr;
      if (playerData) setPlayers(playerData);

      // Fetch master game state
      const { data: stateData, error: stateErr } = await supabase
        .from('kred_game_states')
        .select('*')
        .eq('lobby_id', lobbyId)
        .maybeSingle();

      if (stateErr && stateErr.code !== 'PGRST116') throw stateErr;

      if (stateData && stateData.state_json) {
        const raw = stateData.state_json;
        const normalized = (raw && raw.G && raw.ctx) ? raw : {
          G: (raw && raw.G) ? raw.G : raw,
          ctx: { phase: stateData.phase || 'draft', currentPlayer: String(raw?.nextMoverId ?? '0'), numPlayers: raw?.numPlayers || 3 }
        };
        setGameState(normalized);
        setStateVersion(stateData.version || 0);
      }
    } catch (err) {
      console.error('Error fetching room data from Supabase:', err);
      setSyncError(err.message || 'Failed to load online room state.');
    }
  }, [lobbyId]);

  // 2. Subscribe to Supabase Realtime broadcasts for DB-master state
  useEffect(() => {
    if (!lobbyId) return;

    fetchRoomData();

    // Setup Realtime subscription on kred_game_states, kred_players, and kred_lobbies
    const channel = supabase
      .channel(`lobby_${lobbyId}`)
      // Realtime listener for Master Game State updates
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kred_game_states',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          if (payload.new && payload.new.state_json) {
            const raw = payload.new.state_json;
            const normalized = (raw && raw.G && raw.ctx) ? raw : {
              G: (raw && raw.G) ? raw.G : raw,
              ctx: { phase: payload.new.phase || 'draft', currentPlayer: String(raw?.nextMoverId ?? '0'), numPlayers: raw?.numPlayers || 3 }
            };
            setGameState(normalized);
            setStateVersion(payload.new.version || 0);
          }
        }
      )
      // Realtime listener for Players joining / updating status
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kred_players',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => {
          // Refresh player list on any player change
          supabase
            .from('kred_players')
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('player_index', { ascending: true })
            .then(({ data }) => {
              if (data) setPlayers(data);
            });
        }
      )
      // Realtime listener for Lobby status changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kred_lobbies',
          filter: `id=eq.${lobbyId}`
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            setLobbyStatus(payload.new.status);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Periodic state polling (every 2s) to guarantee real-time move sync
    const pollInterval = setInterval(() => {
      fetchRoomData();
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [lobbyId, fetchRoomData]);

  // 3. Update DB-Master Game State (broadcasts simultaneously to all players)
  const updateMasterGameState = useCallback(
    async (nextStateJson, nextPhase = 'campaign') => {
      if (!lobbyId) return;

      const wrappedState = (nextStateJson && nextStateJson.G && nextStateJson.ctx)
        ? nextStateJson
        : {
            G: (nextStateJson && nextStateJson.G) ? nextStateJson.G : nextStateJson,
            ctx: {
              phase: nextPhase,
              currentPlayer: String((nextStateJson && nextStateJson.nextMoverId) ?? '0'),
              numPlayers: (nextStateJson && (nextStateJson.numPlayers || nextStateJson.G?.numPlayers)) || 3
            }
          };

      const nextVersion = stateVersion + 1;
      const payload = {
        lobby_id: lobbyId,
        phase: nextPhase,
        state_json: wrappedState,
        version: nextVersion
      };

      // Zod validation check
      const validation = GameStatePayloadSchema.safeParse(payload);
      if (!validation.success) {
        console.error('Invalid game state payload:', validation.error.format());
        return;
      }

      try {
        const { error } = await supabase
          .from('kred_game_states')
          .upsert(
            {
              lobby_id: lobbyId,
              phase: nextPhase,
              state_json: wrappedState,
              version: nextVersion,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'lobby_id' }
          );

        if (error) throw error;
      } catch (err) {
        console.error('Error broadcasting master game state to Supabase:', err);
        setSyncError('Failed to broadcast move to database.');
      }
    },
    [lobbyId, stateVersion]
  );

  const playerNames = players.map(p => p.name || `Player ${p.player_index + 1}`);

  return {
    gameState,
    players,
    playerNames,
    lobbyStatus,
    stateVersion,
    syncError,
    isConnected,
    updateMasterGameState,
    refreshRoomData: fetchRoomData
  };
}
