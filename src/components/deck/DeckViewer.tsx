"use client";

import { useEffect, useRef, useState } from "react";

import { LanguageProvider, useT } from "@/lib/i18n/LanguageProvider";

import "./deck.css";

/** Widest CSS width a rendered page takes; canvases scale down responsively. */
const MAX_PAGE_WIDTH = 960;

type ViewerStatus = "loading" | "ready" | "error";

/**
 * Private deck viewer (F-016): fetches the PDF bytes from the token-gated
 * /api/deck-file and renders every page onto a canvas via pdfjs-dist — no
 * native PDF toolbar, no download button, nothing to right-click-save beyond
 * page images. pdfjs is imported inside the effect so it stays a client-only,
 * code-split chunk.
 */
function DeckCanvases({ token }: { token: string }) {
  const t = useT();
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const pagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = pagesRef.current;
      if (!container) return;
      const res = await fetch(`/api/deck-file?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error(`deck-file fetch failed: ${res.status}`);
      const data = await res.arrayBuffer();
      if (cancelled) return;

      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const doc = await pdfjs.getDocument({ data }).promise;
      if (cancelled) return;

      container.replaceChildren();
      const cssWidth = Math.min(container.clientWidth || MAX_PAGE_WIDTH, MAX_PAGE_WIDTH);
      const dpr = window.devicePixelRatio || 1;

      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });

        const canvas = document.createElement("canvas");
        canvas.className = "mb-deck-canvas";
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.setAttribute("aria-label", `${pageNumber} / ${doc.numPages}`);
        container.append(canvas);

        await page.render({ canvas, viewport }).promise;
        if (cancelled) return;
      }
      setStatus("ready");
    }

    render().catch((error) => {
      if (cancelled) return;
      console.error("deck: failed to render", error);
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mb-deck">
      {status !== "ready" && (
        <p className="mb-deck-msg" role="status">
          {status === "loading" ? t("deck_loading") : t("deck_error")}
        </p>
      )}
      <div ref={pagesRef} className="mb-deck-pages" />
    </div>
  );
}

export default function DeckViewer({ token }: { token: string }) {
  return (
    <LanguageProvider>
      <DeckCanvases token={token} />
    </LanguageProvider>
  );
}
