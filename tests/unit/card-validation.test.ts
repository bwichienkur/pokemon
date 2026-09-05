import { describe, expect, it } from "vitest";

import { cardCreateSchema } from "@/lib/validations/card";

const validCard = {
  title: "1999 Pikachu Base Set",
  pokemonName: "Pikachu",
  grader: "PSA",
  grade: 10,
  certificationNumber: "PSA-123456",
  priceMinor: 42500,
};

describe("cardCreateSchema", () => {
  it("accepts a valid card and applies defaults", () => {
    const result = cardCreateSchema.safeParse(validCard);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
      expect(result.data.availabilityStatus).toBe("AVAILABLE");
      expect(result.data.priceMinor).toBe(42500);
    }
  });

  it("rejects malformed certificate numbers and fractional prices", () => {
    expect(
      cardCreateSchema.safeParse({ ...validCard, certificationNumber: "bad certificate!" })
        .success,
    ).toBe(false);
    expect(cardCreateSchema.safeParse({ ...validCard, priceMinor: 425.5 }).success).toBe(false);
  });
});
