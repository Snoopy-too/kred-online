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
}

const DraftingScreen: React.FC<DraftingScreenProps> = ({
  players,
  currentPlayerIndex,
  draftRound,
  onSelectTile,
}) => {
  const currentPlayer = players[currentPlayerIndex];
  const handSize = players[0].keptTiles.length + players[0].hand.length;

  return (
    <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Drafting Phase
        </h1>
        <p className="text-xl text-slate-300 mt-2">
          {`Round ${draftRound} of ${handSize}`}
        </p>
        <h2 className="text-3xl text-slate-100 mt-4">
          {`Player ${currentPlayer.id}'s Turn`}
        </h2>
        <p className="text-slate-400">Select one tile to keep.</p>
      </div>

      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-center mb-4">
          Your Hand ({currentPlayer.hand.length} tiles)
        </h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {currentPlayer.hand.map((tile) => (
            <button
              key={tile.id}
              onClick={() => onSelectTile(tile)}
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
