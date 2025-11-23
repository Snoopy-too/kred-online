/**
 * Game Initialization - Player and piece setup functions
 *
 * Purpose: Handles initial game state setup for different game phases
 * Dependencies: config (pieces, tiles, board), types, utils (shuffle, positioning)
 * Usage: Called when starting a new game or transitioning between phases
 *
 * @module game/initialization
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type { Piece, Player, Tile } from "../types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  // Piece configuration - piece types and counts per player
  PIECE_TYPES,
  PIECE_COUNTS_BY_PLAYER_COUNT,
} from "../config/pieces";

import {
  // Tile configuration - tile image URLs
  TILE_IMAGE_URLS,
} from "../config/tiles";

import {
  // Board configuration - drop locations for piece placement
  DROP_LOCATIONS_BY_PLAYER_COUNT,
} from "../config/board";

// ============================================================================
// FUNCTION IMPORTS - Business logic and utilities
// ============================================================================
import {
  // Array utilities - shuffle for randomizing tile order
  shuffle,
} from "../utils/array";

import {
  // Positioning utilities - calculate piece rotation based on board position
  calculatePieceRotation,
} from "../utils/positioning";

/**
 * Initializes pieces for the drafting phase.
 * Places Mark pieces at seats 1, 3, and 5 for each player.
 *
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Array of Piece objects positioned at player seats
 *
 * @example
 * ```typescript
 * const draftPieces = initializePieces(3);
 * // Returns 9 Mark pieces (3 players * 3 seats)
 * ```
 */
export function initializePieces(playerCount: number): Piece[] {
  const initialPieces: Piece[] = [];
  const dropLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!dropLocations) return [];

  const markInfo = PIECE_TYPES.MARK;
  const seatsToPlace = [1, 3, 5];

  for (let playerId = 1; playerId <= playerCount; playerId++) {
    for (const seatNum of seatsToPlace) {
      const seatId = `p${playerId}_seat${seatNum}`;
      const location = dropLocations.find((loc) => loc.id === seatId);

      if (location) {
        const position = location.position;
        const newPiece: Piece = {
          id: `initial_p${playerId}_mark_seat${seatNum}`,
          name: markInfo.name,
          imageUrl: markInfo.imageUrl,
          position: position,
          rotation: calculatePieceRotation(position, playerCount, seatId),
          locationId: seatId,
        };
        initialPieces.push(newPiece);
      } else {
        console.warn(`Could not find location for ${seatId}`);
      }
    }
  }

  return initialPieces;
}

/**
 * Initializes all pieces for campaign start after draft phase.
 * Places Marks at player seats and distributes Heels/Pawns in community.
 *
 * Distribution by player count:
 * - 3 players: 12 Marks (9 seats + 3 community), 9 Heels, 3 Pawns
 * - 4 players: 14 Marks (12 seats + 2 community), 13 Heels, 4 Pawns
 * - 5 players: 18 Marks (15 seats + 3 community), 17 Heels, 5 Pawns
 *
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Array of all Piece objects for campaign start
 *
 * @example
 * ```typescript
 * const campaignPieces = initializeCampaignPieces(3);
 * // Returns 24 total pieces for 3-player game
 * ```
 */
