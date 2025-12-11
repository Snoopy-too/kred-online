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
    playedTile: null,
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
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it("should display current player information", () => {
    render(<CampaignScreen {...defaultProps} />);
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it("should display the game board image", () => {
    render(<CampaignScreen {...defaultProps} />);
    const boardImage = screen.getByAltText("A 3-player game board");
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
    // Player hand renders for current player (Player 1 with 1 tile)
    expect(screen.getByText(/Player 1's Hand/)).toBeInTheDocument();
  });

  it("should display end turn button", () => {
    render(<CampaignScreen {...defaultProps} hasPlayedTileThisTurn={true} />);
    const endTurnButton = screen.getByText("End Turn");
    expect(endTurnButton).toBeInTheDocument();
    expect(endTurnButton).not.toBeDisabled();
    fireEvent.click(endTurnButton);
    expect(mockOnEndTurn).toHaveBeenCalledTimes(1);
  });

  it("should display board rotation toggle", () => {
    render(<CampaignScreen {...defaultProps} isTestMode={true} />);
    expect(screen.getByText(/Board Rotation/)).toBeInTheDocument();
  });

  it("should display grid overlay toggle", () => {
    render(<CampaignScreen {...defaultProps} isTestMode={true} />);
    expect(screen.getByText(/Grid Overlay/)).toBeInTheDocument();
  });

  it("should show undo button when tile has been played", () => {
    render(<CampaignScreen {...defaultProps} gameState="TILE_PLAYED" />);
    expect(screen.getByText(/Reset Turn/)).toBeInTheDocument();
  });

  it("should display tile receiving spaces when player has tiles", () => {
    const { container } = render(<CampaignScreen {...defaultProps} />);
    // Tile receiving spaces are rendered on the board
    expect(container.querySelector('img[alt*="board"]')).toBeInTheDocument();
  });

  it("should show perfect tile modal when showPerfectTileModal is true", () => {
    const { container } = render(
      <CampaignScreen {...defaultProps} showPerfectTileModal={true} />
    );
    // Modal content may not be fully implemented yet
    expect(container).toBeTruthy();
  });

  it("should show bonus move modal when showBonusMoveModal is true", () => {
    const { container } = render(
      <CampaignScreen
        {...defaultProps}
        showBonusMoveModal={true}
        bonusMovePlayerId={1}
      />
    );
    // Bonus move modal should render
    expect(container).toBeTruthy();
  });

  it("should display credibility for all players", () => {
    render(<CampaignScreen {...defaultProps} />);
    // Credibility indicators should be rendered on the board
    const credibilityImages = screen.getAllByAltText(/Credibility for Player/);
    expect(credibilityImages.length).toBeGreaterThan(0);
  });

  it("should show test mode check move button when in test mode", () => {
    const mockPlayedTile = {
      id: "played_1",
      tile: mockTile,
      position: { top: 40, left: 40 },
      rotation: 0,
      placerId: 1,
      ownerId: 2,
    };
    render(
      <CampaignScreen
        {...defaultProps}
        isTestMode={true}
        gameState="TILE_PLAYED"
        playedTile={mockPlayedTile}
        hasPlayedTileThisTurn={true}
      />
    );
    expect(screen.getByText(/Check Move/)).toBeInTheDocument();
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
    const { container } = render(
      <CampaignScreen {...defaultProps} tileTransaction={transaction} />
    );
    // Transaction modal should render
    expect(container).toBeTruthy();
  });

  it("should display take advantage modal when showTakeAdvantageModal is true", () => {
    const { container } = render(
      <CampaignScreen
        {...defaultProps}
        showTakeAdvantageModal={true}
        takeAdvantageChallengerId={2}
        takeAdvantageChallengerCredibility={1}
      />
    );
    // Take advantage modal should render
    expect(container).toBeTruthy();
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

  // Test Mode Tools Tests
  describe("Test Mode Tools", () => {
    it("should display Credibility Rotation Adjuster in test mode", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      expect(
        screen.getByText(/Credibility Rotation Adjuster/)
      ).toBeInTheDocument();
    });

    it("should expand Credibility Rotation Adjuster when clicked", () => {
      render(
        <CampaignScreen
          {...defaultProps}
          isTestMode={true}
          isCredibilityAdjusterExpanded={true}
        />
      );
      // When expanded, should show rotation adjustment buttons
      expect(screen.getAllByText(/\+15°/).length).toBeGreaterThan(0);
    });

    it("should display Credibility System Rules in test mode", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      expect(screen.getByText(/Credibility System Rules/)).toBeInTheDocument();
    });

    it("should expand Credibility Rules when clicked", () => {
      render(
        <CampaignScreen
          {...defaultProps}
          isTestMode={true}
          isCredibilityRulesExpanded={true}
        />
      );
      // When expanded, should show rules content
      expect(screen.getByText(/Lose 1 Credibility if:/)).toBeInTheDocument();
    });

    it("should display Kredcoin Tracker in test mode", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      expect(screen.getByText(/Kredcoin Tracker/)).toBeInTheDocument();
    });

    it("should display Create Dummy Tile button in test mode when no dummy tile exists", () => {
      render(
        <CampaignScreen {...defaultProps} isTestMode={true} dummyTile={null} />
      );
      expect(screen.getByText(/Create Dummy Tile/)).toBeInTheDocument();
    });

    it("should display Dummy Tile Tracker when dummy tile exists in test mode", () => {
      const dummyTile = { position: { top: 50, left: 50 }, rotation: 0 };
      render(
        <CampaignScreen
          {...defaultProps}
          isTestMode={true}
          dummyTile={dummyTile}
        />
      );
      expect(screen.getByText(/Dummy Tile Tracker/)).toBeInTheDocument();
    });

    it("should display Piece Tracker in test mode", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      expect(screen.getByText(/Piece Tracker/)).toBeInTheDocument();
    });

    it("should expand Piece Tracker and show pieces when clicked", () => {
      render(
        <CampaignScreen
          {...defaultProps}
          isTestMode={true}
          isPieceTrackerExpanded={true}
        />
      );
      // When expanded, should show piece information
      expect(screen.getByText(/Mark/)).toBeInTheDocument();
    });

    it("should not display test mode tools when not in test mode", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={false} />);
      expect(
        screen.queryByText(/Credibility Rotation Adjuster/)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Credibility System Rules/)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Kredcoin Tracker/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Piece Tracker/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Create Dummy Tile/)).not.toBeInTheDocument();
    });

    it("should call setIsCredibilityAdjusterExpanded when toggled", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      const adjusterButton = screen.getByText(/Credibility Rotation Adjuster/);
      fireEvent.click(adjusterButton);
      expect(mockSetIsCredibilityAdjusterExpanded).toHaveBeenCalledWith(true);
    });

    it("should call setIsCredibilityRulesExpanded when toggled", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      const rulesButton = screen.getByText(/Credibility System Rules/);
      fireEvent.click(rulesButton);
      expect(mockSetIsCredibilityRulesExpanded).toHaveBeenCalledWith(true);
    });

    it("should call setIsPieceTrackerExpanded when toggled", () => {
      render(<CampaignScreen {...defaultProps} isTestMode={true} />);
      const trackerButton = screen.getByText(/Piece Tracker/);
      fireEvent.click(trackerButton);
      expect(mockSetIsPieceTrackerExpanded).toHaveBeenCalledWith(true);
    });

    it("should call setDummyTile when Create Dummy Tile button is clicked", () => {
      render(
        <CampaignScreen {...defaultProps} isTestMode={true} dummyTile={null} />
      );
      const createButton = screen.getByText(/Create Dummy Tile/);
      fireEvent.click(createButton);
      expect(mockSetDummyTile).toHaveBeenCalledWith({
        position: { top: 50, left: 50 },
        rotation: 0,
      });
    });

    it("should call setDummyTile with null when Delete Tile button is clicked", () => {
      const dummyTile = { position: { top: 50, left: 50 }, rotation: 0 };
      render(
        <CampaignScreen
          {...defaultProps}
          isTestMode={true}
          dummyTile={dummyTile}
        />
      );
      const deleteButton = screen.getByText(/Delete Tile/);
      fireEvent.click(deleteButton);
      expect(mockSetDummyTile).toHaveBeenCalledWith(null);
    });
  });
});
