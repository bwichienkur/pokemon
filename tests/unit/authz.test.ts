import { describe, expect, it } from "vitest";

import {
  createCard,
  setUserRole,
  updateInquiryStatus,
} from "@/lib/data/repository";
import { AuthError } from "@/lib/auth/errors";
import { cardCreateSchema } from "@/lib/validations/card";

const adminId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const inquiryId = "00000000-0000-4000-8000-000000002001";

const cardInput = cardCreateSchema.parse({
  title: "Unauthorized card",
  pokemonName: "Pikachu",
  grader: "PSA",
  grade: 9,
  certificationNumber: "PSA-999999",
  priceMinor: 10000,
});

describe("repository authorization", () => {
  it("prevents a USER from creating a card", async () => {
    await expect(createCard(cardInput, userId)).rejects.toBeInstanceOf(AuthError);
  });

  it("prevents a USER from changing an inquiry status", async () => {
    await expect(updateInquiryStatus(inquiryId, "REVIEWING", userId)).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it("prevents a USER from changing roles", async () => {
    await expect(setUserRole(adminId, "USER", userId)).rejects.toBeInstanceOf(AuthError);
  });
});
