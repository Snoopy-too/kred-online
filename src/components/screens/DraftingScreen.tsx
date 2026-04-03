/**
 * DraftingScreen Component
 *
 * Screen for the drafting phase where players select tiles from their hand.
 * Each player takes turns selecting one tile to keep from their current hand,
 * then passes the remaining tiles to the next player.
 *
 * @component
 * @example
 * ```tsx
 * <DraftingScreen
 *   players={players}
 *   currentPlayerIndex={0}
 *   draftRound={1}
 *   onSelectTile={(tile) => console.log('Selected:', tile)}
 * />
 * ```
 */

import React from "react";
import type { Player, Tile } from "../../types";

interface DraftingScreenProps {
  players: Player[];
  currentPlayerIndex: number;
  draftRound: number;
  onSelectTile: (tile: Tile) => void;
  playerIndex?: number; // The current player's index in multiplayer
  isMultiplayer?: boolean;
  playerNames?: string[];
}

const DraftingScreen: React.FC<DraftingScreenProps> = ({
  players,
  currentPlayerIndex,
  draftRound,
  onSelectTile,
  playerIndex,
  isMultiplayer = false,
  playerNames,
}) => {

  // Defensive: Check player array and indices
  let myPlayer: Player | undefined = undefined;
  if (isMultiplayer && typeof playerIndex === 'number' && players[playerIndex]) {
    myPlayer = players[playerIndex];
  } else if (typeof currentPlayerIndex === 'number' && players[currentPlayerIndex]) {
    myPlayer = players[currentPlayerIndex];
  }

  if (!myPlayer || typeof myPlayer !== 'object') {
    console.error('[DRAFTING] myPlayer is undefined or invalid:', { players, playerIndex, currentPlayerIndex });
    return (
      <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400">
            Error: Player data not found
          </h1>
          <p className="text-slate-400 mt-2">Check console for details. Waiting for valid player data from server...</p>
        </div>
      </main>
    );
  }

  // availableTiles = tiles that can be selected right now (current hand)
  // hand = tiles that have been selected (keptTiles)
  const availableTiles = Array.isArray(myPlayer.hand) ? myPlayer.hand : [];
  const hand = Array.isArray(myPlayer.keptTiles) ? myPlayer.keptTiles : [];

  // Show waiting screen if no available tiles
  if (isMultiplayer && availableTiles.length === 0) {
    // Determine if player is waiting for tiles or waiting for game to progress
    const totalTilesPerPlayer = Math.floor((players.length === 5 ? 25 : 24) / players.length);
    const hasCompletedDrafting = hand.length >= totalTilesPerPlayer;

    // Find players who still have tiles in hand (haven't picked yet)
    const waitingFor = players
      .map((p, i) => ({ name: playerNames?.[i] || `Player ${i + 1}`, hasHand: (p.hand?.length || 0) > 0 }))
      .filter(p => p.hasHand)
      .map(p => p.name);

    const waitingMessage = hasCompletedDrafting
      ? "Waiting for other players to complete their selections..."
      : waitingFor.length > 0
      ? `Waiting for ${waitingFor.join(', ')} to select a tile...`
      : "Tiles are being passed to you...";
    const waitingTitle = hasCompletedDrafting
      ? "Draft Complete!"
      : "Waiting for tiles...";
    
    return (
      <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Drafting Phase
          </h1>
          {isMultiplayer && playerIndex !== undefined && (
            <h2 className="text-2xl text-slate-100 mt-4">
              You are Player {playerIndex + 1}
            </h2>
          )}
        </div>

        {/* My Hand - Always visible */}
        {hand.length > 0 && (
          <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-2xl border border-green-700 mb-6">
            <h3 className="text-lg font-semibold text-center mb-4 text-green-400">
              My Hand ({hand.length} {hand.length === 1 ? 'tile' : 'tiles'})
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {hand.map((tile) => (
                <div
                  key={tile.id}
                  className="bg-stone-100 w-16 h-32 sm:w-20 sm:h-40 p-1 rounded-lg shadow-lg border-2 border-green-400"
                >
                  <img
                    src={tile.url}
                    alt={`Tile ${tile.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
          <div className="animate-pulse text-center">
            <h2 className="text-2xl text-slate-100 mb-2">
              {waitingTitle}
            </h2>
            <p className="text-slate-400">
              {waitingMessage}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Drafting Phase
        </h1>
        {isMultiplayer && playerIndex !== undefined && (
          <h2 className="text-2xl text-slate-100 mt-4">
            You are Player {playerIndex + 1}
          </h2>
        )}
        <p className="text-slate-400 mt-2">Select one tile to keep, then remaining tiles pass left.</p>
      </div>

      {/* Selected Tiles (Hand) */}
      {hand.length > 0 && (
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-2xl border border-green-700 mb-4">
          <h3 className="text-lg font-semibold text-center mb-4 text-green-400">
            My Hand ({hand.length} {hand.length === 1 ? 'tile' : 'tiles'})
          </h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {hand.map((tile) => (
              <div
                key={tile.id}
                className="bg-stone-100 w-16 h-32 sm:w-20 sm:h-40 p-1 rounded-lg shadow-lg border-2 border-green-400"
              >
                <img
                  src={tile.url}
                  alt={`Tile ${tile.id}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tiles */}
      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-center mb-4">
          Available Tiles ({availableTiles.length} tiles)
        </h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {availableTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => {
                console.log('[DRAFTING] Tile clicked:', tile.id);
                onSelectTile(tile);
              }}
              className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 rounded-lg group"
              aria-label={`Select tile ${tile.id}`}
            >
              <div className="bg-stone-100 w-16 h-32 sm:w-20 sm:h-40 p-1 rounded-lg shadow-lg border-2 border-gray-300 group-hover:border-cyan-400 transition-colors flex items-center justify-center">
                <img
                  src={tile.url}
                  alt={`Tile ${tile.id}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

























    </main>
  );
};

export default DraftingScreen;
