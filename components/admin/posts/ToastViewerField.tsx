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
  const valueRef = useRef(value);

  valueRef.current = value;

  useEffect(() => {
    let mounted = true;

    async function mountViewer() {
      const { default: Viewer } = await import("@toast-ui/editor/dist/toastui-editor-viewer");

      if (!mounted || !rootRef.current || viewerRef.current) {
        return;
      }

      const viewer = new Viewer({
        el: rootRef.current,
        initialValue: valueRef.current,
      }) as ToastViewerInstance;

      viewerRef.current = viewer;
    }

    mountViewer();

    return () => {
      mounted = false;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setMarkdown(value);
  }, [value]);

  return <div ref={rootRef} />;
}
