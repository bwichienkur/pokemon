import { describe, expect, it } from "vitest";

import {
  bgsVerificationUrl,
  cgcVerificationUrl,
  psaVerificationUrl,
  tagVerificationUrl,
  verificationUrl,
} from "@/lib/graders";

describe("grader verification URL builders", () => {
  it("builds a lookup URL for every supported grader", () => {
    expect(psaVerificationUrl("123 456")).toBe("https://www.psacard.com/cert/123%20456");
    expect(bgsVerificationUrl("123 456")).toBe(
      "https://www.beckett.com/grading/card-lookup?item_id=123+456&item_type=BGS",
    );
    expect(cgcVerificationUrl("123 456")).toBe(
      "https://www.cgccards.com/certlookup/123%20456/",
    );
    expect(tagVerificationUrl("123 456")).toBe("https://my.taggrading.com/card/123%20456");
  });

  it("dispatches to the correct grader URL builder", () => {
    expect(verificationUrl("PSA", "123")).toBe(psaVerificationUrl("123"));
    expect(verificationUrl("BGS", "123")).toBe(bgsVerificationUrl("123"));
  });
});
