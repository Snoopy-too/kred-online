import { render, screen } from "@testing-library/react";
import App from "../../App";

describe("App smoke test", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText(/select players/i)).toBeInTheDocument();
  });
});
