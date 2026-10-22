import { nanoid } from "nanoid";
import { bad } from "@/lib/api";
import { getDb, saveDb } from "@/lib/db";
import { notifyGrokBot } from "@/lib/grok-bot";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const tribe = db.tribes.find((item) => item.id === id);
  if (!tribe) return bad("Tribe not found.", 404);

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 1000) : "";
  const authorId = typeof body?.authorId === "string" ? body.authorId : "";
  const seed = body?.seed === true;
  if (!text) return bad("Message is empty.");

  const member = authorId ? db.members.find((item) => item.id === authorId) : null;
  if (authorId && !tribe.memberIds.includes(authorId)) return bad("Only tribe members can ask Grok here.", 403);

  const now = Date.now();
  if (!seed && member) {
    tribe.messages.push({ id: nanoid(8), authorId: member.id, text, createdAt: now });
  }

  const grok = seed ? { sent: true, status: 200 } : await notifyGrokBot(db, member ?? null, "match", text);
  tribe.messages.push({
    id: nanoid(8),
    authorId: "grok",
    kind: "grok",
    text: seed
      ? text
      : grok?.sent
        ? "Sent to Grok Bot as a new match. It will write a new recommendation in Octopus Matchmaker."
        : "I couldn't reach Grok Bot. Ask again in a moment.",
    createdAt: now + 1,
  });
  saveDb();
  return Response.json({ messages: tribe.messages.slice(-2), grok });
}
