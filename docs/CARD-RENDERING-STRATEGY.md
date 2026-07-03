# Card rendering strategy

Design note for how trading cards are displayed in the app vs. the editor, and when to change approach.

## Current architecture (2026)

| Path | Where | What it renders |
|------|--------|-----------------|
| **Baked PNG** | Pack reveal, binder, collection (when art exists) | 300×420 export from the editor (`html-to-image` → `/assets/cards/{printId}-{front\|back}.png`) |
| **Simple CSS card** | PNG fallback (`CardFront` / `CardBack`) | Generic Series 1 frame — **not** per-print editor design |
| **Editor compose** | `/editor` only | Full design from `card_editor_designs.json` via `EditableCardFace` |

PNGs exist so **player view matches editor export**. The fallback path does not use per-print design data.

Export pipeline:

- Canvas size: **300×420** (5:7) — see `CARD_EDITOR_WIDTH` / `CARD_EDITOR_HEIGHT` in `lib/export-card-png.ts`
- Batch export: `npm run cards:export-done` → `assets/cards/` → `npm run cards:sync` → `public/assets/cards/` on build
- Runtime: `FinishedCardImage` prefers PNG URL; falls back to `CardFront` / `CardBack`

## Option A: Keep PNGs (current direction)

**Pros**

- Fast to paint (single `<img>` per face)
- Predictable, pixel-stable look (exact export)
- Works well on CDN / static hosting; no raw art paths needed at runtime
- Thumbnails and hero can share the same asset

**Cons**

- Large deploy (~280MB card PNGs; mitigated by `cards:sync` + static serving, not server bundle)
- Design change → re-export → commit/sync → redeploy
- Responsive layout must preserve **5:7** (container sizing, `object-fit: contain`) or images look cropped or stretched
- Editor and game can drift if exports are stale

**Best when:** exported art is the canonical “print file” and design churn is low.

## Option B: Dynamic render (editor-style compose at runtime)

**Pros**

- Scales cleanly at any viewport size (real CSS layout, not raster scaling)
- Single source of truth: JSON design changes appear in-game without re-export
- Could remove or shrink PNG deploy
- Hero, binder, and editor can share one visual system

**Cons**

- Large refactor: extract a shared read-only component from `EditableCardFace` (front + back, ghost, OG frame, fonts, `mergeCardPrintDesign()`)
- Heavier runtime (DOM, fonts, hooks like `useOgBackdropColor`, multiple images per card)
- Production needs raw front/back asset URLs (today play/binder rely heavily on finished PNGs)
- Pack UI with hero + strip = many live composited cards unless thumbs stay as images
- Parity risk moves from “forgot to export” to “editor and game components diverged”

**Best when:** frequent design iteration, or PNG deploy/sync cost is too high.

## Option C: Hybrid

| Surface | Render |
|---------|--------|
| Hero / binder modal | Dynamic (`DesignedCardFace`) |
| Strip / grid thumbnails | Small PNG (or static preview) |

**Pros:** Fixes full-size scaling where it matters; keeps strip light.  
**Cons:** Two paths to maintain; thumbs and hero must still look consistent.

## Recommendation

1. **Near term:** Fix **5:7 layout** for PNG display (container queries / linked width+height, `object-fit: contain`). Distortion is a sizing bug, not a fundamental PNG limitation. Use **flat flip** (no CSS 3D) for baked PNG pairs so back text stays sharp; avoid `filter: drop-shadow` on the card button (use `box-shadow` instead).
2. **Revisit dynamic rendering** if re-export + redeploy becomes a recurring bottleneck, or if we want JSON-only design updates in production.

If we go dynamic, do **not** duplicate editor logic in play — extract a shared **`DesignedCardFace`** (read-only in game, editable in editor) driven by `mergeCardPrintDesign()`.

## Related files

- `components/cards/FinishedCardImage.tsx` — PNG vs fallback
- `components/cards/CardFlip.tsx` — flip wrapper
- `components/editor/EditableCardFace.tsx` — full compose (editor)
- `lib/merge-character-design.ts` — design merge
- `lib/export-card-png.ts` — PNG export dimensions
- `components/pack/pack.module.css` — hero card fit (`container-type` on stage)
