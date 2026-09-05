import { describe, expect, it } from "vitest";

import {
  assertInventoryTransition,
  canTransition,
  isPurchasable,
} from "@/lib/inventory";

describe("inventory transitions", () => {
  it("allows an available card to be reserved and then sold", () => {
    expect(canTransition("AVAILABLE", "RESERVED")).toBe(true);
    expect(canTransition("RESERVED", "SOLD")).toBe(true);
    expect(() => assertInventoryTransition("AVAILABLE", "RESERVED")).not.toThrow();
    expect(() => assertInventoryTransition("RESERVED", "SOLD")).not.toThrow();
  });

  it("does not reserve inventory for an inquiry", () => {
    expect(isPurchasable("AVAILABLE")).toBe(true);
    expect(isPurchasable("RESERVED")).toBe(false);
  });

  it("rejects invalid transitions", () => {
    expect(() => assertInventoryTransition("AVAILABLE", "SOLD")).toThrow(
      "Cannot transition inventory from AVAILABLE to SOLD.",
    );
    expect(() => assertInventoryTransition("SOLD", "AVAILABLE")).toThrow();
  });

  it("only permits archiving from archived-eligible states", () => {
    expect(canTransition("AVAILABLE", "ARCHIVED")).toBe(true);
    expect(canTransition("RESERVED", "ARCHIVED")).toBe(true);
    expect(canTransition("SOLD", "ARCHIVED")).toBe(true);
    expect(canTransition("ARCHIVED", "AVAILABLE")).toBe(false);
    expect(canTransition("ARCHIVED", "ARCHIVED")).toBe(true);
  });
});
