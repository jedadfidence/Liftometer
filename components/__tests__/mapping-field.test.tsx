// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MappingField } from "@/components/mapping-field";

describe("MappingField", () => {
  it("renders label and source value", () => {
    render(
      <MappingField
        label="Campaign Name"
        sourceValue="Summer Sale"
        mappedValue="Summer Sale"
        onMappedValueChange={() => {}}
        status="mapped"
      />
    );
    expect(screen.getByText("Campaign Name")).toBeDefined();
    expect(screen.getByText("Summer Sale")).toBeDefined();
  });

  it("shows Mapped badge when status is mapped", () => {
    render(
      <MappingField
        label="Name"
        sourceValue="Test"
        mappedValue="Test"
        onMappedValueChange={() => {}}
        status="mapped"
      />
    );
    expect(screen.getByText("Mapped")).toBeDefined();
  });

  it("shows Action needed badge when status is action-needed", () => {
    render(
      <MappingField
        label="Topic Clusters"
        sourceValue="N/A"
        mappedValue=""
        onMappedValueChange={() => {}}
        status="action-needed"
      />
    );
    expect(screen.getByText("Action needed")).toBeDefined();
  });

  it("calls onMappedValueChange when input changes", () => {
    const onChange = vi.fn();
    render(
      <MappingField
        label="Name"
        sourceValue="Test"
        mappedValue="Test"
        onMappedValueChange={onChange}
        status="mapped"
      />
    );
    const input = screen.getByDisplayValue("Test");
    fireEvent.change(input, { target: { value: "New Value" } });
    expect(onChange).toHaveBeenCalledWith("New Value");
  });
});
