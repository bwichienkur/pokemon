import type { AvailabilityStatus } from "@/types/database";

const ALLOWED_TRANSITIONS: Readonly<Record<AvailabilityStatus, readonly AvailabilityStatus[]>> = {
  AVAILABLE: ["RESERVED", "ARCHIVED"],
  RESERVED: ["AVAILABLE", "SOLD", "ARCHIVED"],
  SOLD: ["ARCHIVED"],
  ARCHIVED: [],
};

/**
 * Checks explicit inventory state changes. Submitting or updating an inquiry
 * never calls this policy and therefore cannot reserve inventory by itself.
 */
export function canTransition(
  from: AvailabilityStatus,
  to: AvailabilityStatus,
): boolean {
  return from === to || ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertInventoryTransition(
  from: AvailabilityStatus,
  to: AvailabilityStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Cannot transition inventory from ${from} to ${to}.`);
  }
}

export function isPurchasable(status: AvailabilityStatus): boolean {
  return status === "AVAILABLE";
}
