import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BureaucracyScreen from "../../../components/screens/BureaucracyScreen";
import type { Player, Piece, BoardTile, Tile } from "../../../types";
import type {
  BureaucracyPlayerState,
  BureaucracyMenuItem,
  BureaucracyPurchase,
} from "../../../../game";

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display bureaucracy phase title", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText("Bureaucracy Phase")).toBeInTheDocument();
  });

  it("should display current player information", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it("should display kredcoin balance", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText(/Kredcoin: ₭-10/)).toBeInTheDocument();
  });

  it("should display the game board image", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    const boardImage = screen.getByAltText("3-player board");
    expect(boardImage).toHaveAttribute("src", "./images/board_3p.svg");
  });

  it("should show purchase menu when showPurchaseMenu is true", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should display finish turn button in purchase menu", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

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

    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={mockPurchase}
        showPurchaseMenu={false}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText("Perform Your Action")).toBeInTheDocument();
    expect(screen.getByText(/Perform a ADVANCE move/)).toBeInTheDocument();
  });

  it("should display turn order with current player highlighted", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText("Turn Order")).toBeInTheDocument();
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
  });

  it("should show validation error modal when validationError is present", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError="Invalid move!"
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    expect(screen.getByText("Invalid Action")).toBeInTheDocument();
    const resetButton = screen.getByText("Reset Pieces");
    fireEvent.click(resetButton);
    expect(mockOnResetAction).toHaveBeenCalledTimes(1);
  });

  it("should display board rotation toggle", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

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

    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={mockPurchase}
        showPurchaseMenu={false}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={true}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    const checkButton = screen.getByText("✓ Check Move");
    expect(checkButton).toBeInTheDocument();
    fireEvent.click(checkButton);
    expect(mockOnCheckMove).toHaveBeenCalledTimes(1);
  });

  it("should show move check result modal when result is available", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={true}
        moveCheckResult={{ isValid: true, reason: "Move is correct" }}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

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

    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={mockPurchase}
        showPurchaseMenu={false}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    const doneButton = screen.getByText("Done");
    fireEvent.click(doneButton);
    expect(mockOnDoneWithAction).toHaveBeenCalledTimes(1);
  });

  it("should render pieces on the board", () => {
    render(
      <BureaucracyScreen
        players={mockPlayers}
        pieces={mockPieces}
        boardTiles={mockBoardTiles}
        playerCount={3}
        currentBureaucracyPlayerIndex={0}
        bureaucracyStates={mockBureaucracyStates}
        currentPurchase={null}
        showPurchaseMenu={true}
        validationError={null}
        turnOrder={[1, 2]}
        boardRotationEnabled={false}
        setBoardRotationEnabled={mockSetBoardRotationEnabled}
        onSelectMenuItem={mockOnSelectMenuItem}
        onDoneWithAction={mockOnDoneWithAction}
        onFinishTurn={mockOnFinishTurn}
        onPieceMove={mockOnPieceMove}
        onPiecePromote={mockOnPiecePromote}
        onClearValidationError={mockOnClearValidationError}
        onResetAction={mockOnResetAction}
        onCheckMove={mockOnCheckMove}
        showMoveCheckResult={false}
        moveCheckResult={null}
        onCloseMoveCheckResult={mockOnCloseMoveCheckResult}
        isTestMode={false}
        BOARD_IMAGE_URLS={mockBoardImages}
        credibilityRotationAdjustments={mockCredibilityAdjustments}
      />
    );

    const pieceImage = screen.getByAltText("Mark");
    expect(pieceImage).toBeInTheDocument();
    expect(pieceImage).toHaveAttribute("src", "./images/pieces/mark_1.svg");
  });
});
