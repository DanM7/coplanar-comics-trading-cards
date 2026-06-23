import { notFound } from "next/navigation";
import { isDevToolsEnabled } from "@/lib/dev-only";
import { EditorPageContent } from "./EditorPageContent";

export const dynamic = "force-dynamic";

export default function EditorPage() {
  if (!isDevToolsEnabled()) {
    notFound();
  }

  return <EditorPageContent />;
}
