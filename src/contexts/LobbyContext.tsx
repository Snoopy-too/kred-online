import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================================
// Types
// ============================================================================

interface LobbyPlayer {
  id: string;
  name: string;
  playerIndex: number;
  isHost: boolean;
  connectionStatus: string;
}

interface LobbyContextType {
  // State
  lobbyId: string | null;
  lobbyPin: string | null;
  isHost: boolean;
  userId: string | null;
  playerIndex: number | null;
  playerCount: number | null;
  lobbyStatus: string | null;
  lobbyPlayers: LobbyPlayer[];
  isRejoining: boolean;
  rejoinAvailable: { pin: string; name: string; lobbyId: string } | null;

  // Actions
  createLobby: (hostName: string, playerCount: number) => Promise<void>;
  joinLobby: (pin: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  rejoinGame: () => Promise<void>;
  dismissRejoin: () => void;
  leaveLobby: () => Promise<void>;
}

const LobbyContext = createContext<LobbyContextType | null>(null);

// ============================================================================
// PIN Generation
// ============================================================================

const PIN_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generatePin(): string {
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += PIN_CHARS[Math.floor(Math.random() * PIN_CHARS.length)];
  }
  return pin;
}

// ============================================================================
// Provider
// ============================================================================

export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [lobbyPin, setLobbyPin] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [lobbyStatus, setLobbyStatus] = useState<string | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isRejoining, setIsRejoining] = useState(false);
  const [rejoinAvailable, setRejoinAvailable] = useState<{ pin: string; name: string; lobbyId: string } | null>(null);

  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // --------------------------------------------------------------------------
  // Auth: ensure anonymous session
  // --------------------------------------------------------------------------
  const ensureAuth = useCallback(async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      return session.user.id;
    }
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Auth failed: ${error.message}`);
    const uid = data.user!.id;
    setUserId(uid);
    return uid;
  }, []);

  // --------------------------------------------------------------------------
  // Rejoin detection on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    const checkRejoin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUserId(session.user.id);

      const { data: playerRows } = await supabase
        .from('kred_players')
        .select('lobby_id, name, is_host, player_index, kred_lobbies!inner(id, pin, status, player_count)')
        .eq('user_id', session.user.id)
        .neq('connection_status', 'LEFT')
        .order('last_seen', { ascending: false })
        .limit(1);

      if (playerRows && playerRows.length > 0) {
        const row = playerRows[0] as any;
        const lobby = row.kred_lobbies;
        if (lobby.status === 'ACTIVE' || lobby.status === 'WAITING') {
          setRejoinAvailable({
            pin: lobby.pin,
            name: row.name,
            lobbyId: lobby.id,
          });
        }
      }
    };
    checkRejoin();
  }, []);

  // --------------------------------------------------------------------------
  // Subscribe to player list changes for current lobby
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!lobbyId) return;

    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('kred_players')
        .select('id, name, player_index, is_host, connection_status')
        .eq('lobby_id', lobbyId)
        .neq('connection_status', 'LEFT')
        .order('player_index');

      if (data) {
        setLobbyPlayers(data.map(p => ({
          id: p.id,
          name: p.name,
          playerIndex: p.player_index,
          isHost: p.is_host,
          connectionStatus: p.connection_status,
        })));
      }
    };
    fetchPlayers();

    const channel = supabase
      .channel(`lobby_players:${lobbyId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kred_players', filter: `lobby_id=eq.${lobbyId}` },
        () => { fetchPlayers(); }
      )
      .subscribe();

    subscriptionRef.current = channel;

    const interval = setInterval(fetchPlayers, 3000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [lobbyId]);

  // --------------------------------------------------------------------------
  // Subscribe to lobby status changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby_status:${lobbyId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kred_lobbies', filter: `id=eq.${lobbyId}` },
        (payload) => {
          const newStatus = (payload.new as any).status;
          setLobbyStatus(newStatus);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [lobbyId]);

  // --------------------------------------------------------------------------
  // Create lobby
  // --------------------------------------------------------------------------
  const createLobby = useCallback(async (hostName: string, playerCount: number) => {
    const uid = await ensureAuth();
    const pin = generatePin();

    await supabase
      .from('kred_players')
      .update({ connection_status: 'LEFT' })
      .eq('user_id', uid)
      .neq('connection_status', 'LEFT');

    const { data: lobby, error: lobbyError } = await supabase
      .from('kred_lobbies')
      .insert({ pin, host_id: uid, player_count: playerCount, status: 'WAITING' })
      .select('id')
      .single();

    if (lobbyError) throw new Error(`Failed to create lobby: ${lobbyError.message}`);

    const { error: playerError } = await supabase
      .from('kred_players')
      .insert({
        lobby_id: lobby.id,
        user_id: uid,
        name: hostName,
        player_index: 0,
        is_host: true,
        connection_status: 'ONLINE',
      });

    if (playerError) throw new Error(`Failed to join as host: ${playerError.message}`);

    setLobbyId(lobby.id);
    setLobbyPin(pin);
    setIsHost(true);
    setPlayerIndex(0);
    setPlayerCount(playerCount);
    setLobbyStatus('WAITING');
    setRejoinAvailable(null);
  }, [ensureAuth]);

  // --------------------------------------------------------------------------
  // Join lobby
  // --------------------------------------------------------------------------
  const joinLobby = useCallback(async (pin: string, playerName: string) => {
    const uid = await ensureAuth();

    const { data: lobby, error: lobbyError } = await supabase
      .from('kred_lobbies')
      .select('id, status, player_count')
      .eq('pin', pin.toUpperCase())
      .single();

    if (lobbyError || !lobby) throw new Error('Lobby not found. Check the PIN and try again.');
    if (lobby.status !== 'WAITING') throw new Error('This game has already started.');

    const { data: existingPlayers } = await supabase
      .from('kred_players')
      .select('player_index')
      .eq('lobby_id', lobby.id)
      .neq('connection_status', 'LEFT')
      .order('player_index');

    const currentCount = existingPlayers?.length ?? 0;
    if (currentCount >= lobby.player_count) throw new Error('This lobby is full.');

    const nextIndex = currentCount;

    await supabase
      .from('kred_players')
      .update({ connection_status: 'LEFT' })
      .eq('user_id', uid)
      .neq('connection_status', 'LEFT');

    const { error: playerError } = await supabase
      .from('kred_players')
      .insert({
        lobby_id: lobby.id,
        user_id: uid,
        name: playerName,
        player_index: nextIndex,
        is_host: false,
        connection_status: 'ONLINE',
      });

    if (playerError) throw new Error(`Failed to join: ${playerError.message}`);

    setLobbyId(lobby.id);
    setLobbyPin(pin.toUpperCase());
    setIsHost(false);
    setPlayerIndex(nextIndex);
    setPlayerCount(lobby.player_count);
    setLobbyStatus('WAITING');
    setRejoinAvailable(null);
  }, [ensureAuth]);

  // --------------------------------------------------------------------------
  // Start game (host only)
  // --------------------------------------------------------------------------
  const startGame = useCallback(async () => {
    if (!lobbyId || !isHost) return;

    const { error } = await supabase
      .from('kred_lobbies')
      .update({ status: 'ACTIVE' })
      .eq('id', lobbyId);

    if (error) throw new Error(`Failed to start game: ${error.message}`);

    setLobbyStatus('ACTIVE');
  }, [lobbyId, isHost]);

  // --------------------------------------------------------------------------
  // Rejoin game
  // --------------------------------------------------------------------------
  const rejoinGame = useCallback(async () => {
    if (!rejoinAvailable || !userId) return;

    setIsRejoining(true);

    const { data: lobby } = await supabase
      .from('kred_lobbies')
      .select('id, pin, status, player_count')
      .eq('id', rejoinAvailable.lobbyId)
      .single();

    if (!lobby) {
      setRejoinAvailable(null);
      setIsRejoining(false);
      return;
    }

    const { data: playerRow } = await supabase
      .from('kred_players')
      .select('player_index, is_host')
      .eq('lobby_id', lobby.id)
      .eq('user_id', userId)
      .neq('connection_status', 'LEFT')
      .single();

    if (!playerRow) {
      setRejoinAvailable(null);
      setIsRejoining(false);
      return;
    }

    await supabase
      .from('kred_players')
      .update({ connection_status: 'ONLINE', last_seen: new Date().toISOString() })
      .eq('lobby_id', lobby.id)
      .eq('user_id', userId);

    setLobbyId(lobby.id);
    setLobbyPin(lobby.pin);
    setIsHost(playerRow.is_host);
    setPlayerIndex(playerRow.player_index);
    setPlayerCount(lobby.player_count);
    setLobbyStatus(lobby.status);
    setRejoinAvailable(null);
  }, [rejoinAvailable, userId]);

  // --------------------------------------------------------------------------
  // Dismiss rejoin / Leave lobby
  // --------------------------------------------------------------------------
  const dismissRejoin = useCallback(() => {
    setRejoinAvailable(null);
  }, []);

  const leaveLobby = useCallback(async () => {
    if (!lobbyId || !userId) return;

    await supabase
      .from('kred_players')
      .update({ connection_status: 'LEFT' })
      .eq('lobby_id', lobbyId)
      .eq('user_id', userId);

    setLobbyId(null);
    setLobbyPin(null);
    setIsHost(false);
    setPlayerIndex(null);
    setPlayerCount(null);
    setLobbyStatus(null);
    setLobbyPlayers([]);
    setIsRejoining(false);
  }, [lobbyId, userId]);

  const value: LobbyContextType = {
    lobbyId, lobbyPin, isHost, userId, playerIndex, playerCount,
    lobbyStatus, lobbyPlayers, isRejoining, rejoinAvailable,
    createLobby, joinLobby, startGame, rejoinGame, dismissRejoin, leaveLobby,
  };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
}

export function useLobby(): LobbyContextType {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error('useLobby must be used within LobbyProvider');
  return ctx;
}
