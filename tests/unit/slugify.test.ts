import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("normalizes whitespace, punctuation, accents, and case", () => {
    expect(slugify("  Évoli’s 1st Edition!  ")).toBe("evolis-1st-edition");
  });

  it("does not leave leading or trailing separators", () => {
    expect(slugify("---Pikachu---")).toBe("pikachu");
    expect(slugify("   ")).toBe("");
  });
});
