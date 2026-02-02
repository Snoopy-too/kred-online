-- Database Schema Cleanup
-- Removes duplicate KRED tables and ensures proper foreign keys

USE KRED;

-- Drop foreign key constraints first (ignore errors if not exist)
SET FOREIGN_KEY_CHECKS = 0;

-- Drop duplicate/unused tables
DROP TABLE IF EXISTS kred_spectators;
DROP TABLE IF EXISTS kred_game_players;
DROP TABLE IF EXISTS kred_game_rooms;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify kred_game_state structure (should already be correct)
DESCRIBE kred_game_state;

-- Ensure proper foreign key constraint
-- Note: May fail if constraint already exists, that's OK
ALTER TABLE kred_game_state 
  ADD CONSTRAINT fk_kred_state_room 
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE;

-- Ensure kred_game_history has proper foreign key  
ALTER TABLE kred_game_history
  ADD CONSTRAINT fk_kred_history_room
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE;

-- Show final table list
SHOW TABLES;

-- Show remaining KRED tables structure
DESCRIBE kred_game_state;
DESCRIBE kred_game_history;
