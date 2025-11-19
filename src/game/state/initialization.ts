/**
 * State Initialization
 * Functions for initializing game state, players, and pieces
 */

import { Player, Tile, Piece } from '../types';
import { TILE_IMAGE_URLS, PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT } from '../config';
import { DROP_LOCATIONS_BY_PLAYER_COUNT } from '../config/board-layouts';
import { calculatePieceRotation } from '../utils';

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex: number;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

/**
 * Creates the initial set of players with shuffled, dealt hands.
 * @param playerCount The number of players in the game.
 * @returns An array of Player objects with dealt tiles.
 */
export function initializePlayers(playerCount: number): Player[] {
  const allTiles: Tile[] = TILE_IMAGE_URLS.map((url, index) => ({
    id: index + 1,
    url,
  }));

  // Add blank tile for 5-player mode
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

  // Deal all available tiles in round-robin fashion
  let tileIndex = 0;
  while (tileIndex < shuffledTiles.length) {
    for (let i = 0; i < playerCount && tileIndex < shuffledTiles.length; i++) {
      players[i].hand.push(shuffledTiles[tileIndex]);
      tileIndex++;
    }
  }

  return players;
}

/**
 * Initializes pieces for draft phase start.
 * Places Marks at seats 1, 3, 5 for each player.
 * @param playerCount The number of players in the game.
 * @returns An array of initial Piece objects for draft phase.
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
 * Places Marks at player seats 1, 3, 5 and distributes Heels/Pawns in community.
 * @param playerCount The number of players in the game.
 * @returns An array of all Piece objects for campaign start.
 */
export function initializeCampaignPieces(playerCount: number): Piece[] {
  const allPieces: Piece[] = [];
  const dropLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!dropLocations) return [];

  const markInfo = PIECE_TYPES.MARK;
  const heelInfo = PIECE_TYPES.HEEL;
  const pawnInfo = PIECE_TYPES.PAWN;
  const seatsToPlace = [1, 3, 5];

  let markCounter = 1;
  let heelCounter = 1;
  let pawnCounter = 1;

  // Step 1: Place Marks at seats 1, 3, 5 for each player
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

  // Step 2: Get community drop locations
  const communityLocations = dropLocations.filter((loc) =>
    loc.id.startsWith('community')
  );

  // Step 3: Place additional Marks in community
  const additionalMarkCount =
    PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].MARK - playerCount * 3;
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
  const heelCount = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].HEEL;
  const heelsStartIndex = additionalMarkCount;
  for (
    let i = 0;
    i < heelCount && heelsStartIndex + i < communityLocations.length;
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
  const pawnsStartIndex = heelsStartIndex + heelCount;
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
