import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CampaignScreen from "../../../components/screens/CampaignScreen";
import type {
  Player,
  Piece,
  BoardTile,
  Tile,
  TileReceivingSpace,
  TrackedMove,
  GameState,
  BureaucracyMenuItem,
} from "../../../types";

describe("CampaignScreen", () => {
  const mockOnNewGame = vi.fn();
  const mockOnPieceMove = vi.fn();
  const mockOnBoardTileMove = vi.fn();
  const mockOnEndTurn = vi.fn();
  const mockOnPlaceTile = vi.fn();
  const mockOnRevealTile = vi.fn();
  const mockOnReceiverDecision = vi.fn();
  const mockOnBystanderDecision = vi.fn();
  const mockOnTogglePrivateView = vi.fn();
  const mockOnContinueAfterChallenge = vi.fn();
  const mockOnPlacerViewTile = vi.fn();
  const mockOnSetGiveReceiverViewingTileId = vi.fn();
  const mockSetDummyTile = vi.fn();
  const mockSetBoardRotationEnabled = vi.fn();
  const mockSetShowGridOverlay = vi.fn();
  const mockOnReceiverAcceptanceDecision = vi.fn();
  const mockOnChallengerDecision = vi.fn();
  const mockOnCorrectionComplete = vi.fn();
  const mockOnCloseMoveCheckResult = vi.fn();
  const mockOnCheckMove = vi.fn();
  const mockSetCredibilityRotationAdjustments = vi.fn();
  const mockSetIsGameLogExpanded = vi.fn();
  const mockSetIsCredibilityAdjusterExpanded = vi.fn();
  const mockSetIsCredibilityRulesExpanded = vi.fn();
  const mockSetIsPieceTrackerExpanded = vi.fn();
  const mockSetShowPerfectTileModal = vi.fn();
  const mockOnBonusMoveComplete = vi.fn();
  const mockOnResetTurn = vi.fn();
  const mockOnResetPiecesCorrection = vi.fn();
  const mockOnResetBonusMove = vi.fn();
  const mockOnTakeAdvantageDecline = vi.fn();
  const mockOnTakeAdvantageYes = vi.fn();
  const mockOnRecoverCredibility = vi.fn();
  const mockOnPurchaseMove = vi.fn();
  const mockOnToggleTileSelection = vi.fn();
  const mockOnConfirmTileSelection = vi.fn();
  const mockOnCancelTileSelection = vi.fn();
  const mockOnSelectTakeAdvantageAction = vi.fn();
  const mockOnResetTakeAdvantageAction = vi.fn();
  const mockOnDoneTakeAdvantageAction = vi.fn();
  const mockOnTakeAdvantagePiecePromote = vi.fn();

  const mockTile: Tile = {
    id: 1,
    url: "./images/tiles/01.png",
  };

  const mockPlayers: Player[] = [
    {
      id: 1,
      hand: [mockTile],
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
      placerId: 1,
      ownerId: 2,
    },
  ];

  const mockBankedTiles: (BoardTile & { faceUp: boolean })[] = [];

  const mockCredibilityAdjustments = {
    1: 0,
    2: 0,
  };

  const defaultProps = {
    gameState: "CAMPAIGN" as GameState,
    playerCount: 3,
    players: mockPlayers,
    pieces: mockPieces,
    boardTiles: mockBoardTiles,
    bankedTiles: mockBankedTiles,
    currentPlayerId: 1,
    lastDroppedPosition: null,
    lastDroppedPieceId: null,
    isTestMode: false,
    dummyTile: null,
    setDummyTile: mockSetDummyTile,
    boardRotationEnabled: false,
    setBoardRotationEnabled: mockSetBoardRotationEnabled,
    showGridOverlay: false,
    setShowGridOverlay: mockSetShowGridOverlay,
    hasPlayedTileThisTurn: false,
    revealedTileId: null,
    tileTransaction: null,
    isPrivatelyViewing: false,
    bystanders: [],
    bystanderIndex: 0,
    showChallengeRevealModal: false,
    challengedTile: null,
    placerViewingTileId: null,
    giveReceiverViewingTileId: null,
    gameLog: [],
    onNewGame: mockOnNewGame,
    onPieceMove: mockOnPieceMove,
    onBoardTileMove: mockOnBoardTileMove,
    onEndTurn: mockOnEndTurn,
    onPlaceTile: mockOnPlaceTile,
    onRevealTile: mockOnRevealTile,
    onReceiverDecision: mockOnReceiverDecision,
    onBystanderDecision: mockOnBystanderDecision,
    onTogglePrivateView: mockOnTogglePrivateView,
    onContinueAfterChallenge: mockOnContinueAfterChallenge,
    onPlacerViewTile: mockOnPlacerViewTile,
    onSetGiveReceiverViewingTileId: mockOnSetGiveReceiverViewingTileId,
    credibilityRotationAdjustments: mockCredibilityAdjustments,
    setCredibilityRotationAdjustments: mockSetCredibilityRotationAdjustments,
    isGameLogExpanded: false,
    setIsGameLogExpanded: mockSetIsGameLogExpanded,
    isCredibilityAdjusterExpanded: false,
    setIsCredibilityAdjusterExpanded: mockSetIsCredibilityAdjusterExpanded,
    isCredibilityRulesExpanded: false,
    setIsCredibilityRulesExpanded: mockSetIsCredibilityRulesExpanded,
    isPieceTrackerExpanded: false,
    setIsPieceTrackerExpanded: mockSetIsPieceTrackerExpanded,
    showPerfectTileModal: false,
    setShowPerfectTileModal: mockSetShowPerfectTileModal,
    showBonusMoveModal: false,
    bonusMovePlayerId: null,
    onBonusMoveComplete: mockOnBonusMoveComplete,
    movedPiecesThisTurn: new Set<string>(),
    onResetTurn: mockOnResetTurn,
    onResetPiecesCorrection: mockOnResetPiecesCorrection,
    onResetBonusMove: mockOnResetBonusMove,
    showTakeAdvantageModal: false,
    takeAdvantageChallengerId: null,
    takeAdvantageChallengerCredibility: 3,
    showTakeAdvantageTileSelection: false,
    selectedTilesForAdvantage: [],
    totalKredcoinForAdvantage: 0,
    showTakeAdvantageMenu: false,
    takeAdvantagePurchase: null,
    takeAdvantageValidationError: null,
    onTakeAdvantageDecline: mockOnTakeAdvantageDecline,
    onTakeAdvantageYes: mockOnTakeAdvantageYes,
    onRecoverCredibility: mockOnRecoverCredibility,
    onPurchaseMove: mockOnPurchaseMove,
    onToggleTileSelection: mockOnToggleTileSelection,
    onConfirmTileSelection: mockOnConfirmTileSelection,
    onCancelTileSelection: mockOnCancelTileSelection,
    onSelectTakeAdvantageAction: mockOnSelectTakeAdvantageAction,
    onResetTakeAdvantageAction: mockOnResetTakeAdvantageAction,
    onDoneTakeAdvantageAction: mockOnDoneTakeAdvantageAction,
    onTakeAdvantagePiecePromote: mockOnTakeAdvantagePiecePromote,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display campaign phase title", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText("Campaign Phase")).toBeInTheDocument();
  });

  it("should display current player information", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it("should display the game board image", () => {
    render(<CampaignScreen {...defaultProps} />);
    const boardImage = screen.getByAltText("3-player board");
    expect(boardImage).toBeInTheDocument();
  });

  it("should render pieces on the board", () => {
    render(<CampaignScreen {...defaultProps} />);
    const pieceImage = screen.getByAltText("Mark");
    expect(pieceImage).toBeInTheDocument();
    expect(pieceImage).toHaveAttribute("src", "./images/pieces/mark_1.svg");
  });

  it("should display player hand with tiles", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText("Your Hand (1)")).toBeInTheDocument();
  });

  it("should display end turn button", () => {
    render(<CampaignScreen {...defaultProps} />);
    const endTurnButton = screen.getByText("End Turn");
    expect(endTurnButton).toBeInTheDocument();
    fireEvent.click(endTurnButton);
    expect(mockOnEndTurn).toHaveBeenCalledTimes(1);
  });

  it("should display board rotation toggle", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText(/Board Rotation/)).toBeInTheDocument();
  });

  it("should display grid overlay toggle", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText(/Grid Overlay/)).toBeInTheDocument();
  });

  it("should show undo button when tile has been played", () => {
    render(<CampaignScreen {...defaultProps} hasPlayedTileThisTurn={true} />);
    expect(screen.getByText(/Undo/)).toBeInTheDocument();
  });

  it("should display tile receiving spaces when player has tiles", () => {
    render(<CampaignScreen {...defaultProps} />);
    // Tile receiving spaces are rendered for other players
    expect(screen.getByText("Player 2")).toBeInTheDocument();
  });

  it("should show perfect tile modal when showPerfectTileModal is true", () => {
    render(<CampaignScreen {...defaultProps} showPerfectTileModal={true} />);
    expect(screen.getByText(/Perfect Tile/)).toBeInTheDocument();
  });

  it("should show bonus move modal when showBonusMoveModal is true", () => {
    render(
      <CampaignScreen
        {...defaultProps}
        showBonusMoveModal={true}
        bonusMovePlayerId={1}
      />
    );
    expect(screen.getByText(/Bonus Move/)).toBeInTheDocument();
  });

  it("should display credibility for all players", () => {
    render(<CampaignScreen {...defaultProps} />);
    // Credibility indicators should be rendered on the board
    const credibilityImages = screen.getAllByAltText(/Credibility for Player/);
    expect(credibilityImages.length).toBeGreaterThan(0);
  });

  it("should show test mode check move button when in test mode", () => {
    render(
      <CampaignScreen
        {...defaultProps}
        isTestMode={true}
        hasPlayedTileThisTurn={true}
      />
    );
    expect(screen.getByText(/Check Tile/)).toBeInTheDocument();
  });

  it("should display game log toggle button", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText(/Game Log/)).toBeInTheDocument();
  });

  it("should show tile transaction modal when tileTransaction exists", () => {
    const transaction = {
      placerId: 1,
      receiverId: 2,
      boardTileId: "board_tile_1",
      tile: mockTile,
    };
    render(<CampaignScreen {...defaultProps} tileTransaction={transaction} />);
    expect(screen.getByText(/has given you a tile/)).toBeInTheDocument();
  });

  it("should display take advantage modal when showTakeAdvantageModal is true", () => {
    render(
      <CampaignScreen
        {...defaultProps}
        showTakeAdvantageModal={true}
        takeAdvantageChallengerId={2}
        takeAdvantageChallengerCredibility={1}
      />
    );
    expect(screen.getByText(/Take Advantage/)).toBeInTheDocument();
  });

  it("should call onResetTurn when reset turn button is clicked", () => {
    render(<CampaignScreen {...defaultProps} gameState="TILE_PLAYED" />);
    const resetButton = screen.getByText(/Reset Turn/);
    fireEvent.click(resetButton);
    expect(mockOnResetTurn).toHaveBeenCalledTimes(1);
  });

  it("should toggle board rotation when checkbox is clicked", () => {
    render(<CampaignScreen {...defaultProps} isTestMode={true} />);
    const checkbox = screen.getByRole("checkbox", { name: /Board Rotation/ });
    fireEvent.click(checkbox);
    expect(mockSetBoardRotationEnabled).toHaveBeenCalledWith(true);
  });

  it("should toggle grid overlay when checkbox is clicked", () => {
    render(<CampaignScreen {...defaultProps} isTestMode={true} />);
    const checkbox = screen.getByRole("checkbox", { name: /Grid Overlay/ });
    fireEvent.click(checkbox);
    expect(mockSetShowGridOverlay).toHaveBeenCalledWith(true);
  });
});
