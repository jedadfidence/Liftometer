// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/status-badge";

describe("StatusBadge", () => {
  it("renders ENABLED status", () => {
    render(<StatusBadge status="ENABLED" />);
    expect(screen.getByText("Enabled")).toBeDefined();
  });

  it("renders PAUSED status", () => {
    render(<StatusBadge status="PAUSED" />);
    expect(screen.getByText("Paused")).toBeDefined();
  });

  it("renders DRAFT status", () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText("Draft")).toBeDefined();
  });

  it("renders REMOVED status", () => {
    render(<StatusBadge status="REMOVED" />);
    expect(screen.getByText("Removed")).toBeDefined();
  });

  it("renders unknown status as-is", () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN")).toBeDefined();
  });
});
