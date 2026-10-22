import { nanoid } from "nanoid";
import { bad, snapshot } from "@/lib/api";
import { getDb, saveDb } from "@/lib/db";
import { createMemory } from "@/lib/memory";
import type { Member } from "@/lib/types";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter((p) => p && !/^\d+$/.test(p))
    .map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join(" ") || email;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const text: unknown = body?.text;
  if (typeof text !== "string" || !text.trim()) return bad("Paste or upload at least one email.");

  const db = getDb();
  const existing = new Set(db.members.map((m) => m.email.toLowerCase()));
  const added: Member[] = [];
  let duplicates = 0;
  let skipped = 0;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(EMAIL);
    if (!match) {
      skipped++;
      continue;
    }
    const email = match[0].toLowerCase();
    if (existing.has(email)) {
      duplicates++;
      continue;
    }
    existing.add(email);
    const nameCell = line
      .split(/[,;\t]/)
      .map((c) => c.trim().replace(/^"|"$/g, ""))
      .find((c) => c && !EMAIL.test(c) && !/^(name|email|e-mail)$/i.test(c) && /[a-z]/i.test(c));
    const member: Member = {
      id: nanoid(10),
      name: nameCell ?? nameFromEmail(email),
      email,
      status: "invited",
      skills: [],
      tribeIds: [],
      area: "London",
      createdAt: Date.now(),
    };
    member.memory = createMemory(member, db.tribes);
    added.push(member);
  }

  if (!added.length && !duplicates) return bad("We couldn't find any email addresses in that file.");

  db.members.push(...added);
  saveDb();
  return Response.json({ added: added.length, duplicates, skipped, state: snapshot(db) });
}
