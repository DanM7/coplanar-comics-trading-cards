import { NextResponse } from "next/server";
import { isDevToolsEnabled } from "@/lib/dev-only";
import { listCardExportJobs } from "@/lib/resolve-card-print-editor";

export async function GET(request: Request) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const status = new URL(request.url).searchParams.get("status")?.trim();
  const printIds = new URL(request.url).searchParams
    .get("printIds")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const jobs = await listCardExportJobs({
    ...(status ? { status } : {}),
    ...(printIds?.length ? { printIds } : {}),
  });

  return NextResponse.json({
    count: jobs.length,
    jobs: jobs.map((job) => ({
      printId: job.printId,
      characterName: job.characterName,
      frontFilename: job.frontFilename,
      backFilename: job.backFilename,
      frontUrl: job.frontUrl,
      backUrl: job.backUrl,
      design: job.design,
      meta: job.meta,
    })),
  });
}
