-- KRED Multiplayer Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS game_history;
DROP TABLE IF EXISTS spectators;
DROP TABLE IF EXISTS game_state;
DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS game_rooms;

-- Game rooms table
CREATE TABLE game_rooms (
  id VARCHAR(255) PRIMARY KEY,
  status ENUM('waiting', 'in_progress', 'finished') NOT NULL DEFAULT 'waiting',
  player_count INT NOT NULL,
  current_phase VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  winner_id INT NULL,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Game players table
CREATE TABLE game_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  player_id VARCHAR(255) NOT NULL,
  player_index INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  credibility INT NOT NULL DEFAULT 3,
  connected BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  session_token VARCHAR(255) NOT NULL,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_player (room_id, player_index),
  UNIQUE KEY unique_session (session_token),
  INDEX idx_room (room_id),
  INDEX idx_player (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Game state table (stores JSON blobs for complex state)
CREATE TABLE game_state (
  room_id VARCHAR(255) PRIMARY KEY,
  pieces JSON NOT NULL,
  board_tiles JSON NOT NULL,
  played_tile JSON NULL,
  challenge_state JSON NULL,
  take_advantage_state JSON NULL,
  bureaucracy_state JSON NULL,
  player_hands JSON NOT NULL,
  player_kept_tiles JSON NOT NULL,
  player_bureaucracy_tiles JSON NOT NULL,
  current_player_index INT NOT NULL DEFAULT 0,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Game history table (for replay)
CREATE TABLE game_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  sequence INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  player_id VARCHAR(255) NULL,
  action_data JSON NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_sequence (room_id, sequence),
  INDEX idx_room_seq (room_id, sequence),
  INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Spectators table
CREATE TABLE spectators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  socket_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  INDEX idx_room (room_id),
  INDEX idx_socket (socket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Session store table (for express-mysql-session)
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
