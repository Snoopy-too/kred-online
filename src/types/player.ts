// --- Player Type Definitions ---

import { Tile } from './tile';

export interface Player {
  id: number;
  hand: Tile[];
  keptTiles: Tile[];
  bureaucracyTiles: Tile[];
  credibility: number;
}
