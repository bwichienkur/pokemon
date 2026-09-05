import { beforeEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

beforeEach(async () => {
  const { createInitialStore } = await import("@/lib/data/seed-data");
  const { writeStore } = await import("@/lib/data/local-store");

  await writeStore(createInitialStore());
});
