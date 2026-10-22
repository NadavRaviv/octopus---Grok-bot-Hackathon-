import { connection } from "next/server";
import { snapshot } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  await connection();
  return Response.json(snapshot(getDb()));
}
