-- Enable the pg_cron extension if it is not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Unschedule just in case it already exists so we don't get duplicates
SELECT cron.unschedule('cleanup-old-game-sessions');

-- Schedule a job to delete old game sessions
-- This runs every day at 3:00 AM (server time)
SELECT cron.schedule(
  'cleanup-old-game-sessions',
  '0 3 * * *',
  $$
    -- Delete lobbies older than 7 days. 
    -- Because kred_players, kred_game_states, and kred_game_actions have ON DELETE CASCADE 
    -- foreign keys referencing kred_lobbies, this will automatically clean up all related data.
    DELETE FROM public.kred_lobbies
    WHERE created_at < NOW() - INTERVAL '7 days';
  $$
);
