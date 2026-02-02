-- KRED Multiplayer Tables
-- Run this to add multiplayer support to existing database

USE KRED;

CREATE TABLE IF NOT EXISTS kred_game_rooms (
  id VARCHAR(12) PRIMARY KEY,
  status ENUM('waiting', 'active', 'completed') NOT NULL DEFAULT 'waiting',
  player_count INT NOT NULL DEFAULT 0,
  current_phase VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kred_game_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  player_id VARCHAR(16) NOT NULL,
  player_index INT NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  session_token VARCHAR(32) NOT NULL,
  connected BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES kred_game_rooms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_player (room_id, player_index),
  INDEX idx_session (session_token),
  INDEX idx_room_player (room_id, player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kred_game_state (
  room_id VARCHAR(12) NOT NULL,
  player_id VARCHAR(12) NOT NULL,
  game_state JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, player_id),
  FOREIGN KEY (room_id) REFERENCES kred_game_rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kred_game_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  sequence INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES kred_game_rooms(id) ON DELETE CASCADE,
  INDEX idx_room_seq (room_id, sequence),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kred_spectators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  spectator_name VARCHAR(100),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES kred_game_rooms(id) ON DELETE CASCADE,
  INDEX idx_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
