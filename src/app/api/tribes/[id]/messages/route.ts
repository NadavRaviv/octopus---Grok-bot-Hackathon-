import { nanoid } from "nanoid";
import { bad } from "@/lib/api";
import { getDb, saveDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const tribe = db.tribes.find((t) => t.id === id);
  if (!tribe) return bad("Tribe not found.", 404);
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 1000) : "";
  const authorId = typeof body?.authorId === "string" ? body.authorId : "";
  if (!text) return bad("Message is empty.");
  if (!tribe.memberIds.includes(authorId)) return bad("Only tribe members can post here.", 403);

  const messages = [{ id: nanoid(8), authorId, text, createdAt: Date.now() }];
  tribe.messages.push(...messages);
  saveDb();
  return Response.json({ messages });
}
