import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";

import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
} from "@lexical/html";
import {
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
} from "lexical";

import { TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ClearEditorActionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="relative">
      {showClearConfirm ? (
        <div className="flex items-center gap-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
              editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
              setShowClearConfirm(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setShowClearConfirm(true)}
          title="Clear editor"
          aria-label="Clear editor"
        >
          <TrashIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}

export function SourceViewPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isSourceView, setIsSourceView] = useState(false);
  const [source, setSource] = useState("");

  const toggleSourceView = () => {
    if (!isSourceView) {
      editor.getEditorState().read(() => {
        const htmlString = $generateHtmlFromNodes(editor);
        setSource(htmlString);
      });
    } else {
      // Re-parse HTML back to editor state
      const parser = new DOMParser();
      const dom = parser.parseFromString(source, "text/html");
      editor.update(() => {
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = editor.getRootElement();
        if (root) {
          editor.update(() => {
            const { $getRoot, $createParagraphNode } = require("lexical");
            const rootNode = $getRoot();
            rootNode.clear();
            rootNode.append(...nodes);
          });
        }
      });
    }
    setIsSourceView(!isSourceView);
  };

  return (
    <Button
      variant={isSourceView ? "secondary" : "outline"}
      size="icon-sm"
      onClick={toggleSourceView}
      title="Toggle source view"
      aria-label="Toggle source view"
    >
      <span className="text-xs font-mono">&lt;/&gt;</span>
    </Button>
  );
}

export function EditModeTogglePlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(editor.isEditable());

  return (
    <Button
      variant={isEditable ? "outline" : "secondary"}
      size="icon-sm"
      onClick={() => {
        const newEditable = !isEditable;
        editor.setEditable(newEditable);
        setIsEditable(newEditable);
      }}
      title={isEditable ? "Read-only mode" : "Edit mode"}
      aria-label={isEditable ? "Read-only mode" : "Edit mode"}
    >
      {isEditable ? (
        <span className="text-xs">✏️</span>
      ) : (
        <span className="text-xs">🔒</span>
      )}
    </Button>
  );
}
