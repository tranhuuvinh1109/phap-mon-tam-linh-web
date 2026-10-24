"use client";

import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useCallback, useEffect, useRef } from "react";

interface RenderPageOptions {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  scale?: number;
  maxDpr?: number;
}

interface ActiveRender {
  cancel: () => void;
  promise: Promise<void>;
}

export function usePdfPageRenderer(pdfDoc: PDFDocumentProxy | null) {
  // Store active render tasks keyed by canvas and pageNumber
  const canvasTasksRef = useRef<Map<HTMLCanvasElement, ActiveRender>>(new Map());
  const pageTasksRef = useRef<Map<number, ActiveRender>>(new Map());

  // Cancel rendering for a specific canvas
  const cancelCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const existing = canvasTasksRef.current.get(canvas);
    if (existing) {
      existing.cancel();
      canvasTasksRef.current.delete(canvas);
    }
  }, []);

  // Cancel rendering for a specific page number
  const cancelPage = useCallback((pageNumber: number) => {
    const existing = pageTasksRef.current.get(pageNumber);
    if (existing) {
      existing.cancel();
      pageTasksRef.current.delete(pageNumber);
    }
  }, []);

  // Render a specific page onto an HTMLCanvasElement
  const renderPage = useCallback(
    async ({
      pageNumber,
      canvas,
      scale = 1.5,
      maxDpr = 2,
    }: RenderPageOptions): Promise<boolean> => {
      if (!pdfDoc || !canvas) return false;

      // 1. Cancel and await any active render currently using this canvas
      const existingCanvasTask = canvasTasksRef.current.get(canvas);
      if (existingCanvasTask) {
        existingCanvasTask.cancel();
        try {
          await existingCanvasTask.promise;
        } catch {
          // ignore cancellation
        }
      }

      // Also cancel any existing task for this pageNumber on a different canvas
      const existingPageTask = pageTasksRef.current.get(pageNumber);
      if (existingPageTask && existingPageTask !== existingCanvasTask) {
        existingPageTask.cancel();
        try {
          await existingPageTask.promise;
        } catch {
          // ignore
        }
      }

      let isCancelled = false;
      let internalRenderTask: RenderTask | null = null;
      let resolvePromise!: () => void;
      const taskPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      const activeRecord: ActiveRender = {
        cancel: () => {
          isCancelled = true;
          if (internalRenderTask) {
            try {
              internalRenderTask.cancel();
            } catch {
              // ignore
            }
          }
        },
        promise: taskPromise,
      };

      canvasTasksRef.current.set(canvas, activeRecord);
      pageTasksRef.current.set(pageNumber, activeRecord);

      try {
        if (isCancelled) {
          return false;
        }

        const page = await pdfDoc.getPage(pageNumber);

        if (isCancelled) {
          return false;
        }

        // Account for device pixel ratio for crisp text
        const dpr = Math.min(
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
          maxDpr
        );

        const viewport = page.getViewport({ scale: scale * dpr });
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx || isCancelled) return false;

        // Set actual canvas drawing buffer size (high resolution)
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Fill background with white to avoid black flicker
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        internalRenderTask = page.render(renderContext);

        await internalRenderTask.promise;
        return true;
      } catch (err: any) {
        if (
          err?.name === "RenderingCancelledException" ||
          err?.message?.includes("cancelled")
        ) {
          // Normal cancellation, not an error
          return false;
        }
        console.warn(`Render error on page ${pageNumber}:`, err);
        return false;
      } finally {
        resolvePromise();
        if (canvasTasksRef.current.get(canvas) === activeRecord) {
          canvasTasksRef.current.delete(canvas);
        }
        if (pageTasksRef.current.get(pageNumber) === activeRecord) {
          pageTasksRef.current.delete(pageNumber);
        }
      }
    },
    [pdfDoc]
  );

  // Cancel all active rendering tasks on unmount or when document changes
  useEffect(() => {
    return () => {
      canvasTasksRef.current.forEach((task) => {
        try {
          task.cancel();
        } catch {
          // ignore
        }
      });
      canvasTasksRef.current.clear();
      pageTasksRef.current.clear();
    };
  }, [pdfDoc]);

  return {
    renderPage,
    cancelCanvas,
    cancelPage,
  };
}
