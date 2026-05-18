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
  setHTML: (html: string, cursorToEnd?: boolean) => void;
};

export default function ToastEditorField({ initialValue, onChange }: ToastEditorFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastEditorInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    async function mountEditor() {
      const { default: Editor } = await import("@toast-ui/editor");

      if (!mounted || !rootRef.current || editorRef.current) {
        return;
      }

      const editor = new Editor({
        el: rootRef.current,
        height: "22rem",

        // 핵심: 일반 글쓰기 모드
        initialEditType: "wysiwyg",

        autofocus: false,

        toolbarItems: [
          ["heading", "bold", "italic", "strike"],
          ["hr", "quote"],
          ["ul", "ol"],
          ["image", "link"],
        ],

        // HTML을 initialValue에 바로 넣지 않음
        initialValue: "",

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

            if (!currentEditor) {
              return;
            }

            onChangeRef.current(currentEditor.getHTML());
          },
        },
      }) as ToastEditorInstance;

      editorRef.current = editor;

      if (initialValueRef.current) {
        editor.setHTML(initialValueRef.current, false);
      }
    }

    mountEditor();

    return () => {
      mounted = false;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  return <div ref={rootRef} />;
}
