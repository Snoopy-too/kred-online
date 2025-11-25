/**
 * PlayerSelectionScreen Component
 *
 * Game setup screen where players select the number of players (3, 4, or 5)
 * and configure game options like test mode and phase skipping.
 *
 * @component
 * @example
 * ```tsx
 * <PlayerSelectionScreen
 *   onStartGame={(playerCount, isTestMode, skipDraft, skipCampaign) => {
 *     console.log('Starting game with', playerCount, 'players');
 *   }}
 * />
 * ```
 */

import React, { useState, useEffect } from "react";
import { PLAYER_OPTIONS } from "../../config";

interface PlayerSelectionScreenProps {
  onStartGame: (
    playerCount: number,
    isTestMode: boolean,
    skipDraft: boolean,
    skipCampaign: boolean
  ) => void;
}

const PlayerSelectionScreen: React.FC<PlayerSelectionScreenProps> = ({
  onStartGame,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isTestMode, setIsTestMode] = useState(true);
  const [skipDraft, setSkipDraft] = useState(false);
  const [skipCampaign, setSkipCampaign] = useState(false);

  // Auto-uncheck skipCampaign when skipDraft is unchecked
  useEffect(() => {
    if (!skipDraft && skipCampaign) {
      setSkipCampaign(false);
    }
  }, [skipDraft, skipCampaign]);

  return (
    <main className="min-h-screen w-full bg-sky-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="text-center mb-12">
        <img
          src="./images/logo.png"
          alt="Kred Logo"
          className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
          style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))" }}
        />
        <p className="text-xl text-sky-900 mt-2 italic">
          You can't trust anyone!
        </p>
      </div>

      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
          Select Players
        </h2>
        <p className="text-slate-600 mt-2 max-w-md">
          Choose 3, 4, or 5 players to begin.
        </p>
      </div>
      <div className="flex space-x-4 my-10">
        {PLAYER_OPTIONS.map((count) => (
          <button
            key={count}
            onClick={() => setPlayerCount(count)}
            className={`w-24 h-24 sm:w-32 sm:h-32 text-2xl font-bold rounded-lg transition-all duration-200 ease-in-out border-2 ${
              playerCount === count
                ? "bg-indigo-600 border-indigo-400 scale-110 shadow-lg text-white"
                : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
            aria-pressed={playerCount === count}
          >
            {count} Players
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 my-6">
        <div className="flex items-center">
          <input
            id="test-mode-checkbox"
            type="checkbox"
            checked={isTestMode}
            onChange={(e) => setIsTestMode(e.target.checked)}
            className="h-5 w-5 rounded bg-white border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="test-mode-checkbox"
            className="ml-3 text-slate-600 cursor-pointer"
          >
            Test Mode (Single user plays for everyone)
          </label>
        </div>
        {isTestMode && (
          <>
            <div className="flex items-center ml-6">
              <input
                id="skip-draft-checkbox"
                type="checkbox"
                checked={skipDraft}
                onChange={(e) => setSkipDraft(e.target.checked)}
                className="h-5 w-5 rounded bg-white border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <label
                htmlFor="skip-draft-checkbox"
                className="ml-3 text-slate-600 cursor-pointer"
              >
                Skip Draft Phase (Random tile distribution)
              </label>
            </div>
            <div className="flex items-center ml-6">
              <input
                id="skip-campaign-checkbox"
                type="checkbox"
                checked={skipCampaign}
                disabled={!skipDraft}
                onChange={(e) => setSkipCampaign(e.target.checked)}
                className={`h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 ${
                  !skipDraft
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-white cursor-pointer"
                }`}
              />
              <label
                htmlFor="skip-campaign-checkbox"
                className={`ml-3 ${
                  !skipDraft
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-600 cursor-pointer"
                }`}
              >
                Skip Campaign Phase (Go directly to Bureaucracy)
              </label>
            </div>
          </>
        )}
      </div>
      <button
        onClick={() =>
          onStartGame(playerCount, isTestMode, skipDraft, skipCampaign)
        }
        className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-500 transition-colors shadow-md hover:shadow-lg"
      >
        Start Game
      </button>
    </main>
  );
};

export default PlayerSelectionScreen;
