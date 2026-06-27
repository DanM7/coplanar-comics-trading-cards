"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  EditableCardFace,
  type EditorCardMeta,
} from "@/components/editor/EditableCardFace";
import {
  PNG_EXPORT_SCALE_DEFAULT,
  saveCardElementPng,
} from "@/lib/export-card-png";
import { waitForImageUrls } from "@/lib/preload-images";
import type { CardDesignConfig } from "@/types/card-design";
import styles from "./editor.module.css";

interface ExportJobPayload {
  printId: string;
  characterName: string;
  frontFilename: string;
  backFilename: string;
  frontUrl: string;
  backUrl: string;
  design: CardDesignConfig;
  meta: EditorCardMeta;
}

interface ExportResult {
  printId: string;
  characterName: string;
  frontFilename: string;
  backFilename: string;
  ok: boolean;
  error?: string;
}

export function BatchCardExport() {
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("autostart") === "1";

  const frontCanvasRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<ExportJobPayload[]>([]);
  const jobIndexRef = useRef(0);
  const resultsRef = useRef<ExportResult[]>([]);
  const exportingRef = useRef(false);

  const [jobs, setJobs] = useState<ExportJobPayload[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [activeJob, setActiveJob] = useState<ExportJobPayload | null>(null);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    let cancelled = false;
    async function loadJobs() {
      setLoadingJobs(true);
      setLoadError(null);
      try {
        const query = searchParams.toString() || "status=done";
        const response = await fetch(`/api/dev/batch-export?${query}`);
        if (!response.ok) {
          throw new Error("Failed to load export jobs");
        }
        const payload = (await response.json()) as {
          jobs: ExportJobPayload[];
        };
        if (!cancelled) {
          setJobs(payload.jobs);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load jobs"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingJobs(false);
        }
      }
    }

    void loadJobs();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const finishBatch = useCallback((nextResults: ExportResult[]) => {
    const total = jobsRef.current.length;
    const saved = nextResults.filter((entry) => entry.ok).length;
    setRunning(false);
    setActiveJob(null);
    setFinished(true);
    setStatusMessage(`Batch complete — ${saved}/${total} saved.`);
  }, []);

  const advanceQueue = useCallback(
    (nextResults: ExportResult[]) => {
      const nextIndex = jobIndexRef.current + 1;
      jobIndexRef.current = nextIndex;

      if (nextIndex >= jobsRef.current.length) {
        finishBatch(nextResults);
        return;
      }

      setActiveJob(jobsRef.current[nextIndex] ?? null);
    },
    [finishBatch]
  );

  useEffect(() => {
    if (!running || !activeJob || exportingRef.current) {
      return;
    }

    let cancelled = false;
    exportingRef.current = true;

    async function exportActiveJob() {
      setStatusMessage(`Rendering ${activeJob!.printId} — ${activeJob!.characterName}…`);

      await waitForImageUrls([activeJob!.frontUrl, activeJob!.backUrl]);
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Wait for React to mount canvases and paint the decoded images.
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      if (cancelled) {
        return;
      }

      const frontElement = frontCanvasRef.current;
      const backElement = backCanvasRef.current;
      if (!frontElement || !backElement) {
        throw new Error("Card preview elements are not ready.");
      }

      await saveCardElementPng(
        frontElement,
        activeJob!.frontFilename,
        PNG_EXPORT_SCALE_DEFAULT
      );
      await saveCardElementPng(
        backElement,
        activeJob!.backFilename,
        PNG_EXPORT_SCALE_DEFAULT
      );
    }

    void (async () => {
      try {
        await exportActiveJob();
        if (cancelled) {
          return;
        }

        const entry: ExportResult = {
          printId: activeJob.printId,
          characterName: activeJob.characterName,
          frontFilename: activeJob.frontFilename,
          backFilename: activeJob.backFilename,
          ok: true,
        };
        const nextResults = [...resultsRef.current, entry];
        resultsRef.current = nextResults;
        setResults(nextResults);
        setStatusMessage(
          `Saved ${activeJob.frontFilename} and ${activeJob.backFilename}`
        );
        advanceQueue(nextResults);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Export failed";
        const entry: ExportResult = {
          printId: activeJob.printId,
          characterName: activeJob.characterName,
          frontFilename: activeJob.frontFilename,
          backFilename: activeJob.backFilename,
          ok: false,
          error: message,
        };
        const nextResults = [...resultsRef.current, entry];
        resultsRef.current = nextResults;
        setResults(nextResults);
        setStatusMessage(`Failed ${activeJob.printId}: ${message}`);
        advanceQueue(nextResults);
      } finally {
        exportingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      exportingRef.current = false;
    };
  }, [activeJob, advanceQueue, running]);

  const runBatch = useCallback(() => {
    if (jobs.length === 0 || running) {
      return;
    }

    jobIndexRef.current = 0;
    setResults([]);
    setFinished(false);
    setRunning(true);
    setActiveJob(jobs[0] ?? null);
  }, [jobs, running]);

  useEffect(() => {
    if (autoStart && !loadingJobs && jobs.length > 0 && !running && !finished) {
      runBatch();
    }
  }, [autoStart, finished, jobs.length, loadingJobs, runBatch, running]);

  if (loadingJobs) {
    return <p className={styles.editorIntro}>Loading done card prints…</p>;
  }

  if (loadError) {
    return <p className={styles.editorIntro}>{loadError}</p>;
  }

  const succeeded = results.filter((entry) => entry.ok).length;
  const failed = results.filter((entry) => !entry.ok);

  return (
    <div>
      <p className={styles.editorIntro}>
        Re-export front and back PNGs for all card prints with status{" "}
        <strong>done</strong> ({jobs.length} prints).
      </p>

      <div className={styles.field} style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={styles.previewExportBtn}
          disabled={running || jobs.length === 0}
          onClick={runBatch}
        >
          {running
            ? `Exporting ${Math.min(jobIndexRef.current + 1, jobs.length)} / ${jobs.length}…`
            : "Export All Done Cards"}
        </button>
      </div>

      {statusMessage ? (
        <p className={styles.editorIntro} data-batch-status="true">
          {statusMessage}
        </p>
      ) : null}

      {finished ? (
        <p className={styles.editorIntro} data-batch-complete="true">
          {`Done: ${succeeded}/${jobs.length} saved${
            failed.length > 0 ? ` (${failed.length} failed)` : ""
          }.`}
        </p>
      ) : null}

      {failed.length > 0 ? (
        <ul className={styles.editorIntro}>
          {failed.map((entry) => (
            <li key={entry.printId}>
              #{entry.printId} {entry.characterName}: {entry.error}
            </li>
          ))}
        </ul>
      ) : null}

      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        {activeJob ? (
          <>
            <EditableCardFace
              key={`${activeJob.printId}-front`}
              side="front"
              portraitUrl={activeJob.frontUrl}
              meta={activeJob.meta}
              design={activeJob.design}
              canvasRef={frontCanvasRef}
            />
            <EditableCardFace
              key={`${activeJob.printId}-back`}
              side="back"
              portraitUrl={activeJob.frontUrl}
              backPortraitUrl={activeJob.backUrl}
              meta={activeJob.meta}
              design={activeJob.design}
              canvasRef={backCanvasRef}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
