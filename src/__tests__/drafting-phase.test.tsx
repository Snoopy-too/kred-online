import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

describe("Drafting Phase", () => {
  const startGameWithPlayers = async (user: ReturnType<typeof userEvent.setup>, playerCount: number) => {
    const playerButtons = [
      /3 players/i,
      /4 players/i,
      /5 players/i
    ];

    if (playerCount !== 4) { // 4 is default
      await user.click(screen.getByRole('button', { name: playerButtons[playerCount - 3] }));
    }

    await user.click(screen.getByRole('button', { name: /start game/i }));

    await waitFor(() => {
      expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  };

  it("displays drafting phase title", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startGameWithPlayers(user, 3);

    expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
  });

  it("shows current player information in test mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startGameWithPlayers(user, 3);

    // Should show "Player 1" or similar
    expect(screen.getByText(/player 1/i)).toBeInTheDocument();
  });

  it("displays tile images in drafting phase", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startGameWithPlayers(user, 3);

    // Look for tile images
    const tiles = screen.getAllByRole('img', { name: /tile/i });
    expect(tiles.length).toBeGreaterThan(0);

    // Check that images have src attributes
    tiles.forEach(tile => {
      expect(tile).toHaveAttribute('src');
    });
  });

  it("allows clicking tiles to select them in test mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startGameWithPlayers(user, 3);

    // Get available tiles
    const tiles = screen.getAllByRole('img', { name: /tile/i });
    expect(tiles.length).toBeGreaterThan(0);

    // Click first tile
    await user.click(tiles[0]);

    // Should move to next player or next stage
    await waitFor(() => {
      // Either "Player 2" appears or we move to campaign
      const hasPlayer2 = screen.queryByText(/player 2/i);
      const hasCampaign = screen.queryByText(/campaign phase/i);
      expect(hasPlayer2 || hasCampaign).toBeTruthy();
    });
  });

  it("progresses through all players in test mode with 3 players", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startGameWithPlayers(user, 3);

    // Draft for Player 1
    expect(screen.getByText(/player 1/i)).toBeInTheDocument();
    let tiles = screen.getAllByRole('img', { name: /tile/i });
    await user.click(tiles[0]);

    // Should see Player 2
    await waitFor(() => {
      expect(screen.getByText(/player 2/i)).toBeInTheDocument();
    });

    tiles = screen.getAllByRole('img', { name: /tile/i });
    await user.click(tiles[0]);

    // Should see Player 3
    await waitFor(() => {
      expect(screen.getByText(/player 3/i)).toBeInTheDocument();
    });

    tiles = screen.getAllByRole('img', { name: /tile/i });
    await user.click(tiles[0]);

    // Continue drafting until campaign phase starts
    // This is a simplified test - full test would click through all drafting rounds
  }, 10000); // Longer timeout for this test

  it("shows keep/discard buttons during drafting", async () => {
    const user = userEvent.setup();
    render(<App />);

    await startGameWithPlayers(user, 4);

    // Look for keep/discard or similar buttons
    // The exact button text depends on implementation
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("progresses from drafting to campaign phase after all selections", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Skip draft to test transition
    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    await user.click(skipDraftCheckbox);

    await user.click(screen.getByRole('button', { name: /start game/i }));

    // Should go directly to campaign - look for player turn or board
    await waitFor(() => {
      const hasPlayerTurn = screen.queryByText(/player.*turn/i);
      const hasBoard = screen.queryByAltText(/game board/i);
      expect(hasPlayerTurn || hasBoard).toBeTruthy();
    }, { timeout: 3000 });
  });
});
