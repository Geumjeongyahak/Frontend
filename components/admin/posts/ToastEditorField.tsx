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
  const editorValueRef = useRef(initialValue);

  initialValueRef.current = initialValue;

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

            const nextValue = currentEditor.getHTML();

            editorValueRef.current = nextValue;
            onChangeRef.current(nextValue);
          },
        },
      }) as ToastEditorInstance;

      editorRef.current = editor;

      editorValueRef.current = initialValueRef.current;
      editor.setHTML(initialValueRef.current, false);
    }

    mountEditor();

    return () => {
      mounted = false;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || initialValue === editorValueRef.current) {
      return;
    }

    editorValueRef.current = initialValue;
    editor.setHTML(initialValue, false);
  }, [initialValue]);

  return <div ref={rootRef} />;
}
