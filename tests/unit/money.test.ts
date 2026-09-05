import { describe, expect, it } from "vitest";

import {
  assertIntegerMinor,
  formatMoney,
  fromMinorUnits,
  toMinorUnits,
} from "@/lib/money";

describe("money utilities", () => {
  it("converts decimal values to integer minor units without rounding", () => {
    expect(toMinorUnits("42.50")).toBe(4250);
    expect(toMinorUnits("7", "JPY")).toBe(7);
    expect(toMinorUnits("-1.234", "KWD")).toBe(-1234);
  });

  it("converts integer minor units to decimal strings", () => {
    expect(fromMinorUnits(4250)).toBe("42.50");
    expect(fromMinorUnits(-7, "JPY")).toBe("-7");
    expect(fromMinorUnits(12, "KWD")).toBe("0.012");
  });

  it("formats integer minor units for display", () => {
    expect(formatMoney(4250)).toBe("$42.50");
    expect(formatMoney(123456, "EUR", "de-DE")).toBe("1.234,56 €");
    expect(formatMoney(4250, "JPY")).toBe("¥4,250");
  });

  it("rejects fractional minor units and decimal input beyond the currency precision", () => {
    expect(() => assertIntegerMinor(12.5)).toThrow(TypeError);
    expect(() => fromMinorUnits(12.5)).toThrow(TypeError);
    expect(() => formatMoney(12.5)).toThrow(TypeError);
    expect(() => toMinorUnits("12.345")).toThrow(RangeError);
    expect(() => toMinorUnits(Number.NaN)).toThrow(TypeError);
  });
});
