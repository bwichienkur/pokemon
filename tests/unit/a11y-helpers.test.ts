// @vitest-environment jsdom

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/inquiries", () => ({ submitInquiry: vi.fn() }));

import { InquiryForm } from "@/components/inquiry/inquiry-form";

describe("accessibility smoke checks", () => {
  it("provides labels for inquiry fields", () => {
    render(createElement(InquiryForm, { cardId: "00000000-0000-4000-8000-000000000100" }));

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred contact method")).toBeInTheDocument();
    expect(screen.getByLabelText(/privacy policy/i)).toBeInTheDocument();
  });

  it("includes a skip link targeting the main content landmark", async () => {
    const layout = await readFile(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('id="main-content"');
  });
});
