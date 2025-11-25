/**
 * Tests for PlayerSelectionScreen component
 * 
 * Screen for selecting player count and game options before starting the game.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlayerSelectionScreen from "../../../components/screens/PlayerSelectionScreen";

describe("PlayerSelectionScreen", () => {
  const mockOnStartGame = vi.fn();

  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  it("should render the logo and tagline", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const logo = screen.getByAltText("Kred Logo");
    expect(logo).toBeInTheDocument();
    expect(screen.getByText("You can't trust anyone!")).toBeInTheDocument();
  });

  it("should render the title and description", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    expect(screen.getByText("Select Players")).toBeInTheDocument();
    expect(screen.getByText("Choose 3, 4, or 5 players to begin.")).toBeInTheDocument();
  });

  it("should render player count buttons for 3, 4, and 5 players", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    expect(screen.getByText("3 Players")).toBeInTheDocument();
    expect(screen.getByText("4 Players")).toBeInTheDocument();
    expect(screen.getByText("5 Players")).toBeInTheDocument();
  });

  it("should have 4 players selected by default", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const fourPlayerButton = screen.getByText("4 Players");
    expect(fourPlayerButton).toHaveClass("bg-indigo-600");
  });

  it("should allow selecting different player counts", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const threePlayerButton = screen.getByText("3 Players");
    fireEvent.click(threePlayerButton);
    
    expect(threePlayerButton).toHaveClass("bg-indigo-600");
  });

  it("should have test mode checkbox checked by default", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const testModeCheckbox = screen.getByLabelText(/Test Mode/i);
    expect(testModeCheckbox).toBeChecked();
  });

  it("should allow toggling test mode", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const testModeCheckbox = screen.getByLabelText(/Test Mode/i);
    fireEvent.click(testModeCheckbox);
    
    expect(testModeCheckbox).not.toBeChecked();
  });

  it("should render skip draft phase checkbox when test mode is enabled", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    expect(screen.getByLabelText(/Skip Draft Phase/i)).toBeInTheDocument();
  });

  it("should render skip campaign phase checkbox when test mode is enabled", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    expect(screen.getByLabelText(/Skip Campaign Phase/i)).toBeInTheDocument();
  });

  it("should disable skip campaign checkbox when skip draft is unchecked", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const skipCampaignCheckbox = screen.getByLabelText(/Skip Campaign Phase/i) as HTMLInputElement;
    expect(skipCampaignCheckbox.disabled).toBe(true);
  });

  it("should uncheck skip campaign when skip draft is unchecked", async () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const skipDraftCheckbox = screen.getByLabelText(/Skip Draft Phase/i);
    const skipCampaignCheckbox = screen.getByLabelText(/Skip Campaign Phase/i);
    
    // Check both boxes
    fireEvent.click(skipDraftCheckbox);
    fireEvent.click(skipCampaignCheckbox);
    
    expect(skipCampaignCheckbox).toBeChecked();
    
    // Uncheck skip draft
    fireEvent.click(skipDraftCheckbox);
    
    // Skip campaign should auto-uncheck
    await waitFor(() => {
      expect(skipCampaignCheckbox).not.toBeChecked();
    });
  });

  it("should render start game button", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const startButton = screen.getByText("Start Game");
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveClass("bg-green-600");
  });

  it("should call onStartGame with correct parameters when start button is clicked", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    const startButton = screen.getByText("Start Game");
    fireEvent.click(startButton);
    
    expect(mockOnStartGame).toHaveBeenCalledWith(4, true, false, false);
  });

  it("should call onStartGame with selected options", () => {
    render(<PlayerSelectionScreen onStartGame={mockOnStartGame} />);
    
    // Select 5 players
    fireEvent.click(screen.getByText("5 Players"));
    
    // Enable skip options
    fireEvent.click(screen.getByLabelText(/Skip Draft Phase/i));
    fireEvent.click(screen.getByLabelText(/Skip Campaign Phase/i));
    
    // Start game
    fireEvent.click(screen.getByText("Start Game"));
    
    expect(mockOnStartGame).toHaveBeenCalledWith(5, true, true, true);
  });
});
