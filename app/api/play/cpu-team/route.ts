import { NextResponse } from "next/server";
import { attachRosterFrontImages } from "@/services/game/roster-images";
import { defaultCpuTeam } from "@/services/game/roster";

export async function GET(request: Request) {
  const exclude = new URL(request.url).searchParams
    .get("exclude")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const entries = attachRosterFrontImages(defaultCpuTeam(exclude ?? []));

  if (entries.length !== 3) {
    return NextResponse.json(
      { error: "Could not build CPU team" },
      { status: 500 }
    );
  }

  return NextResponse.json({ entries });
}
