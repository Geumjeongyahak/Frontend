declare module "@toast-ui/editor" {
  type ImageBlobHook = (
    blob: Blob | File,
    callback: (url: string, altText: string) => void,
  ) => void | Promise<void>;

  type EditorOptions = {
    el: HTMLElement;
    height?: string;
    initialEditType?: "markdown" | "wysiwyg";
    previewStyle?: "tab" | "vertical";
    autofocus?: boolean;
    toolbarItems?: string[][];
    initialValue?: string;
    hooks?: {
      addImageBlobHook?: ImageBlobHook;
    };
    events?: {
      change?: () => void;
    };
  };

  export default class Editor {
    constructor(options: EditorOptions);
    destroy(): void;
    getHTML(): string;
  }
}
