-- ==============================================================================
-- Kred Game - Database Retention & Auto-Cleanup Script (14 Days)
-- Target Database: Supabase PostgreSQL (Shared Database Environment)
-- Safety Guarantee: Targets ONLY 'kred_%' tables to avoid affecting other games.
-- ==============================================================================

-- 1. Ensure Foreign Key Cascades are active on child tables
-- Deleting an expired lobby will automatically purge its players & state rows.
ALTER TABLE IF EXISTS public.kred_players
  DROP CONSTRAINT IF EXISTS fk_kred_players_lobby,
  ADD CONSTRAINT fk_kred_players_lobby
  FOREIGN KEY (lobby_id) REFERENCES public.kred_lobbies(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.kred_game_states
  DROP CONSTRAINT IF EXISTS fk_kred_game_states_lobby,
  ADD CONSTRAINT fk_kred_game_states_lobby
  FOREIGN KEY (lobby_id) REFERENCES public.kred_lobbies(id) ON DELETE CASCADE;

-- 2. Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Safely remove any existing cron schedule with this name if re-running
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-kred-expired-games-2w') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'cleanup-kred-expired-games-2w';
  END IF;
END $$;

-- 4. Schedule daily automated cleanup at 3:00 AM UTC
SELECT cron.schedule(
  'cleanup-kred-expired-games-2w',
  '0 3 * * *',
  $$
    DELETE FROM public.kred_lobbies 
    WHERE created_at < NOW() - INTERVAL '14 days';
  $$
);
