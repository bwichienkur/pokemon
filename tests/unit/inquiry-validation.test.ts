import { describe, expect, it } from "vitest";

import { inquiryFormSchema } from "@/lib/validations/inquiry";

const validInquiry = {
  cardId: "00000000-0000-4000-8000-000000000100",
  name: "Jordan Ruiz",
  email: "jordan@example.test",
  phone: "",
  offerAmount: "425.00",
  preferredContactMethod: "EMAIL",
  country: "United States",
  postalCode: "10001",
  message: "I would like to discuss insured shipping and make a serious offer.",
  privacyAgreement: true,
};

describe("inquiryFormSchema", () => {
  it("requires agreement to the privacy policy", () => {
    expect(
      inquiryFormSchema.safeParse({ ...validInquiry, privacyAgreement: false }).success,
    ).toBe(false);
  });

  it("requires a phone number when phone is the preferred contact method", () => {
    expect(
      inquiryFormSchema.safeParse({
        ...validInquiry,
        preferredContactMethod: "PHONE",
        phone: "",
      }).success,
    ).toBe(false);
    expect(
      inquiryFormSchema.safeParse({
        ...validInquiry,
        preferredContactMethod: "PHONE",
        phone: "+1 (555) 010-0100",
      }).success,
    ).toBe(true);
  });
});
