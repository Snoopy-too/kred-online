/**
 * Tests for ErrorDisplay component
 *
 * A simple error boundary UI that displays when the game fails to load.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorDisplay from "../../../components/shared/ErrorDisplay";

describe("ErrorDisplay", () => {
  it("should render error message", () => {
    render(<ErrorDisplay />);

    expect(screen.getByText("Error Loading Game")).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred/)
    ).toBeInTheDocument();
  });

  it("should display error icon", () => {
    render(<ErrorDisplay />);

    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("should have a reload button", () => {
    render(<ErrorDisplay />);

    const reloadButton = screen.getByText("Reload Page");
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toHaveClass("bg-cyan-600");
  });

  it("should reload page when button is clicked", () => {
    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    render(<ErrorDisplay />);

    const reloadButton = screen.getByText("Reload Page");
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledOnce();
  });

  it("should apply proper styling classes", () => {
    const { container } = render(<ErrorDisplay />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass("min-h-screen", "bg-gray-900");

    const errorCard = screen.getByText("Error Loading Game").closest("div");
    expect(errorCard).toHaveClass("bg-gray-800", "border-red-500");
  });
});
