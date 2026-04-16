-- 2026-04-16: Diagnostics tool — add diagnostic_enabled to lobbies, create three new tables.

ALTER TABLE kred_lobbies
  ADD COLUMN IF NOT EXISTS diagnostic_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS kred_diagnostic_sessions (
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

CREATE INDEX IF NOT EXISTS idx_kred_diag_sessions_started_at
  ON kred_diagnostic_sessions(started_at DESC);

CREATE TABLE IF NOT EXISTS kred_diagnostic_events (
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

CREATE INDEX IF NOT EXISTS idx_kred_diag_events_session
  ON kred_diagnostic_events(session_id, sequence_num);
CREATE INDEX IF NOT EXISTS idx_kred_diag_events_occurred
  ON kred_diagnostic_events(occurred_at);

CREATE TABLE IF NOT EXISTS kred_diagnostic_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kred_diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_diagnostic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_diagnostic_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players insert diagnostic sessions" ON kred_diagnostic_sessions;
CREATE POLICY "Players insert diagnostic sessions"
  ON kred_diagnostic_sessions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM kred_players p
                      WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                      AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Players update diagnostic sessions" ON kred_diagnostic_sessions;
CREATE POLICY "Players update diagnostic sessions"
  ON kred_diagnostic_sessions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM kred_players p
                 WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                 AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Players read diagnostic sessions for own lobby" ON kred_diagnostic_sessions;
CREATE POLICY "Players read diagnostic sessions for own lobby"
  ON kred_diagnostic_sessions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM kred_players p
                 WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                 AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Players insert diagnostic events" ON kred_diagnostic_events;
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
