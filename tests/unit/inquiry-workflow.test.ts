import { describe, expect, it } from "vitest";

import { createInquiry, getCardById } from "@/lib/data/repository";
import { RateLimitError } from "@/lib/auth/errors";

const cardId = "00000000-0000-4000-8000-000000000100";

const inquiry = {
  cardId,
  userId: null,
  name: "Taylor Morgan",
  email: "taylor@example.test",
  phone: null,
  offerAmountMinor: 42500,
  currency: "USD",
  preferredContactMethod: "EMAIL" as const,
  country: "United States",
  postalCode: "10001",
  message: "I would like to ask about insured domestic shipping for this card.",
};

describe("inquiry workflow", () => {
  it("creates a reference number without changing card availability", async () => {
    const before = await getCardById(cardId);
    const created = await createInquiry(inquiry);
    const after = await getCardById(cardId);

    expect(created.referenceNumber).toMatch(/^AG-\d{4}-\d{4}$/);
    expect(created.status).toBe("NEW");
    expect(after?.availabilityStatus).toBe(before?.availabilityStatus);
    expect(after?.availabilityStatus).toBe("AVAILABLE");
  });

  it("rate limits a rapid duplicate submission", async () => {
    await createInquiry(inquiry);

    await expect(createInquiry(inquiry)).rejects.toBeInstanceOf(RateLimitError);
  });
});
