// --- Player Type Definitions ---

import { Tile } from './tile';

export interface Player {
  id: number;
  name?: string; // Player name from room_players
  hand: Tile[];
  keptTiles: Tile[];
  bureaucracyTiles: Tile[];
  credibility: number;
  hasSelected?: boolean; // Used during drafting to track if player has selected this round
}
