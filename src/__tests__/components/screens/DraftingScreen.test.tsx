/**
 * Tests for DraftingScreen component
 *
 * Screen for the drafting phase where players select tiles from their hand.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DraftingScreen from "../../../components/screens/DraftingScreen";
import type { Player, Tile } from "../../../types";

describe("DraftingScreen", () => {
  const mockOnSelectTile = vi.fn();

  const mockTiles: Tile[] = [
    { id: 1, url: "./images/tiles/01.png" },
    { id: 2, url: "./images/tiles/02.png" },
    { id: 3, url: "./images/tiles/03.png" },
  ];

  const mockPlayers: Player[] = [
    {
      id: 1,
      hand: [mockTiles[0], mockTiles[1]],
      keptTiles: [],
      bureaucracyTiles: [],
      credibility: 10,
    },
    {
      id: 2,
      hand: [mockTiles[2]],
      keptTiles: [],
      bureaucracyTiles: [],
      credibility: 10,
    },
  ];

  beforeEach(() => {
    mockOnSelectTile.mockClear();
  });

  it("should display drafting phase title", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    expect(screen.getByText("Drafting Phase")).toBeInTheDocument();
  });

  it("should show current player information", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
    expect(screen.getByText("Select one tile to keep.")).toBeInTheDocument();
  });

  it("should display current round information", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={2}
        onSelectTile={mockOnSelectTile}
      />
    );

    // handSize = keptTiles.length + hand.length = 0 + 2 = 2
    expect(screen.getByText("Round 2 of 2")).toBeInTheDocument();
  });

  it("should display tile images in drafting phase", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    const tileImage1 = screen.getByAltText("Tile 1");
    const tileImage2 = screen.getByAltText("Tile 2");

    expect(tileImage1).toBeInTheDocument();
    expect(tileImage2).toBeInTheDocument();
    expect(tileImage1).toHaveAttribute("src", "./images/tiles/01.png");
    expect(tileImage2).toHaveAttribute("src", "./images/tiles/02.png");
  });

  it("should display hand count", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    expect(screen.getByText("Your Hand (2 tiles)")).toBeInTheDocument();
  });

  it("should allow clicking tiles to select them", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    const tileButton = screen.getByLabelText("Select tile 1");
    fireEvent.click(tileButton);

    expect(mockOnSelectTile).toHaveBeenCalledWith(mockTiles[0]);
  });

  it("should render tile buttons with proper styling", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={0}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    const tileButton = screen.getByLabelText("Select tile 1");
    expect(tileButton).toHaveClass("hover:scale-105");
  });

  it("should show correct player when currentPlayerIndex changes", () => {
    render(
      <DraftingScreen
        players={mockPlayers}
        currentPlayerIndex={1}
        draftRound={1}
        onSelectTile={mockOnSelectTile}
      />
    );

    expect(screen.getByText("Player 2's Turn")).toBeInTheDocument();
    expect(screen.getByText("Your Hand (1 tiles)")).toBeInTheDocument();
  });
});
