/**
 * Tests for DraftingScreen component
 *
 * Screen for the drafting phase where players select tiles from their hand.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DraftingScreen from "../../../components/screens/DraftingScreen";
import type { Player, Tile } from "../../../types";
import { RosterProvider } from "../../../providers/RosterProvider";
import { PhaseProvider } from "../../../providers/PhaseProvider";

function renderWithProviders(
  ui: React.ReactElement,
  {
    players,
    currentPlayerIndex = 0,
  }: { players: Player[]; currentPlayerIndex?: number },
) {
  return render(
    <PhaseProvider initial={{ currentPlayerIndex }}>
      <RosterProvider initial={{ players }}>{ui}</RosterProvider>
    </PhaseProvider>,
  );
}

describe("DraftingScreen", () => {

  const mockOnSelectTile = vi.fn();

  const mockTiles: Tile[] = [
    { id: 1, url: "./images/tiles/01.png" },
    { id: 2, url: "./images/tiles/02.png" },
    { id: 3, url: "./images/tiles/03.png" },
  ];

  // Each player has both hand and keptTiles arrays
  const mockPlayers: Player[] = [
    {
      id: 1,
      hand: [mockTiles[0], mockTiles[1]],
      keptTiles: [mockTiles[2]],
      bureaucracyTiles: [],
      credibility: 10,
    },
    {
      id: 2,
      hand: [mockTiles[2]],
      keptTiles: [mockTiles[0]],
      bureaucracyTiles: [],
      credibility: 10,
    },
  ];

  beforeEach(() => {
    mockOnSelectTile.mockClear();
  });


  it("should display drafting phase title", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );
    expect(screen.getByText("Drafting Phase")).toBeInTheDocument();
  });


  it("should show current player information", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );
    expect(screen.getByText("Drafting Phase")).toBeInTheDocument();
    expect(screen.getByText("Select one tile to keep, then remaining tiles pass left.")).toBeInTheDocument();
  });


  it("should display current round information", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );
    expect(screen.getByText("Available Tiles (2 tiles)")).toBeInTheDocument();
  });


  it("should display tile images in drafting phase", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );
    const tileImage1 = screen.getByAltText("Tile 1");
    const tileImage2 = screen.getByAltText("Tile 2");
    expect(tileImage1).toBeInTheDocument();
    expect(tileImage2).toBeInTheDocument();
    expect(tileImage1).toHaveAttribute("src", "./images/tiles/01.png");
    expect(tileImage2).toHaveAttribute("src", "./images/tiles/02.png");
  });

  it("should display hand count", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );

    expect(screen.getByText("My Hand (1 tile)")).toBeInTheDocument();
  });

  it("should allow clicking tiles to select them", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );

    const tileButton = screen.getByLabelText("Select tile 1");
    fireEvent.click(tileButton);

    expect(mockOnSelectTile).toHaveBeenCalledWith(mockTiles[0]);
  });

  it("should render tile buttons with proper styling", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 0 },
    );

    const tileButton = screen.getByLabelText("Select tile 1");
    expect(tileButton).toHaveClass("hover:scale-105");
  });

  it("should show correct player when currentPlayerIndex changes", () => {
    renderWithProviders(
      <DraftingScreen onSelectTile={mockOnSelectTile} />,
      { players: mockPlayers, currentPlayerIndex: 1 },
    );

    // currentPlayerIndex=1 → player 2 is active; hand has 1 tile, keptTiles has 1 tile
    expect(screen.getByText("Available Tiles (1 tiles)")).toBeInTheDocument();
    expect(screen.getByText("My Hand (1 tile)")).toBeInTheDocument();
  });
});
