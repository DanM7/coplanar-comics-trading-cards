import { NextResponse } from "next/server";
import { cardPrintPngPublicUrl } from "@/lib/card-export-filenames";
import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { normalizeCharacterId } from "@/lib/character-id";
import { characterHasFinishedCardArt } from "@/lib/displayable-cards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const id = normalizeCharacterId(characterId);

  if (!characterHasFinishedCardArt(id)) {
    return NextResponse.json({ error: "Portrait not found" }, { status: 404 });
  }

  const print = getDefaultCardPrintForCharacter(id);
  if (!print) {
    return NextResponse.json({ error: "Portrait not found" }, { status: 404 });
  }

  const url = new URL(cardPrintPngPublicUrl(print.id, "front"), request.url);
  return NextResponse.redirect(url, 307);
}
