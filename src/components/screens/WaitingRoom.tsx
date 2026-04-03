import React, { useState } from 'react';
import { useLobby } from '../../contexts/LobbyContext';

export default function WaitingRoom() {
  const { lobbyPin, isHost, playerCount, lobbyPlayers, startGame, leaveLobby } = useLobby();
  const [startError, setStartError] = useState<string | null>(null);

  const allPlayersJoined = lobbyPlayers.length === playerCount;

  const handleStart = async () => {
    setStartError(null);
    try {
      await startGame();
    } catch (err: unknown) {
      setStartError(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  const handleCopyPin = async () => {
    if (lobbyPin) {
      try {
        await navigator.clipboard.writeText(lobbyPin);
      } catch {
        // Clipboard API may not be available
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-sky-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="./images/logo.png"
            alt="KRED"
            className="w-full max-w-[200px] mx-auto"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))' }}
          />
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-sky-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">Waiting Room</h2>

          {/* PIN display */}
          <button
            onClick={handleCopyPin}
            className="w-full bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 mb-6 transition-colors group cursor-pointer"
            title="Click to copy PIN"
          >
            <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">Share this PIN</p>
            <p className="text-4xl font-mono font-black text-indigo-600 tracking-[0.3em] group-hover:text-indigo-700 transition-colors">
              {lobbyPin}
            </p>
            <p className="text-slate-400 text-xs mt-1">Click to copy</p>
          </button>

          {/* Player count indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Players</span>
            <span className="text-sm font-bold text-slate-700">
              {lobbyPlayers.length} / {playerCount}
            </span>
          </div>

          {/* Player list */}
          <div className="space-y-2 mb-6">
            {Array.from({ length: playerCount ?? 0 }).map((_, i) => {
              const player = lobbyPlayers.find(p => p.playerIndex === i);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    player
                      ? 'bg-white border border-slate-200 shadow-sm'
                      : 'bg-slate-50/50 border border-dashed border-slate-200'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    player ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-slate-300'
                  }`} />
                  <span className={`text-sm font-medium ${player ? 'text-slate-800' : 'text-slate-400'}`}>
                    {player ? (
                      <>
                        {player.name}
                        {player.isHost && (
                          <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            HOST
                          </span>
                        )}
                      </>
                    ) : (
                      'Waiting for player...'
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Error */}
          {startError && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-4">
              <p className="text-red-700 text-sm">{startError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {isHost ? (
              <button
                onClick={handleStart}
                disabled={!allPlayersJoined}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all cursor-pointer ${
                  allPlayersJoined
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {allPlayersJoined ? 'Start Game' : `Waiting for ${playerCount! - lobbyPlayers.length} more...`}
              </button>
            ) : (
              <div className="text-center py-3">
                <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Waiting for the host to start the game...
                </div>
              </div>
            )}
            <button
              onClick={leaveLobby}
              className="w-full text-slate-400 hover:text-red-500 text-sm py-2 transition-colors cursor-pointer"
            >
              Leave Lobby
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
