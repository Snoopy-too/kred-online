import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

describe("Game Start", () => {
  describe("Test Mode", () => {
    it("starts game with 3 players in test mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select 3 players
      await user.click(screen.getByRole('button', { name: /3 players/i }));

      // Ensure test mode is on
      const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
      expect(testModeCheckbox).toBeChecked();

      // Start game
      await user.click(screen.getByRole('button', { name: /start game/i }));

      // Should show drafting screen
      await waitFor(() => {
        expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
      });
    });

    it("starts game with 4 players in test mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // 4 players is default
      const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
      expect(testModeCheckbox).toBeChecked();

      // Start game
      await user.click(screen.getByRole('button', { name: /start game/i }));

      // Should show drafting screen
      await waitFor(() => {
        expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
      });
    });

    it("starts game with 5 players in test mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select 5 players
      await user.click(screen.getByRole('button', { name: /5 players/i }));

      // Ensure test mode is on
      const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
      expect(testModeCheckbox).toBeChecked();

      // Start game
      await user.click(screen.getByRole('button', { name: /start game/i }));

      // Should show drafting screen
      await waitFor(() => {
        expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
      });
    });
  });

  describe("Normal Mode", () => {
    it("starts game with 3 players in normal mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select 3 players
      await user.click(screen.getByRole('button', { name: /3 players/i }));

      // Turn off test mode
      const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
      await user.click(testModeCheckbox);
      expect(testModeCheckbox).not.toBeChecked();

      // Start game
      await user.click(screen.getByRole('button', { name: /start game/i }));

      // Should show drafting screen
      await waitFor(() => {
        expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
      });
    });

    it("starts game with 4 players in normal mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // 4 players is default
      // Turn off test mode
      const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
      await user.click(testModeCheckbox);
      expect(testModeCheckbox).not.toBeChecked();

      // Start game
      await user.click(screen.getByRole('button', { name: /start game/i }));

      // Should show drafting screen
      await waitFor(() => {
        expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
      });
    });

    it("starts game with 5 players in normal mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select 5 players
      await user.click(screen.getByRole('button', { name: /5 players/i }));

      // Turn off test mode
      const testModeCheckbox = screen.getByRole('checkbox', { name: /test mode/i });
      await user.click(testModeCheckbox);
      expect(testModeCheckbox).not.toBeChecked();

      // Start game
      await user.click(screen.getByRole('button', { name: /start game/i }));

      // Should show drafting screen
      await waitFor(() => {
        expect(screen.getByText(/drafting phase/i)).toBeInTheDocument();
      });
    });
  });
});
