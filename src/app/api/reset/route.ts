import { snapshot } from "@/lib/api";
import { resetDb } from "@/lib/db";

export async function POST() {
  return Response.json(snapshot(resetDb()));
}
