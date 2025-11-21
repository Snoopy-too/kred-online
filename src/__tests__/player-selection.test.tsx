import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

describe("Player Selection Screen", () => {
  it("renders the logo and tagline", () => {
    render(<App />);

    const logo = screen.getByAltText(/kred logo/i);
    expect(logo).toBeInTheDocument();
    expect(screen.getByText(/you can't trust anyone!/i)).toBeInTheDocument();
  });

  it("renders the title and description", () => {
    render(<App />);

    expect(screen.getByText(/select players/i)).toBeInTheDocument();
    expect(screen.getByText(/choose 3, 4, or 5 players to begin/i)).toBeInTheDocument();
  });

  it("renders player count buttons for 3, 4, and 5 players", () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /3 players/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4 players/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5 players/i })).toBeInTheDocument();
  });

  it("has test mode checkbox checked by default", () => {
    render(<App />);

    const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
    expect(testModeCheckbox).toBeChecked();
  });

  it("renders skip draft phase checkbox", () => {
    render(<App />);

    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    expect(skipDraftCheckbox).toBeInTheDocument();
    expect(skipDraftCheckbox).not.toBeChecked();
  });

  it("renders skip campaign phase checkbox", () => {
    render(<App />);

    const skipCampaignCheckbox = screen.getByRole('checkbox', { name: /skip campaign phase/i });
    expect(skipCampaignCheckbox).toBeInTheDocument();
    expect(skipCampaignCheckbox).not.toBeChecked();
  });

  it("renders start game button", () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
  });

  it("allows selecting different player counts", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Default is 4 players, check it's selected
    const fourPlayerBtn = screen.getByRole('button', { name: /4 players/i });
    expect(fourPlayerBtn).toHaveClass('bg-indigo-600');

    // Click 3 players
    const threePlayerBtn = screen.getByRole('button', { name: /3 players/i });
    await user.click(threePlayerBtn);
    expect(threePlayerBtn).toHaveClass('bg-indigo-600');

    // Click 5 players
    const fivePlayerBtn = screen.getByRole('button', { name: /5 players/i });
    await user.click(fivePlayerBtn);
    expect(fivePlayerBtn).toHaveClass('bg-indigo-600');
  });

  it("allows toggling test mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
    expect(testModeCheckbox).toBeChecked();

    await user.click(testModeCheckbox);
    expect(testModeCheckbox).not.toBeChecked();

    await user.click(testModeCheckbox);
    expect(testModeCheckbox).toBeChecked();
  });

  it("unchecks skip campaign when skip draft is unchecked", async () => {
    const user = userEvent.setup();
    render(<App />);

    const skipDraftCheckbox = screen.getByRole('checkbox', { name: /skip draft phase/i });
    const skipCampaignCheckbox = screen.getByRole('checkbox', { name: /skip campaign phase/i });

    // Check both
    await user.click(skipDraftCheckbox);
    await user.click(skipCampaignCheckbox);
    expect(skipDraftCheckbox).toBeChecked();
    expect(skipCampaignCheckbox).toBeChecked();

    // Uncheck skip draft - should auto-uncheck skip campaign
    await user.click(skipDraftCheckbox);
    expect(skipDraftCheckbox).not.toBeChecked();
    expect(skipCampaignCheckbox).not.toBeChecked();
  });
});
