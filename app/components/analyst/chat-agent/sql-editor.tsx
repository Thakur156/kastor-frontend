import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import { Copy } from "lucide-react";
import CustomTooltip from "~/components/shared/custom-tooltip";

interface Props {
  query: string;
}

const SQLEditor: React.FC<Props> = ({ query }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  /* keep height in sync with content length */
  useEffect(() => {
    if (editorRef.current) {
      const node = editorRef.current.getDomNode();
      if (node) {
        node.style.height = `${editorRef.current.getContentHeight()}px`;
        editorRef.current.layout();
      }
    }
  }, [query]);

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    m: typeof monaco,
  ) => {
    editorRef.current = editor;

    m.editor.defineTheme("sql-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#ffffff" },
    });
    m.editor.setTheme("sql-light");

    /* resize */
    const node = editor.getDomNode();
    if (node) {
      node.style.height = `${editor.getContentHeight()}px`;
      editor.layout();
    }
  };

  const copyToClipboard = () => {
    const txt = editorRef.current?.getValue() ?? query;
    navigator.clipboard.writeText(txt);
  };

  return (
    <div className="bg-white p-4 rounded-[12px] border border-gray-200">
      {/* header row */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">SQL</span>
        <CustomTooltip
          trigger={
            <Copy
              size={16}
              className="cursor-pointer text-gray-600 hover:text-black"
              onClick={copyToClipboard}
            />
          }
          content="Copy to clipboard"
        />
      </div>

      {/* monaco */}
      <Editor
        defaultLanguage="sql"
        defaultValue={query}
        theme="sql-light"
        onMount={onMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: "off",
          folding: false,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          overviewRulerLanes: 0,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          scrollbar: { vertical: "hidden", horizontal: "visible" },
        }}
      />
    </div>
  );
};

export default SQLEditor;