export function initializeCampaignPieces(playerCount: number): Piece[] {
  const allPieces: Piece[] = [];
  const dropLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!dropLocations) return [];

  const markInfo = PIECE_TYPES.MARK;
  const heelInfo = PIECE_TYPES.HEEL;
  const pawnInfo = PIECE_TYPES.PAWN;

  let markCounter = 1;
  let heelCounter = 1;
  let pawnCounter = 1;

  // Step 1: Place pieces in seats based on player count
  if (playerCount === 4) {
    // 4-player: Marks at seats 2, 4, 6 for each player
    for (let playerId = 1; playerId <= playerCount; playerId++) {
      // Place Marks at seats 2, 4, 6
      for (const seatNum of [2, 4, 6]) {
        const seatId = `p${playerId}_seat${seatNum}`;
        const location = dropLocations.find((loc) => loc.id === seatId);

        if (location) {
          const newPiece: Piece = {
            id: `campaign_mark_${markCounter}`,
            name: markInfo.name,
            displayName: `M${markCounter}`,
            imageUrl: markInfo.imageUrl,
            position: location.position,
            rotation: calculatePieceRotation(
              location.position,
              playerCount,
              seatId
            ),
            locationId: seatId,
          };
          allPieces.push(newPiece);
          markCounter++;
        }
      }
    }
  } else if (playerCount === 5) {
    // 5-player: Marks at seats 1, 3, 5 for each player
    for (let playerId = 1; playerId <= playerCount; playerId++) {
      // Place Marks at seats 1, 3, 5
      for (const seatNum of [1, 3, 5]) {
        const seatId = `p${playerId}_seat${seatNum}`;
        const location = dropLocations.find((loc) => loc.id === seatId);
        if (location) {
          const newPiece: Piece = {
            id: `campaign_mark_${markCounter}`,
            name: markInfo.name,
            displayName: `M${markCounter}`,
            imageUrl: markInfo.imageUrl,
            position: location.position,
            rotation: calculatePieceRotation(
              location.position,
              playerCount,
              seatId
            ),
            locationId: seatId,
          };
          allPieces.push(newPiece);
          markCounter++;
        }
      }
    }
  } else {
    // 3-player: Marks at seats 1, 3, 5 for each player
    const seatsToPlace = [1, 3, 5];
    for (let playerId = 1; playerId <= playerCount; playerId++) {
      for (const seatNum of seatsToPlace) {
        const seatId = `p${playerId}_seat${seatNum}`;
        const location = dropLocations.find((loc) => loc.id === seatId);

        if (location) {
          const newPiece: Piece = {
            id: `campaign_mark_${markCounter}`,
            name: markInfo.name,
            displayName: `M${markCounter}`,
            imageUrl: markInfo.imageUrl,
            position: location.position,
            rotation: calculatePieceRotation(
              location.position,
              playerCount,
              seatId
            ),
            locationId: seatId,
          };
          allPieces.push(newPiece);
          markCounter++;
        }
      }
    }
  }

  // Step 2: Get community drop locations
  const communityLocations = dropLocations.filter((loc) =>
    loc.id.startsWith("community")
  );

  // Step 3: Place additional Marks in community
  let additionalMarkCount: number;
  if (playerCount === 4) {
    // 4-player: 14 total - 12 in seats = 2 in community
    additionalMarkCount =
      PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].MARK - playerCount * 3;
  } else if (playerCount === 5) {
    // 5-player: 18 total - 15 in seats = 3 in community
    additionalMarkCount =
      PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].MARK - playerCount * 3;
  } else {
    // 3-player: 12 total - 9 in seats = 3 in community
    additionalMarkCount =
      PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].MARK - playerCount * 3;
  }

  for (
    let i = 0;
    i < additionalMarkCount && i < communityLocations.length;
    i++
  ) {
    const location = communityLocations[i];
    const newPiece: Piece = {
      id: `campaign_mark_${markCounter}`,
      name: markInfo.name,
      displayName: `M${markCounter}`,
      imageUrl: markInfo.imageUrl,
      position: location.position,
      rotation: calculatePieceRotation(
        location.position,
        playerCount,
        location.id
      ),
      locationId: location.id,
    };
    allPieces.push(newPiece);
    markCounter++;
  }

  // Step 4: Place Heels in community
  let heelCountInCommunity: number;
  if (playerCount === 4) {
    // 4-player: 13 total - 0 in seats = 13 in community
    heelCountInCommunity = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].HEEL;
  } else if (playerCount === 5) {
    // 5-player: 17 total - 0 in seats = 17 in community
    heelCountInCommunity = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].HEEL;
  } else {
    // 3-player: all 9 heels in community
    heelCountInCommunity = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].HEEL;
  }
  const heelsStartIndex = additionalMarkCount;
  for (
    let i = 0;
    i < heelCountInCommunity && heelsStartIndex + i < communityLocations.length;
    i++
  ) {
    const location = communityLocations[heelsStartIndex + i];
    const newPiece: Piece = {
      id: `campaign_heel_${heelCounter}`,
      name: heelInfo.name,
      displayName: `H${heelCounter}`,
      imageUrl: heelInfo.imageUrl,
      position: location.position,
      rotation: calculatePieceRotation(
        location.position,
        playerCount,
        location.id
      ),
      locationId: location.id,
    };
    allPieces.push(newPiece);
    heelCounter++;
  }

  // Step 5: Place Pawns in community
  const pawnCount = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].PAWN;
  const pawnsStartIndex = heelsStartIndex + heelCountInCommunity;
  for (
    let i = 0;
    i < pawnCount && pawnsStartIndex + i < communityLocations.length;
    i++
  ) {
    const location = communityLocations[pawnsStartIndex + i];
    const newPiece: Piece = {
      id: `campaign_pawn_${pawnCounter}`,
      name: pawnInfo.name,
      displayName: `P${pawnCounter}`,
      imageUrl: pawnInfo.imageUrl,
      position: location.position,
      rotation: calculatePieceRotation(
        location.position,
        playerCount,
        location.id
      ),
      locationId: location.id,
    };
    allPieces.push(newPiece);
    pawnCounter++;
  }

  console.log(
    `Campaign pieces initialized: ${allPieces.length} total (${playerCount}-player mode)`
  );
  return allPieces;
}

/**
 * Creates the initial set of players with shuffled, dealt hands.
 * Deals tiles evenly among players, adding a blank tile for 5-player games.
 *
 * Initial player state:
 * - Empty keptTiles and bureaucracyTiles arrays
 * - Starting credibility of 3
 * - Hand filled with dealt tiles
 *
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Array of Player objects with dealt hands
 *
 * @example
 * ```typescript
 * const players = initializePlayers(3);
 * // Returns 3 players, each with 8 tiles (24 total / 3 players)
 * ```
 */
export function initializePlayers(playerCount: number): Player[] {
  const allTiles: Tile[] = TILE_IMAGE_URLS.map((url, index) => ({
    id: index + 1,
    url,
  }));

  if (playerCount === 5) {
    allTiles.push({
      id: 25,
      // A blank SVG that will allow the background color of its container to show through,
      // effectively creating a blank tile.
      url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
    });
  }

  const shuffledTiles = shuffle(allTiles);

  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    hand: [],
    keptTiles: [],
    bureaucracyTiles: [],
    credibility: 3,
  }));

  // Deal all available tiles
  let tileIndex = 0;
  while (tileIndex < shuffledTiles.length) {
    for (let i = 0; i < playerCount && tileIndex < shuffledTiles.length; i++) {
      players[i].hand.push(shuffledTiles[tileIndex]);
      tileIndex++;
    }
  }

  return players;
}
