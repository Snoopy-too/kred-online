/**
 * Rostrum Type Definitions
 * Types for rostrum support rules and adjacency
 */

export interface RostrumSupport {
  rostrum: string; // e.g., "p1_rostrum1"
  supportingSeats: string[]; // e.g., ["p1_seat1", "p1_seat2", "p1_seat3"]
}

export interface PlayerRostrum {
  playerId: number;
  rostrums: RostrumSupport[];
  office: string; // e.g., "p1_office"
}
