import { type Dispatch, type JSX, useCallback, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  $toggleLink,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  type BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import { Check, ExternalLink, Pencil, Trash, X } from "lucide-react";

import { getSelectedNode } from "../utils/get-selected-node";
import { setFloatingElemPositionForLinkEditor } from "../utils/set-floating-elem-position-for-link-editor";
import { sanitizeUrl } from "../utils/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTarget, setLinkTarget] = useState<string | null>(null);
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  const [opensInNewTab, setOpensInNewTab] = useState(false);
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(null);

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      let currentLinkUrl = "";
      let currentTarget: string | null = null;

      if (linkParent) {
        currentLinkUrl = linkParent.getURL();
        currentTarget = linkParent.getTarget();
      } else if ($isLinkNode(node)) {
        currentLinkUrl = node.getURL();
        currentTarget = node.getTarget();
      }
      setLinkUrl(currentLinkUrl);
      setLinkTarget(currentTarget);
      if (isLinkEditMode) {
        setEditedLinkUrl(currentLinkUrl || "https://");
        setOpensInNewTab(currentTarget === "_blank");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || !editorElem.contains(activeElement)) {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(
        () => {
          $updateLinkEditor();
        },
        { editor }
      );
    };

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem.parentElement, editor, $updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            $updateLinkEditor();
          },
          { editor }
        );
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, $updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(
      () => {
        $updateLinkEditor();
      },
      { editor }
    );
  }, [editor, $updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode) {
      setIsLink(true);
    }

    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isLinkEditMode, setIsLink]);

  const monitorInputInteraction = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      const nextUrl = sanitizeUrl(editedLinkUrl);

      if (nextUrl !== "") {
        editor.update(() => {
          $setSelection(lastSelection.clone());
          $toggleLink({
            url: nextUrl,
            target: opensInNewTab ? "_blank" : null,
            rel: opensInNewTab ? "noopener noreferrer" : null,
          });

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(nextUrl, {
                rel: opensInNewTab ? "noopener noreferrer" : null,
                target: opensInNewTab ? "_blank" : null,
                title: parent.getTitle(),
              });
              parent.replace(linkNode, true);
            }
          }
        });
      }
      setEditedLinkUrl("https://");
      setIsLinkEditMode(false);
    }
  };
  return (
    <div
      ref={editorRef}
      className="absolute top-0 left-0 w-full max-w-sm rounded-md opacity-0 shadow-md"
    >
      {!isLink ? null : isLinkEditMode ? (
        <div className="space-y-2 rounded-md border bg-popover p-2 text-popover-foreground">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editedLinkUrl}
              onChange={(event) => setEditedLinkUrl(event.target.value)}
              onKeyDown={monitorInputInteraction}
              placeholder="https://example.com"
              className="link-input flex-grow"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsLinkEditMode(false);
                setIsLink(false);
              }}
              className="shrink-0"
              aria-label="Cancel link edit"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleLinkSubmission}
              className="shrink-0"
              aria-label="Apply link"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={opensInNewTab}
              onChange={(e) => setOpensInNewTab(e.target.checked)}
              className="rounded"
            />
            Open in new tab
          </Label>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-popover p-1 pl-2 text-popover-foreground">
          <a
            href={sanitizeUrl(linkUrl)}
            target={linkTarget === "_blank" ? "_blank" : undefined}
            rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
            className="flex min-w-0 items-center gap-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap"
          >
            <span className="overflow-hidden text-ellipsis">{linkUrl}</span>
            {linkTarget === "_blank" ? <ExternalLink className="h-3.5 w-3.5 shrink-0" /> : null}
          </a>
          <div className="flex">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditedLinkUrl(linkUrl);
                setIsLinkEditMode(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  isLinkEditMode: boolean,
  setIsLinkEditMode: Dispatch<boolean>
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode);
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) || autoLinkNode.getIsUnlinked()))
            );
          });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      } else if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length === 0) {
          setIsLink(false);
          return;
        }
        const node = nodes[0];
        const parent = node.getParent();
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            $updateToolbar();
          },
          { editor }
        );
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  if (!anchorElem) {
    return null;
  }

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  );
}

export function FloatingLinkEditorPlugin({
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLDivElement | null;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  return useFloatingLinkEditorToolbar(editor, anchorElem, isLinkEditMode, setIsLinkEditMode);
}
