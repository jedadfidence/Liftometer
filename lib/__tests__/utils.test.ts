// @vitest-environment node
import { describe, it, expect } from "vitest";
import { microsToUsd, usdToMicros, truncate, formatBudget } from "@/lib/utils";

describe("microsToUsd", () => {
  it("converts micros to USD", () => {
    expect(microsToUsd(5000000)).toBe(5);
    expect(microsToUsd(1500000)).toBe(1.5);
    expect(microsToUsd(0)).toBe(0);
  });
  it("handles undefined", () => {
    expect(microsToUsd(undefined)).toBe(0);
  });
});

describe("usdToMicros", () => {
  it("converts USD to micros", () => {
    expect(usdToMicros(5)).toBe(5000000);
    expect(usdToMicros(1.5)).toBe(1500000);
  });
});

describe("truncate", () => {
  it("truncates string to max length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello");
    expect(truncate("Short", 10)).toBe("Short");
    expect(truncate("", 5)).toBe("");
  });
});

describe("formatBudget", () => {
  it("formats number as USD currency", () => {
    expect(formatBudget(1234.56)).toBe("$1,234.56");
    expect(formatBudget(0)).toBe("$0.00");
  });
});
