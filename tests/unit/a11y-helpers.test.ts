import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("accessibility smoke checks", () => {
  it("keeps accessible labels on inquiry form controls", async () => {
    const inquiryForm = await readFile(
      path.join(process.cwd(), "src/components/inquiry/inquiry-form.tsx"),
      "utf8",
    );

    expect(inquiryForm).toContain('Field label="Name"');
    expect(inquiryForm).toContain('Field label="Email"');
    expect(inquiryForm).toContain('Field label="Preferred contact method"');
    expect(inquiryForm).toContain('htmlFor={id}');
  });

  it("includes a skip link targeting the main content landmark", async () => {
    const layout = await readFile(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('id="main-content"');
  });
});
