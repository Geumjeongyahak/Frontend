"use client";

import { useEffect, useRef } from "react";
import { uploadPostImage } from "@/api/file/file.api";

type ToastEditorFieldProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

type ToastEditorInstance = {
  destroy: () => void;
  getHTML: () => string;
  setMinHeight?: (height: string) => void;
};

const MIN_EDITOR_HEIGHT = "22rem";

export default function ToastEditorField({ initialValue, onChange }: ToastEditorFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastEditorInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(initialValue);
  const editorValueRef = useRef(initialValue);
  const isMountedRef = useRef(false);

  initialValueRef.current = initialValue;

  function applyMinEditorHeight() {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    root.style.minHeight = MIN_EDITOR_HEIGHT;

    const defaultUi = root.querySelector(".toastui-editor-defaultUI") as HTMLElement | null;
    const main = root.querySelector(".toastui-editor-main") as HTMLElement | null;
    const mainContainer = root.querySelector(".toastui-editor-main-container") as HTMLElement | null;
    const wwContainer = root.querySelector(".toastui-editor-ww-container") as HTMLElement | null;

    defaultUi?.style.setProperty("min-height", MIN_EDITOR_HEIGHT);
    main?.style.setProperty("min-height", MIN_EDITOR_HEIGHT);
    mainContainer?.style.setProperty("min-height", MIN_EDITOR_HEIGHT);
    wwContainer?.style.setProperty("min-height", MIN_EDITOR_HEIGHT);
  }

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;
    isMountedRef.current = true;

    async function mountEditor() {
      const { default: Editor } = await import("@toast-ui/editor");

      if (!mounted || !rootRef.current || editorRef.current) {
        return;
      }

      const editor = new Editor({
        el: rootRef.current,
        height: "auto",

        // 핵심: 일반 글쓰기 모드
        initialEditType: "wysiwyg",

        autofocus: false,

        toolbarItems: [
          ["heading", "bold", "italic", "strike"],
          ["quote"],
          ["ul", "ol"],
          ["image", "link"],
        ],

        initialValue: initialValueRef.current,

        hooks: {
          addImageBlobHook: async (
            blob: Blob | File,
            callback: (url: string, altText: string) => void,
          ) => {
            const filename = blob instanceof File ? blob.name : "post-image.png";
            const uploaded = await uploadPostImage(blob, filename);

            if (uploaded.url) {
              callback(uploaded.url, filename);
            }
          },
        },

        events: {
          change: () => {
            const currentEditor = editorRef.current;

            if (!currentEditor || !isMountedRef.current) {
              return;
            }

            const nextValue = currentEditor.getHTML();

            editorValueRef.current = nextValue;
            onChangeRef.current(nextValue);
          },
        },
      }) as unknown as ToastEditorInstance;

      editorRef.current = editor;
      editor.setMinHeight?.(MIN_EDITOR_HEIGHT);
      requestAnimationFrame(applyMinEditorHeight);
      editorValueRef.current = initialValueRef.current;
    }

    mountEditor();

    return () => {
      mounted = false;
      isMountedRef.current = false;
      const editor = editorRef.current;
      editorRef.current = null;
      try {
        editor?.destroy();
      } catch {
        // Toast UI can schedule DOM updates while React is unmounting the editor.
      }
    };
  }, []);

  return <div ref={rootRef} />;
}
