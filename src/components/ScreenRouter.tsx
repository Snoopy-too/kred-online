import React from "react";
import DraftingScreen from "./screens/DraftingScreen";
import PlayerSelectionScreen from "./screens/PlayerSelectionScreen";
import BureaucracyScreen from "./screens/BureaucracyScreen";
import CampaignScreen from "./screens/CampaignScreen";
import { usePhase } from "../providers/PhaseProvider";
import { useRoster } from "../providers/RosterProvider";
import { useHandlers, useCampaignHandlers } from "../providers/HandlersProvider";

/**
 * ScreenRouter
 *
 * Thin switch over gameState. Takes no props — everything it needs
 * comes from providers (gameState, players) or HandlersContext
 * (multiplayer config, handlers, UI state). Screens consume the same
 * providers directly; ScreenRouter only dispatches to the right screen.
 */
const ScreenRouter: React.FC = () => {
  const { gameState, currentPlayerIndex } = usePhase();
  const { players } = useRoster();
  const { isMultiplayer, playerIndex, onStartGame } = useHandlers();

  // Multiplayer loading guard: wait for player data sync before rendering screens.
  if (isMultiplayer) {
    const isValidPlayers =
      Array.isArray(players) && players.length > 0 && players.every((p) => p && typeof p === "object");
    const isValidPlayerIndex =
      typeof playerIndex === "number" && playerIndex >= 0 && playerIndex < players.length;
    const isValidCurrentPlayerIndex =
      typeof currentPlayerIndex === "number" && currentPlayerIndex >= 0 && currentPlayerIndex < players.length;

    if (!isValidPlayers || !isValidPlayerIndex || !isValidCurrentPlayerIndex) {
      const loadingMessage = !isValidPlayers
        ? "Loading players..."
        : !isValidPlayerIndex
        ? "Syncing player index..."
        : "Syncing current player...";

      return (
        <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              {loadingMessage}
            </h1>
            <p className="text-slate-400 mt-2">Syncing game state from server...</p>
          </div>
        </main>
      );
    }
  }

  switch (gameState) {
    case "PLAYER_SELECTION":
      return <PlayerSelectionScreen onStartGame={onStartGame} />;
    case "DRAFTING":
      return <DraftingScreen />;
    case "BUREAUCRACY":
      return <BureaucracyScreen />;
    case "CAMPAIGN":
    case "SELECTING_TILE":
    case "TILE_PLAYED":
    case "PENDING_ACCEPTANCE":
    case "PENDING_CHALLENGE":
    case "TAKE_ADVANTAGE":
    case "BONUS_MOVE":
    case "CORRECTION_REQUIRED": {
      const currentPlayer = players[currentPlayerIndex];
      if (!currentPlayer || players.length === 0) {
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center text-slate-300">
            Loading campaign... (currentPlayer issue)
          </div>
        );
      }
      return <CampaignScreen />;
    }
    default:
      return <UnknownStateFallback />;
  }
};

const UnknownStateFallback: React.FC = () => {
  const { gameState } = usePhase();
  const { onNewGame } = useCampaignHandlers();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "2rem",
      }}
    >
      <h2>Unknown game state: {gameState}</h2>
      <button
        onClick={onNewGame}
        style={{
          marginTop: "2rem",
          padding: "1rem 2rem",
          fontSize: "1.2em",
          background: "white",
          color: "#667eea",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Start New Game
      </button>
    </div>
  );
};

export default ScreenRouter;
