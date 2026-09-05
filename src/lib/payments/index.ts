import "server-only";

import { env } from "@/lib/env";
import { assertIntegerMinor } from "@/lib/money";

export interface CheckoutRequest {
  orderId: string;
  amountMinor: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export type CheckoutResult =
  | { ok: true; checkoutUrl: string; providerReference: string }
  | { ok: false; message: string };

export interface PaymentProvider {
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
}

export const PAYMENTS_DISABLED_MESSAGE = "Payments are not currently enabled";

export class DisabledPaymentProvider implements PaymentProvider {
  async createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
    void request;
    return { ok: false, message: PAYMENTS_DISABLED_MESSAGE };
  }
}

/**
 * Direct checkout is available only when the explicit feature flag and a
 * server-side Stripe credential are both configured.
 */
export function isDirectCheckoutEnabled(): boolean {
  return env.DIRECT_CHECKOUT_ENABLED && Boolean(env.STRIPE_SECRET_KEY);
}

export function getPaymentProvider(): PaymentProvider {
  return new DisabledPaymentProvider();
}

/** Guard checkout inputs before passing them to a configured provider. */
export function validateCheckoutRequest(request: CheckoutRequest): void {
  assertIntegerMinor(request.amountMinor);
  if (request.amountMinor < 0) {
    throw new RangeError("Checkout amount must not be negative.");
  }
  if (!/^[A-Za-z]{3}$/.test(request.currency)) {
    throw new TypeError("Checkout currency must be a three-letter ISO code.");
  }
  new URL(request.successUrl);
  new URL(request.cancelUrl);
}
