import "server-only";
import fs from "node:fs";
import path from "node:path";
import { hydrateMemory } from "./memory";
import { buildSeed } from "./seed";
import type { DB } from "./types";

const FILE = path.join(process.cwd(), ".data", "db.json");

const g = globalThis as unknown as { __octopusDb?: DB };

function load(): DB {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
  } catch {
    const seed = buildSeed();
    persist(seed);
    return seed;
  }
}

function persist(db: DB) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
  } catch {
    // Read-only filesystems (e.g. serverless) keep data in memory only.
  }
}

export function getDb(): DB {
  if (!g.__octopusDb) g.__octopusDb = load();
  if (hydrateMemory(g.__octopusDb)) persist(g.__octopusDb);
  return g.__octopusDb;
}

export function saveDb() {
  if (g.__octopusDb) persist(g.__octopusDb);
}

export function resetDb(): DB {
  const db = buildSeed();
  hydrateMemory(db);
  g.__octopusDb = db;
  persist(db);
  return db;
}
