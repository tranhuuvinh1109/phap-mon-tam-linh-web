"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

export interface PageDimensions {
  width: number;
  height: number;
  aspectRatio: number; // width / height
}

export interface UsePdfDocumentReturn {
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  isLoading: boolean;
  error: string | null;
  pageSize: PageDimensions | null;
}

export function usePdfDocument(url?: string | null): UsePdfDocumentReturn {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageDimensions | null>(null);

  // Store active loading task ref to cancel on unmount or URL switch
  const loadingTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!url) {
      setPdfDoc(null);
      setNumPages(0);
      setIsLoading(false);
      setError(null);
      setPageSize(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadDoc = async () => {
      try {
        // Dynamically import pdfjs-dist in client-side only
        const pdfjsLib = await import("pdfjs-dist");

        if (typeof window !== "undefined") {
          // Use local worker hosted in public folder
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        }

        // Cancel any pending task
        if (loadingTaskRef.current) {
          loadingTaskRef.current.destroy?.();
          loadingTaskRef.current = null;
        }

        const task = pdfjsLib.getDocument({
          url,
          withCredentials: false,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        });

        loadingTaskRef.current = task;
        const loadedPdf = await task.promise;

        if (!isMounted) {
          loadedPdf.destroy();
          return;
        }

        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);

        // Fetch page 1 dimensions to calculate canonical aspect ratio
        if (loadedPdf.numPages > 0) {
          try {
            const firstPage = await loadedPdf.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1.0 });
            if (isMounted) {
              setPageSize({
                width: viewport.width,
                height: viewport.height,
                aspectRatio: viewport.width / viewport.height,
              });
            }
          } catch (e) {
            console.warn("Could not get first page dimensions", e);
            // Default portrait A4 aspect ratio (595 x 842)
            if (isMounted) {
              setPageSize({
                width: 595,
                height: 842,
                aspectRatio: 595 / 842,
              });
            }
          }
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("PDF.js document loading error:", err);
        setError(
          err.message?.includes("CORS") || err.name === "SecurityError"
            ? "Không thể tải tài liệu do chính sách bảo mật (CORS). Vui lòng thử lại sau."
            : "Không thể mở tệp PDF. Tệp có thể bị hỏng hoặc đường dẫn không hợp lệ."
        );
        setIsLoading(false);
      }
    };

    loadDoc();

    return () => {
      isMounted = false;
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy?.();
        loadingTaskRef.current = null;
      }
    };
  }, [url]);

  return {
    pdfDoc,
    numPages,
    isLoading,
    error,
    pageSize,
  };
}
