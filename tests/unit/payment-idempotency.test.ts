import { describe, expect, it } from "vitest";

import { processPaymentEventIdempotent } from "@/lib/data/repository";
import type { PaymentEvent } from "@/types/database";

function paymentEvent(): PaymentEvent {
  return {
    id: "00000000-0000-4000-8000-000000009999",
    provider: "stripe",
    providerEventId: "evt_test_123",
    idempotencyKey: "stripe:evt_test_123",
    status: "RECEIVED",
    payload: { type: "payment_intent.succeeded" },
    processedAt: null,
    createdAt: "2026-01-28T12:00:00.000Z",
  };
}

describe("processPaymentEventIdempotent", () => {
  it("processes an event once and returns processed false for a duplicate", async () => {
    const first = await processPaymentEventIdempotent(paymentEvent());
    const duplicate = await processPaymentEventIdempotent(paymentEvent());

    expect(first.processed).toBe(true);
    expect(duplicate.processed).toBe(false);
    expect(duplicate.event.id).toBe(first.event.id);
  });
});
