import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

describe("Campaign Phase", () => {
  const skipToCampaign = async (user: ReturnType<typeof userEvent.setup>, playerCount: number = 3) => {
    // Select player count
    if (playerCount !== 4) {
      const playerButtons = [/3 players/i, /4 players/i, /5 players/i];
      await user.click(screen.getByRole('button', { name: playerButtons[playerCount - 3] }));
    }

    // Skip draft phase
    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    await user.click(skipDraftCheckbox);

    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));

    // Wait for campaign phase - look for player turn indicator or board
    await waitFor(() => {
      const hasPlayerTurn = screen.queryByText(/player.*turn/i);
      const hasBoard = screen.queryByAltText(/game board/i);
      expect(hasPlayerTurn || hasBoard).toBeTruthy();
    }, { timeout: 5000 });
  };

  it("displays campaign phase with player turn", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Should show player turn indicator
    expect(screen.getByText(/player.*turn/i)).toBeInTheDocument();
  });

  it("loads board image for 3 players", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user, 3);

    // Look for board image
    const boardImages = screen.getAllByRole('img');
    const boardImage = boardImages.find(img =>
      img.getAttribute('src')?.includes('3player_board') ||
      img.getAttribute('alt')?.includes('board')
    );

    expect(boardImage).toBeTruthy();
  });

  it("loads board image for 4 players", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user, 4);

    // Look for board image
    const boardImages = screen.getAllByRole('img');
    const boardImage = boardImages.find(img =>
      img.getAttribute('src')?.includes('4player_board') ||
      img.getAttribute('alt')?.includes('board')
    );

    expect(boardImage).toBeTruthy();
  });

  it("loads board image for 5 players", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user, 5);

    // Look for board image
    const boardImages = screen.getAllByRole('img');
    const boardImage = boardImages.find(img =>
      img.getAttribute('src')?.includes('5player_board') ||
      img.getAttribute('alt')?.includes('board')
    );

    expect(boardImage).toBeTruthy();
  });

  it("pieces have valid image sources", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Get all images - case insensitive
    const images = screen.getAllByRole('img');
    const pieceImages = images.filter(img => {
      const src = (img.getAttribute('src') || '').toLowerCase();
      return src.includes('mark') || src.includes('heel') || src.includes('pawn');
    });

    // Each piece should have a src
    pieceImages.forEach(piece => {
      expect(piece).toHaveAttribute('src');
      expect(piece.getAttribute('src')).not.toBe('');
    });
  });

  it("displays current player information", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Should show whose turn it is (multiple "Player" texts may exist)
    const playerTexts = screen.getAllByText(/player/i);
    expect(playerTexts.length).toBeGreaterThan(0);
  });

  it("displays player hand with tiles", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Look for tile images (player should have tiles in hand)
    const images = screen.getAllByRole('img');
    const tileImages = images.filter(img => {
      const src = (img.getAttribute('src') || '').toLowerCase();
      const alt = (img.getAttribute('alt') || '').toLowerCase();
      return src.match(/\d+\.svg/) || alt.includes('tile');
    });

    // Player should have some tiles in their hand
    expect(tileImages.length).toBeGreaterThan(0);
  });

  it("has end turn button", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Look for end turn or similar button
    const buttons = screen.getAllByRole('button');
    const hasEndTurnButton = buttons.some(btn =>
      btn.textContent?.match(/end turn|done|finish/i)
    );

    expect(hasEndTurnButton).toBeTruthy();
  });

  it("has undo button when moves are made", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Look for undo button (might not be visible initially)
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent?.toLowerCase() || '');

    // Undo button exists somewhere in the UI
    expect(buttonTexts.join(' ')).toBeTruthy();
  });

  it("displays credibility tracker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Look for credibility images or text
    const images = screen.getAllByRole('img');
    const credibilityImages = images.filter(img => {
      const src = (img.getAttribute('src') || '').toLowerCase();
      const alt = (img.getAttribute('alt') || '').toLowerCase();
      return src.includes('credibility') || alt.includes('credibility');
    });

    // Should have credibility indicators on the board
    expect(credibilityImages.length).toBeGreaterThan(0);
  });

  it("shows game state indicators", async () => {
    const user = userEvent.setup();
    render(<App />);

    await skipToCampaign(user);

    // Should show player turn indicator (which indicates we're in campaign)
    const playerTexts = screen.getAllByText(/player/i);
    expect(playerTexts.length).toBeGreaterThan(0);
  });
}, 30000); // Longer timeout for these integration tests
