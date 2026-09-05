import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { createInitialStore } from "@/lib/data/seed-data";
import type { LocalStore } from "@/types/database";

const storePath = path.join(process.cwd(), ".data", "store.json");
let writeChain: Promise<void> = Promise.resolve();

async function ensureStore(): Promise<void> {
  try {
    await readFile(storePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await persist(createInitialStore());
  }
}

async function persist(store: LocalStore): Promise<void> {
  await mkdir(path.dirname(storePath), { recursive: true });
  const temporaryPath = `${storePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(temporaryPath, storePath);
}

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeChain.then(operation, operation);
  writeChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function readStore(): Promise<LocalStore> {
  await writeChain;
  await ensureStore();
  return JSON.parse(await readFile(storePath, "utf8")) as LocalStore;
}

export function writeStore(store: LocalStore): Promise<void> {
  return enqueue(() => persist(store));
}

/** Serializes read-modify-write operations within this Node.js process. */
export function updateStore<T>(
  mutator: (store: LocalStore) => T | Promise<T>,
): Promise<T> {
  return enqueue(async () => {
    await ensureStore();
    const store = JSON.parse(await readFile(storePath, "utf8")) as LocalStore;
    const result = await mutator(store);
    await persist(store);
    return result;
  });
}
