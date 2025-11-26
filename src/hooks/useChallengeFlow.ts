import { useState } from "react";
import type { Player, Tile, Piece } from "../types";
import type { BureaucracyPurchase } from "../../game";

/**
 * Custom hook for managing challenge flow and take advantage mechanics.
 *
 * Provides state for:
 * - Challenge reveal process (bystanders viewing)
 * - Challenged tile data
 * - Private viewing state
 * - Take Advantage rewards (after successful challenge)
 * - Tile selection for advantage
 * - Kredcoin totals for advantage
 * - Advantage purchase and validation
 *
 * Dependencies: Typically used with useGameState for player data
 *
 * @returns Challenge flow state and management functions
 */
export function useChallengeFlow() {
  // Challenge reveal state
  const [bystanders, setBystanders] = useState<Player[]>([]);
  const [bystanderIndex, setBystanderIndex] = useState(0);
  const [isPrivatelyViewing, setIsPrivatelyViewing] = useState(false);
  const [showChallengeRevealModal, setShowChallengeRevealModal] =
    useState(false);
  const [challengedTile, setChallengedTile] = useState<Tile | null>(null);

  // Take Advantage modal and state
  const [showTakeAdvantageModal, setShowTakeAdvantageModal] = useState(false);
  const [takeAdvantageChallengerId, setTakeAdvantageChallengerId] = useState<
    number | null
  >(null);
  const [
    takeAdvantageChallengerCredibility,
    setTakeAdvantageChallengerCredibility,
  ] = useState<number>(0);

  // Tile selection for advantage
  const [showTakeAdvantageTileSelection, setShowTakeAdvantageTileSelection] =
    useState(false);
  const [selectedTilesForAdvantage, setSelectedTilesForAdvantage] = useState<
    Tile[]
  >([]);
  const [totalKredcoinForAdvantage, setTotalKredcoinForAdvantage] = useState(0);

  // Purchase menu and validation
  const [showTakeAdvantageMenu, setShowTakeAdvantageMenu] = useState(false);
  const [takeAdvantagePurchase, setTakeAdvantagePurchase] =
    useState<BureaucracyPurchase | null>(null);
  const [takeAdvantagePiecesSnapshot, setTakeAdvantagePiecesSnapshot] =
    useState<Piece[]>([]);
  const [takeAdvantageValidationError, setTakeAdvantageValidationError] =
    useState<string | null>(null);

  /**
   * Initialize the challenge reveal process.
   * @param bystanderPlayers - The players who will view the tile
   * @param tile - The tile being challenged
   */
  const initiateChallengeReveal = (bystanderPlayers: Player[], tile: Tile) => {
    setBystanders(bystanderPlayers);
    setBystanderIndex(0);
    setChallengedTile(tile);
    setShowChallengeRevealModal(true);
    setIsPrivatelyViewing(false);
  };

  /**
   * Move to the next bystander in the reveal sequence.
   */
  const nextBystander = () => {
    setBystanderIndex((prev) => prev + 1);
  };

  /**
   * Check if there are more bystanders to show the tile to.
   * @returns True if there are more bystanders
   */
  const hasMoreBystanders = (): boolean => {
    return bystanderIndex < bystanders.length - 1;
  };

  /**
   * Get the current bystander.
   * @returns The current bystander or undefined
   */
  const getCurrentBystander = (): Player | undefined => {
    return bystanders[bystanderIndex];
  };

  /**
   * Set the private viewing state.
   * @param isPrivate - Whether viewing is private
   */
  const setPrivateViewing = (isPrivate: boolean) => {
    setIsPrivatelyViewing(isPrivate);
  };

  /**
   * Close the challenge reveal modal.
   */
  const closeChallengeReveal = () => {
    setShowChallengeRevealModal(false);
    setBystanders([]);
    setBystanderIndex(0);
    setChallengedTile(null);
    setIsPrivatelyViewing(false);
  };

  /**
   * Initiate the Take Advantage reward process.
   * @param challengerId - The player who successfully challenged
   * @param credibility - The challenger's credibility value
   */
  const initiateTakeAdvantage = (challengerId: number, credibility: number) => {
    setTakeAdvantageChallengerId(challengerId);
    setTakeAdvantageChallengerCredibility(credibility);
    setShowTakeAdvantageModal(true);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
    setTakeAdvantageValidationError(null);
  };

  /**
   * Close the Take Advantage modal.
   */
  const closeTakeAdvantage = () => {
    setShowTakeAdvantageModal(false);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
    setShowTakeAdvantageTileSelection(false);
    setShowTakeAdvantageMenu(false);
    setTakeAdvantagePurchase(null);
    setTakeAdvantagePiecesSnapshot([]);
    setTakeAdvantageValidationError(null);
  };

  /**
   * Show the tile selection UI for advantage.
   */
  const showTileSelection = () => {
    setShowTakeAdvantageTileSelection(true);
  };

  /**
   * Hide the tile selection UI.
   */
  const hideTileSelection = () => {
    setShowTakeAdvantageTileSelection(false);
  };

  /**
   * Add a tile to the advantage selection.
   * @param tile - The tile to add
   */
  const addTileToAdvantage = (tile: Tile) => {
    setSelectedTilesForAdvantage((prev) => [...prev, tile]);
  };

  /**
   * Remove a tile from the advantage selection.
   * @param tileId - The ID of the tile to remove
   */
  const removeTileFromAdvantage = (tileId: number) => {
    setSelectedTilesForAdvantage((prev) => prev.filter((t) => t.id !== tileId));
  };

  /**
   * Update the total kredcoin available for advantage.
   * @param total - The total kredcoin amount
   */
  const updateAdvantageKredcoin = (total: number) => {
    setTotalKredcoinForAdvantage(total);
  };

  /**
   * Show the advantage purchase menu.
   */
  const showPurchaseMenu = () => {
    setShowTakeAdvantageMenu(true);
  };

  /**
   * Hide the advantage purchase menu.
   */
  const hidePurchaseMenu = () => {
    setShowTakeAdvantageMenu(false);
  };

  /**
   * Set the advantage purchase.
   * @param purchase - The purchase to make
   */
  const setAdvantagePurchase = (purchase: BureaucracyPurchase | null) => {
    setTakeAdvantagePurchase(purchase);
  };

  /**
   * Snapshot pieces before advantage moves.
   * @param pieces - The current pieces
   */
  const snapshotAdvantagesPieces = (pieces: Piece[]) => {
    setTakeAdvantagePiecesSnapshot(pieces.map((p) => ({ ...p })));
  };

  /**
   * Set a validation error for advantage.
   * @param error - The error message or null
   */
  const setAdvantageError = (error: string | null) => {
    setTakeAdvantageValidationError(error);
  };

  /**
   * Reset all challenge flow state.
   */
  const resetChallengeFlow = () => {
    closeChallengeReveal();
    closeTakeAdvantage();
  };

  return {
    // Challenge reveal state
    bystanders,
    bystanderIndex,
    isPrivatelyViewing,
    showChallengeRevealModal,
    challengedTile,

    // Take advantage state
    showTakeAdvantageModal,
    takeAdvantageChallengerId,
    takeAdvantageChallengerCredibility,
    showTakeAdvantageTileSelection,
    selectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    showTakeAdvantageMenu,
    takeAdvantagePurchase,
    takeAdvantagePiecesSnapshot,
    takeAdvantageValidationError,

    // Challenge reveal actions
    initiateChallengeReveal,
    nextBystander,
    hasMoreBystanders,
    getCurrentBystander,
    setPrivateViewing,
    closeChallengeReveal,

    // Take advantage actions
    initiateTakeAdvantage,
    closeTakeAdvantage,
    showTileSelection,
    hideTileSelection,
    addTileToAdvantage,
    removeTileFromAdvantage,
    updateAdvantageKredcoin,
    showPurchaseMenu,
    hidePurchaseMenu,
    setAdvantagePurchase,
    snapshotAdvantagesPieces,
    setAdvantageError,
    resetChallengeFlow,

    // Direct setters (for backward compatibility)
    setBystanders,
    setBystanderIndex,
    setIsPrivatelyViewing,
    setShowChallengeRevealModal,
    setChallengedTile,
    setShowTakeAdvantageModal,
    setTakeAdvantageChallengerId,
    setTakeAdvantageChallengerCredibility,
    setShowTakeAdvantageTileSelection,
    setSelectedTilesForAdvantage,
    setTotalKredcoinForAdvantage,
    setShowTakeAdvantageMenu,
    setTakeAdvantagePurchase,
    setTakeAdvantagePiecesSnapshot,
    setTakeAdvantageValidationError,
  };
}
