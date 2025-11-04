/// <reference types="@testing-library/jest-dom" />
// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import LegendSection from "../LegendSelection";

/**
 * LegendSection tests
 * Verifies render, toggles, keyboard shortcuts, and legend entries.
 */

describe("LegendSection Component", () => {
  const toggleFullscreen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /* ---------- 1. Initial render ---------- */
  test("renders header, buttons, and legend items", () => {
    render(
      <LegendSection isFullscreen={false} toggleFullscreen={toggleFullscreen} />
    );

    expect(screen.getByText(/Visualizer Controls/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Hide Legend/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Fullscreen/i })
    ).toBeInTheDocument();

    // Legend title and key item labels
    expect(screen.getByText(/Visualizer Legend/i)).toBeInTheDocument();
    expect(screen.getByText(/Mandatory Feature/i)).toBeInTheDocument();
    expect(screen.getByText(/Tree Link/i)).toBeInTheDocument();
  });

  /* ---------- 2. Legend toggle ---------- */
  test("toggles legend visibility when Hide Legend button is clicked", () => {
    render(
      <LegendSection isFullscreen={false} toggleFullscreen={toggleFullscreen} />
    );
    const toggleButton = screen.getByRole("button", { name: /Hide Legend/i });
    fireEvent.click(toggleButton);
    expect(
      screen.getByRole("button", { name: /Show Legend/i })
    ).toBeInTheDocument();
  });

  /* ---------- 3. Fullscreen toggle ---------- */
  test("calls toggleFullscreen when fullscreen button is clicked", () => {
    render(
      <LegendSection isFullscreen={false} toggleFullscreen={toggleFullscreen} />
    );
    const fullscreenButton = screen.getByRole("button", {
      name: /Fullscreen/i,
    });
    fireEvent.click(fullscreenButton);
    expect(toggleFullscreen).toHaveBeenCalledTimes(1);
  });

  /* ---------- 4. Keyboard shortcuts ---------- */
  test("Shift+L toggles legend visibility", () => {
    render(
      <LegendSection isFullscreen={false} toggleFullscreen={toggleFullscreen} />
    );
    fireEvent.keyDown(window, { shiftKey: true, key: "L" });
    expect(
      screen.getByRole("button", { name: /Show Legend/i })
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { shiftKey: true, key: "L" });
    expect(
      screen.getByRole("button", { name: /Hide Legend/i })
    ).toBeInTheDocument();
  });

  test("Shift+F triggers fullscreen toggle", () => {
    render(
      <LegendSection isFullscreen={false} toggleFullscreen={toggleFullscreen} />
    );
    fireEvent.keyDown(window, { shiftKey: true, key: "F" });
    expect(toggleFullscreen).toHaveBeenCalledTimes(1);
  });

  test("Escape exits fullscreen mode if currently fullscreen", () => {
    // Define it manually since jsdom doesn't have it
    Object.defineProperty(document, "exitFullscreen", {
      writable: true,
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    render(
      <LegendSection isFullscreen={true} toggleFullscreen={toggleFullscreen} />
    );
    fireEvent.keyDown(window, { key: "Escape" });

    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  /* ---------- 5. Legend content ---------- */
  test("renders all expected legend entries", () => {
    render(
      <LegendSection isFullscreen={false} toggleFullscreen={toggleFullscreen} />
    );
    const labels = [
      "Mandatory Feature",
      "Optional Feature",
      "Tree Link",
      "Requires Constraint",
      "Excludes Constraint",
      "Constraint Endpoint (requires)",
      "Constraint Endpoint (excludes)",
      "Highlighted Feature",
      "Related Branch",
    ];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
