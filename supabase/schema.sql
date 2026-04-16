-- Kred Online: Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE kred_lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  player_count INT NOT NULL CHECK (player_count >= 3 AND player_count <= 5),
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kred_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  player_index INT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  connection_status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (connection_status IN ('ONLINE', 'OFFLINE', 'LEFT')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kred_game_states (
  lobby_id UUID PRIMARY KEY REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  state_json JSONB NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kred_game_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_kred_lobbies_pin ON kred_lobbies(pin);
CREATE INDEX idx_kred_lobbies_status ON kred_lobbies(status);
CREATE INDEX idx_kred_players_lobby_id ON kred_players(lobby_id);
CREATE INDEX idx_kred_players_user_id ON kred_players(user_id);
CREATE INDEX idx_kred_game_actions_lobby_id ON kred_game_actions(lobby_id);
CREATE INDEX idx_kred_game_actions_created_at ON kred_game_actions(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE kred_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_game_actions ENABLE ROW LEVEL SECURITY;

-- Lobbies: anyone authenticated can read, anyone can insert, only host can update
CREATE POLICY "Anyone can read lobbies"
  ON kred_lobbies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create a lobby"
  ON kred_lobbies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update lobby"
  ON kred_lobbies FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Players: anyone authenticated can read, users manage own records
CREATE POLICY "Anyone can read players"
  ON kred_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join lobbies"
  ON kred_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player record"
  ON kred_players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Game states: anyone can read, host can write
CREATE POLICY "Anyone can read game states"
  ON kred_game_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Host can insert game state"
  ON kred_game_states FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kred_lobbies
      WHERE kred_lobbies.id = lobby_id
      AND kred_lobbies.host_id = auth.uid()
    )
  );

CREATE POLICY "Host can update game state"
  ON kred_game_states FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kred_lobbies
      WHERE kred_lobbies.id = lobby_id
      AND kred_lobbies.host_id = auth.uid()
    )
  );

-- Game actions: anyone can read, users insert own actions
CREATE POLICY "Anyone can read game actions"
  ON kred_game_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own actions"
  ON kred_game_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE kred_lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE kred_game_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE kred_game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE kred_players;

-- ============================================================================
-- DIAGNOSTICS
-- ============================================================================

ALTER TABLE kred_lobbies
  ADD COLUMN diagnostic_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE kred_diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  pin TEXT NOT NULL,
  player_count INT NOT NULL,
  host_name TEXT NOT NULL,
  player_names JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  last_phase TEXT,
  event_count INT NOT NULL DEFAULT 0,
  UNIQUE(lobby_id)
);

CREATE INDEX idx_kred_diag_sessions_started_at
  ON kred_diagnostic_sessions(started_at DESC);

CREATE TABLE kred_diagnostic_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES kred_diagnostic_sessions(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  player_index INT,
  player_name TEXT,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  phase TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  sequence_num INT NOT NULL
);

CREATE INDEX idx_kred_diag_events_session
  ON kred_diagnostic_events(session_id, sequence_num);
CREATE INDEX idx_kred_diag_events_occurred
  ON kred_diagnostic_events(occurred_at);

CREATE TABLE kred_diagnostic_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kred_diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_diagnostic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_diagnostic_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players insert diagnostic sessions"
  ON kred_diagnostic_sessions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM kred_players p
                      WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                      AND p.user_id = auth.uid()));

CREATE POLICY "Players update diagnostic sessions"
  ON kred_diagnostic_sessions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM kred_players p
                 WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                 AND p.user_id = auth.uid()));

CREATE POLICY "Players read diagnostic sessions for own lobby"
  ON kred_diagnostic_sessions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM kred_players p
                 WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                 AND p.user_id = auth.uid()));

CREATE POLICY "Players insert diagnostic events"
  ON kred_diagnostic_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM kred_diagnostic_sessions s
                      JOIN kred_players p ON p.lobby_id = s.lobby_id
                      WHERE s.id = kred_diagnostic_events.session_id
                      AND p.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION increment_diag_event_count(p_session_id UUID, p_delta INT)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE kred_diagnostic_sessions
  SET event_count = event_count + p_delta
  WHERE id = p_session_id;
$$;

GRANT EXECUTE ON FUNCTION increment_diag_event_count(UUID, INT) TO authenticated;
