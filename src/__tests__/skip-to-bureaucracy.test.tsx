import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

describe("Skip to Bureaucracy Phase", () => {
  it("allows starting game with test mode, skip draft, and skip campaign all checked", async () => {
    const user = userEvent.setup();
    render(<App />);

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
    render(<App />);

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
    }, { timeout: 5000 });
  });

  it("bureaucracy phase displays after skipping draft and campaign", async () => {
    const user = userEvent.setup();
    render(<App />);

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
    }, { timeout: 5000 });

    // Verify we're in a playable state
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("works with 5 players and all skip options", async () => {
    const user = userEvent.setup();
    render(<App />);

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
    }, { timeout: 5000 });
  });
}, 30000);
