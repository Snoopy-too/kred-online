import React, { useState, useEffect } from 'react';
import { supabase, ensureAnonymousAuth } from '../../lib/supabaseClient.js';
import { PinSchema, CreateLobbySchema, JoinLobbySchema } from '../../lib/lobbySchemas.js';
import { createKredGame } from '../../srcGame.js';

export function LobbyView({ onStartOnlineGame, onCancel }) {
  const [activeTab, setActiveTab] = useState('host'); // 'host' | 'join'
  const [playerCount, setPlayerCount] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [activeLobby, setActiveLobby] = useState(null);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Authenticate user anonymously on view load
  useEffect(() => {
    ensureAnonymousAuth().then(({ user }) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // Realtime subscription + polling fallback for connected players when inside waiting room
  useEffect(() => {
    if (!activeLobby?.id) return;

    let isMounted = true;

    const checkLobbyAndPlayers = async () => {
      // 1. Fetch player list
      const { data: playerData } = await supabase
        .from('kred_players')
        .select('*')
        .eq('lobby_id', activeLobby.id)
        .order('player_index', { ascending: true });

      if (playerData && isMounted) {
        setConnectedPlayers(playerData);
      }

      // 2. Fetch lobby status to see if host started game
      const { data: lobbyData } = await supabase
        .from('kred_lobbies')
        .select('status, player_count')
        .eq('id', activeLobby.id)
        .single();

      if (lobbyData?.status === 'ACTIVE' && isMounted) {
        const playersList = playerData || [];
        const myPlayer = playersList.find(p => p.user_id === currentUser?.id);
        const playerIndex = myPlayer ? myPlayer.player_index : 0;
        const playerNames = playersList.map(p => p.name || `Player ${p.player_index + 1}`);

        onStartOnlineGame({
          lobbyId: activeLobby.id,
          numPlayers: activeLobby.player_count,
          playerIndex,
          userId: currentUser?.id,
          playerNames
        });
      }
    };

    checkLobbyAndPlayers();

    // Polling interval (1.5s) to guarantee guests join game even if Realtime drops
    const pollInterval = setInterval(checkLobbyAndPlayers, 1500);

    const channel = supabase
      .channel(`waiting_room_${activeLobby.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kred_players', filter: `lobby_id=eq.${activeLobby.id}` }, () => {
        checkLobbyAndPlayers();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kred_lobbies', filter: `id=eq.${activeLobby.id}` }, () => {
        checkLobbyAndPlayers();
      })
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [activeLobby?.id, currentUser?.id, onStartOnlineGame]);

  const generateUniquePin = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleHostLobby = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const validation = CreateLobbySchema.safeParse({ playerCount, hostName: playerName || 'Host' });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {

      const userRes = await ensureAnonymousAuth();
      const user = userRes.user;
      if (!user) throw new Error('Could not establish guest user session.');
      setCurrentUser(user);

      const pin = generateUniquePin();
      // Insert lobby
      const { data: lobbyData, error: lobbyErr } = await supabase
        .from('kred_lobbies')
        .insert({
          pin,
          host_id: user.id,
          player_count: playerCount,
          status: 'WAITING'
        })
        .select()
        .single();

      if (lobbyErr) throw lobbyErr;

      // Insert host player
      const { error: playerErr } = await supabase
        .from('kred_players')
        .insert({
          lobby_id: lobbyData.id,
          user_id: user.id,
          name: playerName || 'Host',
          player_index: 0,
          is_host: true,
          connection_status: 'ONLINE'
        });

      if (playerErr) throw playerErr;

      setActiveLobby(lobbyData);
    } catch (err) {
      console.error('Failed to create lobby:', err);
      setErrorMessage(err.message || 'Error creating lobby. Ensure Supabase credentials are configured in .env.local.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const validation = JoinLobbySchema.safeParse({ pin: pinInput, playerName: playerName || 'Player' });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {

      const userRes = await ensureAnonymousAuth();
      const user = userRes.user;
      if (!user) throw new Error('Could not establish guest user session.');
      setCurrentUser(user);

      // Find lobby by PIN
      const { data: lobbyData, error: lobbyErr } = await supabase
        .from('kred_lobbies')
        .select('*')
        .eq('pin', pinInput.trim())
        .eq('status', 'WAITING')
        .maybeSingle();

      if (lobbyErr || !lobbyData) {
        throw new Error('Lobby not found or game already in progress.');
      }

      // Check current players count
      const { data: existingPlayers } = await supabase
        .from('kred_players')
        .select('*')
        .eq('lobby_id', lobbyData.id);

      if (existingPlayers && existingPlayers.length >= lobbyData.player_count) {
        throw new Error('Lobby is already full!');
      }

      const nextIndex = existingPlayers ? existingPlayers.length : 0;

      // Insert player
      const { error: joinErr } = await supabase
        .from('kred_players')
        .insert({
          lobby_id: lobbyData.id,
          user_id: user.id,
          name: playerName || `Player ${nextIndex + 1}`,
          player_index: nextIndex,
          is_host: false,
          connection_status: 'ONLINE'
        });

      if (joinErr) throw joinErr;

      setActiveLobby(lobbyData);
    } catch (err) {
      console.error('Failed to join lobby:', err);
      setErrorMessage(err.message || 'Could not join lobby.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLobbyGame = async () => {
    if (!activeLobby) return;
    setLoading(true);
    try {
      // 1. Create initial game state config
      const numPlayers = activeLobby.player_count || 3;
      const gameEngine = createKredGame(numPlayers);
      const pseudoRandom = {
        Shuffle: (arr) => [...arr].sort(() => Math.random() - 0.5)
      };
      const initialG = gameEngine.setup({ ctx: { numPlayers }, random: pseudoRandom });
      const initialCtx = {
        phase: 'draft',
        currentPlayer: '0',
        numPlayers,
        turn: 1
      };
      const initialMasterState = { G: initialG, ctx: initialCtx };

      // 2. Upsert initial master game state into Supabase
      const { error: stateErr } = await supabase
        .from('kred_game_states')
        .upsert(
          {
            lobby_id: activeLobby.id,
            phase: 'draft',
            state_json: initialMasterState,
            version: 1,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'lobby_id' }
        );

      if (stateErr) console.warn('Warning: Could not seed initial game state:', stateErr);

      // 3. Mark lobby as ACTIVE
      const { error } = await supabase
        .from('kred_lobbies')
        .update({ status: 'ACTIVE' })
        .eq('id', activeLobby.id);

      if (error) throw error;

      const myPlayerIndex = connectedPlayers.find(p => p.user_id === currentUser?.id)?.player_index ?? 0;
      const playerNames = connectedPlayers.map(p => p.name || `Player ${p.player_index + 1}`);

      onStartOnlineGame({
        lobbyId: activeLobby.id,
        numPlayers: activeLobby.player_count,
        playerIndex: myPlayerIndex,
        userId: currentUser?.id,
        playerNames
      });
    } catch (err) {
      console.error('Error starting online game:', err);
      setErrorMessage('Failed to start online game.');
    } finally {
      setLoading(false);
    }
  };

  // If inside waiting room:
  if (activeLobby) {
    const isHost = activeLobby.host_id === currentUser?.id;
    const isFull = connectedPlayers.length >= activeLobby.player_count;

    return (
      <div className="landing-screen">
        <div className="landing-card" style={{ maxWidth: '600px' }}>
          <h2>🌐 Online Lobby Waiting Room</h2>
          <div style={{ margin: '20px 0', padding: '16px', background: '#261f1a', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <p className="landing-subtitle">Share this 6-digit PIN with your friends to join:</p>
            <h1 style={{ fontSize: '48px', letterSpacing: '8px', color: 'var(--accent-gold)', margin: '12px 0' }}>
              {activeLobby.pin}
            </h1>
            <p className="landing-subtitle">Mode: <strong>{activeLobby.player_count}-Player Online Game</strong></p>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>
              Connected Players ({connectedPlayers.length} / {activeLobby.player_count}):
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {connectedPlayers.map((p) => (
                <li
                  key={p.id}
                  style={{
                    padding: '10px 16px',
                    background: p.user_id === currentUser?.id ? 'rgba(200, 155, 60, 0.2)' : '#1c1613',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{p.is_host ? '👑 ' : '👤 '}{p.name} {p.user_id === currentUser?.id ? '(You)' : ''}</span>
                  <span className="mode-tag">Seat {p.player_index + 1}</span>
                </li>
              ))}
            </ul>
          </div>

          {errorMessage && <div style={{ color: 'var(--accent-red)', marginBottom: '16px' }}>{errorMessage}</div>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={onCancel}>← Leave Lobby</button>
            {isHost && (
              <button
                className="btn btn-primary"
                onClick={handleStartLobbyGame}
                disabled={!isFull || loading}
                style={{ opacity: !isFull ? 0.6 : 1 }}
              >
                {loading ? 'Starting...' : isFull ? '🚀 Start Online Game!' : `Waiting for ${activeLobby.player_count - connectedPlayers.length} more...`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-screen">
      <div className="landing-card" style={{ maxWidth: '550px' }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '16px' }}>🌐 Online Multiplayer Setup</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          <button
            className={`btn ${activeTab === 'host' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('host')}
          >
            Create New Lobby
          </button>
          <button
            className={`btn ${activeTab === 'join' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('join')}
          >
            Join with PIN
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: '10px', background: 'rgba(185, 43, 39, 0.2)', border: '1px solid var(--accent-red)', borderRadius: '8px', marginBottom: '16px', color: 'var(--text-main)', fontSize: '13px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {activeTab === 'host' ? (
          <form onSubmit={handleHostLobby} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Your Display Name:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Player 1"
                style={{ width: '100%', padding: '10px', background: '#1c1613', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Select Mode:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`btn ${playerCount === count ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => setPlayerCount(count)}
                    style={{ flex: 1 }}
                  >
                    {count} Players
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Creating...' : 'Generate Lobby PIN'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoinLobby} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Your Display Name:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Player 2"
                style={{ width: '100%', padding: '10px', background: '#1c1613', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>6-Digit Room PIN:</label>
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="e.g. 123456"
                maxLength={6}
                style={{ width: '100%', padding: '10px', background: '#1c1613', border: '1px solid var(--border-color)', color: 'var(--accent-gold)', borderRadius: '6px', fontSize: '20px', letterSpacing: '4px', textAlign: 'center' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Joining...' : 'Join Online Room'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
