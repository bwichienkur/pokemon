import "server-only";

import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { createInitialStore } from "@/lib/data/seed-data";
import type { LocalStore } from "@/types/database";

const storePath = path.join(process.cwd(), ".data", "store.json");
const isVercel = process.env.VERCEL === "1";

let memoryStore: LocalStore | null = null;
let writeChain: Promise<void> = Promise.resolve();

function cloneStore(store: LocalStore): LocalStore {
  return JSON.parse(JSON.stringify(store)) as LocalStore;
}

async function canUseFilesystem(): Promise<boolean> {
  if (!isVercel) return true;
  try {
    await mkdir(path.dirname(storePath), { recursive: true });
    const probe = path.join(path.dirname(storePath), `.write-probe-${process.pid}`);
    await writeFile(probe, "ok", "utf8");
    await unlink(probe).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}

async function ensureStore(): Promise<LocalStore> {
  if (memoryStore) return memoryStore;

  const filesystemAvailable = await canUseFilesystem();
  if (!filesystemAvailable) {
    memoryStore = createInitialStore();
    return memoryStore;
  }

  try {
    const raw = await readFile(storePath, "utf8");
    memoryStore = JSON.parse(raw) as LocalStore;
    return memoryStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    memoryStore = createInitialStore();
    await persist(memoryStore).catch(() => {
      // Read-only hosts keep serving the in-memory seed store.
    });
    return memoryStore;
  }
}

async function persist(store: LocalStore): Promise<void> {
  memoryStore = store;
  if (!(await canUseFilesystem())) return;
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
  return cloneStore(await ensureStore());
}

export function writeStore(store: LocalStore): Promise<void> {
  return enqueue(() => persist(cloneStore(store)));
}

/** Serializes read-modify-write operations within this Node.js process. */
export function updateStore<T>(
  mutator: (store: LocalStore) => T | Promise<T>,
): Promise<T> {
  return enqueue(async () => {
    const store = cloneStore(await ensureStore());
    const result = await mutator(store);
    await persist(store);
    return result;
  });
}
