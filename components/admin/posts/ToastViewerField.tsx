"use client";

import { useEffect, useRef } from "react";

type ToastViewerFieldProps = {
  value: string;
};

type ToastViewerInstance = {
  destroy: () => void;
  setMarkdown: (markdown: string) => void;
};

export default function ToastViewerField({ value }: ToastViewerFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<ToastViewerInstance | null>(null);

  useEffect(() => {
    let mounted = true;

    async function mountViewer() {
      const { default: Viewer } = await import("@toast-ui/editor/dist/toastui-editor-viewer");

      if (!mounted || !rootRef.current) {
        return;
      }

      try {
        viewerRef.current?.destroy();
      } catch {
        // Toast UI may still have queued DOM work from a previous render.
      }

      const viewer = new Viewer({
        el: rootRef.current,
        initialValue: value,
      }) as ToastViewerInstance;

      viewerRef.current = viewer;
    }

    mountViewer();

    return () => {
      mounted = false;
      try {
        viewerRef.current?.destroy();
      } catch {
        // Toast UI may try to remove nodes that React or a previous cleanup already removed.
      }
      viewerRef.current = null;
    };
  }, [value]);

  return <div ref={rootRef} />;
}
