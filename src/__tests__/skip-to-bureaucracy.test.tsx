import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { GameProviders } from "../providers/GameProviders";

describe("Skip to Bureaucracy Phase", () => {
  it("allows starting game with test mode, skip draft, and skip campaign all checked", async () => {
    const user = userEvent.setup();
    render(
      <GameProviders>
        <App />
      </GameProviders>
    );

    // Test mode should be checked by default
    const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
    expect(testModeCheckbox).toBeChecked();

    // Check skip draft
    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    await user.click(skipDraftCheckbox);
    expect(skipDraftCheckbox).toBeChecked();

    // Check skip campaign
    const skipCampaignCheckbox = screen.getByRole('checkbox', { name: /skip campaign phase/i });
    await user.click(skipCampaignCheckbox);
    expect(skipCampaignCheckbox).toBeChecked();

    // All three should be checked now
    expect(testModeCheckbox).toBeChecked();
    expect(skipDraftCheckbox).toBeChecked();
    expect(skipCampaignCheckbox).toBeChecked();
  });

  it("skips directly to bureaucracy phase when all skip options are checked", async () => {
    const user = userEvent.setup();
    render(
      <GameProviders>
        <App />
      </GameProviders>
    );

    // Select 3 players
    await user.click(screen.getByRole('button', { name: /3 players/i }));

    // Test mode is checked by default
    const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
    expect(testModeCheckbox).toBeChecked();

    // Check skip draft
    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    await user.click(skipDraftCheckbox);

    // Check skip campaign
    const skipCampaignCheckbox = screen.getByRole('checkbox', { name: /skip campaign phase/i });
    await user.click(skipCampaignCheckbox);

    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));

    // Should skip directly to bureaucracy phase
    await waitFor(() => {
      // Look for bureaucracy phase indicators
      const bureaucracyText = screen.queryByText(/bureaucracy/i);
      expect(bureaucracyText).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it("bureaucracy phase displays after skipping draft and campaign", async () => {
    const user = userEvent.setup();
    render(
      <GameProviders>
        <App />
      </GameProviders>
    );

    // Select 4 players (default)
    // Test mode is checked by default

    // Check skip draft
    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    await user.click(skipDraftCheckbox);

    // Check skip campaign
    const skipCampaignCheckbox = screen.getByRole('checkbox', { name: /skip campaign phase/i });
    await user.click(skipCampaignCheckbox);

    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));

    // Wait for bureaucracy phase
    await waitFor(() => {
      const hasBureaucracy = screen.queryByText(/bureaucracy/i);
      expect(hasBureaucracy).toBeTruthy();
    }, { timeout: 10000 });

    // Verify we're in a playable state
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("works with 5 players and all skip options", async () => {
    const user = userEvent.setup();
    render(
      <GameProviders>
        <App />
      </GameProviders>
    );

    // Select 5 players
    await user.click(screen.getByRole('button', { name: /5 players/i }));

    // Check skip draft
    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    await user.click(skipDraftCheckbox);

    // Check skip campaign
    const skipCampaignCheckbox = screen.getByRole('checkbox', { name: /skip campaign phase/i });
    await user.click(skipCampaignCheckbox);

    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));

    // Should go to bureaucracy
    await waitFor(() => {
      const hasBureaucracy = screen.queryByText(/bureaucracy/i);
      expect(hasBureaucracy).toBeTruthy();
    }, { timeout: 10000 });
  });

  it("assigns tiles to players that are usable in the next campaign after skipping to bureaucracy", async () => {
    const user = userEvent.setup();
    render(
      <GameProviders>
        <App />
      </GameProviders>
    );

    // Select 3 players for faster testing
    await user.click(screen.getByRole('button', { name: /3 players/i }));

    // Check skip draft and campaign
    await user.click(screen.getByRole('checkbox', { name: /skip draft phase/i }));
    await user.click(screen.getByRole('checkbox', { name: /skip campaign phase/i }));

    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));

    // Wait for bureaucracy phase
    await waitFor(() => {
      expect(screen.queryByText(/bureaucracy/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // In 3-player mode, each player should have 8 tiles in bureaucracy (24/3)
    // The "Skip Bureaucracy" button is actually "Finish Turn" in the UI
    // Let's finish all players' bureaucracy turns.
    // There are 3 players, so we need to click "Finish Turn" or "Done" multiple times.
    
    // For each player (1 to 3)
    for (let i = 0; i < 3; i++) {
      // Wait for the "Finish Turn" button (it might be "Done" or something else depending on state)
      // Usually BureaucracyScreen has a "Finish Turn" button.
      const finishButton = await screen.findByRole('button', { name: /finish turn/i });
      await user.click(finishButton);
      
      // If there's a confirmation modal "You still have Kredcoin remaining", click "Confirm"
      const confirmButton = screen.queryByRole('button', { name: /confirm/i });
      if (confirmButton) {
        await user.click(confirmButton);
      }
    }

    // After all players finish, it should transition to CAMPAIGN phase
    await waitFor(() => {
      expect(screen.queryByText(/campaign/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Now verify that the current player has tiles in their hand
    // In CampaignScreen, tiles are usually displayed. 
    // We can look for tile images (e.g., images/01.svg)
    const tiles = screen.getAllByRole('img').filter(img => 
      img.getAttribute('src')?.match(/\d+\.svg/)
    );
    
    expect(tiles.length).toBeGreaterThan(0);
    // Specifically, for 3 players, it should be 8 tiles if none were spent.
    expect(tiles.length).toBe(8);
  });
}, 30000);


