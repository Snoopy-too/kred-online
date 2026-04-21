import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BureaucracyScreen from "../../../components/screens/BureaucracyScreen";
import type { Player, Piece, BoardTile, Tile } from "../../../types";
import type {
  BureaucracyPlayerState,
  BureaucracyMenuItem,
  BureaucracyPurchase,
} from "../../../../game";
import { RosterProvider } from "../../../providers/RosterProvider";
import { BoardProvider } from "../../../providers/BoardProvider";
import { PhaseProvider } from "../../../providers/PhaseProvider";
import { BureaucracyProvider } from "../../../providers/BureaucracyProvider";

describe("BureaucracyScreen", () => {
  const mockOnSelectMenuItem = vi.fn();
  const mockOnDoneWithAction = vi.fn();
  const mockOnFinishTurn = vi.fn();
  const mockOnPieceMove = vi.fn();
  const mockOnPiecePromote = vi.fn();
  const mockOnClearValidationError = vi.fn();
  const mockOnResetAction = vi.fn();
  const mockOnCheckMove = vi.fn();
  const mockOnCloseMoveCheckResult = vi.fn();
  const mockSetBoardRotationEnabled = vi.fn();

  const mockTile: Tile = {
    id: 1,
    url: "./images/tiles/01.png",
  };

  const mockPlayers: Player[] = [
    {
      id: 1,
      hand: [],
      keptTiles: [],
      bureaucracyTiles: [],
      credibility: 3,
    },
    {
      id: 2,
      hand: [],
      keptTiles: [],
      bureaucracyTiles: [],
      credibility: 2,
    },
  ];

  const mockPieces: Piece[] = [
    {
      id: "mark_1_1",
      type: "mark",
      playerId: 1,
      name: "Mark",
      position: { top: 50, left: 50 },
      rotation: 0,
      imageUrl: "./images/pieces/mark_1.svg",
      locationId: "seat_1",
    },
  ];

  const mockBoardTiles: BoardTile[] = [
    {
      id: "board_tile_1",
      tile: mockTile,
      position: { top: 30, left: 30 },
      rotation: 0,
    },
  ];

  const mockBureaucracyStates: BureaucracyPlayerState[] = [
    {
      playerId: 1,
      remainingKredcoin: 10,
      turnComplete: false,
      movesMade: [],
    },
    {
      playerId: 2,
      remainingKredcoin: 8,
      turnComplete: false,
      movesMade: [],
    },
  ];

  const mockBoardImages = {
    3: "./images/board_3p.svg",
    4: "./images/board_4p.svg",
    5: "./images/board_5p.svg",
  };

  const mockCredibilityAdjustments = {
    1: 0,
    2: 0,
  };

  const defaultProps = {
    playerCount: 3,
    currentPurchase: null as BureaucracyPurchase | null,
    showPurchaseMenu: true,
    validationError: null as string | null,
    boardRotationEnabled: false,
    setBoardRotationEnabled: mockSetBoardRotationEnabled,
    onSelectMenuItem: mockOnSelectMenuItem,
    onDoneWithAction: mockOnDoneWithAction,
    onFinishTurn: mockOnFinishTurn,
    onPieceMove: mockOnPieceMove,
    onPiecePromote: mockOnPiecePromote,
    onClearValidationError: mockOnClearValidationError,
    onResetAction: mockOnResetAction,
    onCheckMove: mockOnCheckMove,
    showMoveCheckResult: false,
    moveCheckResult: null as { isValid: boolean; reason: string } | null,
    onCloseMoveCheckResult: mockOnCloseMoveCheckResult,
    isTestMode: false,
    BOARD_IMAGE_URLS: mockBoardImages,
    credibilityRotationAdjustments: mockCredibilityAdjustments,
  };

  type Overrides = Partial<typeof defaultProps> & {
    players?: Player[];
    pieces?: Piece[];
    boardTiles?: BoardTile[];
    bureaucracyStates?: BureaucracyPlayerState[];
    turnOrder?: number[];
    currentBureaucracyPlayerIndex?: number;
  };

  function renderBureaucracy(overrides: Overrides = {}) {
    const {
      players = mockPlayers,
      pieces = mockPieces,
      boardTiles = mockBoardTiles,
      bureaucracyStates = mockBureaucracyStates,
      turnOrder = [1, 2],
      currentBureaucracyPlayerIndex = 0,
      ...props
    } = overrides;

    return render(
      <PhaseProvider initial={{ gameState: "BUREAUCRACY" }}>
        <RosterProvider initial={{ players, pieces }}>
          <BoardProvider initial={{ boardTiles }}>
            <BureaucracyProvider
              initial={{
                bureaucracyStates,
                bureaucracyTurnOrder: turnOrder,
                currentBureaucracyPlayerIndex,
              }}
            >
              <BureaucracyScreen {...defaultProps} {...props} />
            </BureaucracyProvider>
          </BoardProvider>
        </RosterProvider>
      </PhaseProvider>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display bureaucracy phase title", () => {
    renderBureaucracy();
    expect(screen.getByText("Bureaucracy Phase")).toBeInTheDocument();
  });

  it("should display current player information", () => {
    renderBureaucracy();
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it("should display kredcoin balance", () => {
    renderBureaucracy();
    expect(screen.getByText(/Kredcoin: ₭-10/)).toBeInTheDocument();
  });

  it("should display the game board image", () => {
    renderBureaucracy();
    const boardImage = screen.getByAltText("3-player board");
    expect(boardImage).toHaveAttribute("src", "./images/board_3p.svg");
  });

  it("should show purchase menu when showPurchaseMenu is true", () => {
    renderBureaucracy();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should display finish turn button in purchase menu", () => {
    renderBureaucracy();
    const finishButton = screen.getByText("Finish Turn");
    expect(finishButton).toBeInTheDocument();
    fireEvent.click(finishButton);
    expect(mockOnFinishTurn).toHaveBeenCalledTimes(1);
  });

  it("should show action in progress panel when purchase is active", () => {
    const mockPurchase: BureaucracyPurchase = {
      item: {
        id: "move_1",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 2,
      },
    };
    renderBureaucracy({ currentPurchase: mockPurchase, showPurchaseMenu: false });
    expect(screen.getByText("Perform Your Action")).toBeInTheDocument();
    expect(screen.getByText(/Perform a ADVANCE move/)).toBeInTheDocument();
  });

  it("should display turn order with current player highlighted", () => {
    renderBureaucracy();
    expect(screen.getByText("Turn Order")).toBeInTheDocument();
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
  });

  it("should show validation error modal when validationError is present", () => {
    renderBureaucracy({ validationError: "Invalid move!" });
    expect(screen.getByText("Invalid Action")).toBeInTheDocument();
    const resetButton = screen.getByText("Reset Pieces");
    fireEvent.click(resetButton);
    expect(mockOnResetAction).toHaveBeenCalledTimes(1);
  });

  it("should display board rotation toggle", () => {
    renderBureaucracy();
    expect(screen.getByText("Board Rotation (OFF)")).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(mockSetBoardRotationEnabled).toHaveBeenCalledWith(true);
  });

  it("should show check move button in test mode during action", () => {
    const mockPurchase: BureaucracyPurchase = {
      item: {
        id: "move_1",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 2,
      },
    };
    renderBureaucracy({
      currentPurchase: mockPurchase,
      showPurchaseMenu: false,
      isTestMode: true,
    });
    const checkButton = screen.getByText("✓ Check Move");
    expect(checkButton).toBeInTheDocument();
    fireEvent.click(checkButton);
    expect(mockOnCheckMove).toHaveBeenCalledTimes(1);
  });

  it("should show move check result modal when result is available", () => {
    renderBureaucracy({
      showMoveCheckResult: true,
      moveCheckResult: { isValid: true, reason: "Move is correct" },
    });
    expect(screen.getByText("Valid Move!")).toBeInTheDocument();
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    expect(mockOnCloseMoveCheckResult).toHaveBeenCalledTimes(1);
  });

  it("should call onDoneWithAction when done button is clicked", () => {
    const mockPurchase: BureaucracyPurchase = {
      item: {
        id: "move_1",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 2,
      },
    };
    renderBureaucracy({ currentPurchase: mockPurchase, showPurchaseMenu: false });
    const doneButton = screen.getByText("Done");
    fireEvent.click(doneButton);
    expect(mockOnDoneWithAction).toHaveBeenCalledTimes(1);
  });

  it("should render pieces on the board", () => {
    renderBureaucracy();
    const pieceImage = screen.getByAltText("Mark");
    expect(pieceImage).toBeInTheDocument();
    expect(pieceImage).toHaveAttribute("src", "./images/pieces/mark_1.svg");
  });
});
