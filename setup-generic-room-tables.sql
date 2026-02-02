-- Generic Room and Player Tables
-- Used by all games for room creation and player management

CREATE TABLE IF NOT EXISTS game_rooms (
  id VARCHAR(12) PRIMARY KEY,
  status ENUM('lobby', 'playing', 'completed') DEFAULT 'lobby',
  selected_game VARCHAR(50),
  host_player_id VARCHAR(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  player_id VARCHAR(16) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  player_index INT NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  connected BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_player_in_room (room_id, player_id),
  UNIQUE KEY unique_player_index (room_id, player_index),
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_room_status ON game_rooms(status);
CREATE INDEX idx_room_players_room ON room_players(room_id);
CREATE INDEX idx_room_players_player ON room_players(player_id);
