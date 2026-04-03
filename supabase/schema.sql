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

ALTER PUBLICATION supabase_realtime ADD TABLE kred_game_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE kred_game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE kred_players;
