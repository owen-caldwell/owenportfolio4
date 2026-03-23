"use client";

import { useEffect } from "react";

let zoomSetupPromise: Promise<void> | null = null;

function setupZoom(): Promise<void> {
  if (zoomSetupPromise) return zoomSetupPromise;
  zoomSetupPromise = (async () => {
    const $ = (await import("jquery")).default;
    const w = window as unknown as { jQuery: typeof $; $: typeof $ };
    w.$ = $;
    w.jQuery = $;

    await import("@/lib/zoomjs/transition.js");
    await import("@/lib/zoomjs/zoom.js");
  })();
  return zoomSetupPromise;
}

export default function ImageZoomInit() {
  useEffect(() => {
    void setupZoom();
  }, []);

  return null;
}
