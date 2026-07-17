"use client";

import { useCallback, useRef, useState } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRuleNode";
import { ListPlugin } from "@lexical/react/LexicalList";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  ELEMENT_TYPE_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";

import {
  CLEAR_EDITOR_COMMAND,
  DRAGSTART_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
} from "lexical";

import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import {
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { QuoteNode } from "@lexical/rich-text";
import {
  TableNode,
  TableCellNode,
  TableRowNode,
} from "@lexical/table";
import { OverflowNode } from "@lexical/overflow";
import { HeadingNode, QuoteNode as RichTextQuoteNode } from "@lexical/rich-text";
import { MarkNode } from "@lexical/mark";

import { editorTheme } from "./themes/editor-theme";
import { ContentEditable } from "./editor-ui/content-editable";
import { ToolbarPlugin } from "./plugins/toolbar/toolbar-plugin";
import { HistoryToolbarPlugin } from "./plugins/toolbar/history-toolbar-plugin";
import { BlockFormatDropDown } from "./plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "./plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "./plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "./plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "./plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "./plugins/toolbar/block-format/format-check-list";
import { FormatCodeBlock } from "./plugins/toolbar/block-format/format-code-block";
import { FormatQuote } from "./plugins/toolbar/block-format/format-quote";
import { FontFormatToolbarPlugin } from "./plugins/toolbar/font-format-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "./plugins/toolbar/font-family-toolbar-plugin";
import { FontSizeToolbarPlugin } from "./plugins/toolbar/font-size-toolbar-plugin";
import { LinkToolbarPlugin } from "./plugins/toolbar/link-toolbar-plugin";
import { ClearFormattingToolbarPlugin } from "./plugins/toolbar/clear-formatting-toolbar-plugin";
import { FontColorToolbarPlugin } from "./plugins/toolbar/font-color-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "./plugins/toolbar/font-background-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "./plugins/toolbar/element-format-toolbar-plugin";
import { SubSuperToolbarPlugin } from "./plugins/toolbar/subsuper-toolbar-plugin";
import { BlockInsertPlugin } from "./plugins/toolbar/block-insert-plugin";
import { InsertImage } from "./plugins/toolbar/block-insert/insert-image";
import { InsertHorizontalRule } from "./plugins/toolbar/block-insert/insert-horizontal-rule";
import { InsertTable } from "./plugins/toolbar/block-insert/insert-table";
import { FloatingTextFormatToolbarPlugin } from "./plugins/floating-text-format-plugin";
import { FloatingLinkEditorPlugin } from "./plugins/floating-link-editor-plugin";
import { ImagesExtension } from "./extensions/images-extension";
import { EmojisExtension } from "./extensions/emojis-extension";
import { AutoLinkExtension } from "./extensions/auto-link-extension";
import { DragDropPasteExtension } from "./extensions/drag-drop-paste-extension";
import { ImageNode } from "./nodes/image-node";
import { EmojiNode } from "./nodes/emoji-node";
import { Separator } from "@/components/ui/separator";

const theme = editorTheme;

function getTransformers() {
  return [
    CHECK_LIST,
    ...ELEMENT_TRANSFORMERS,
    ...ELEMENT_TYPE_TRANSFORMERS,
    ...TEXT_FORMAT_TRANSFORMERS,
    ...TEXT_MATCH_TRANSFORMERS,
  ];
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = 'Type "/" for commands...',
  className,
  editable = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const initialConfig = {
    namespace: "ShadcnLexicalEditor",
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
      ImageNode,
      EmojiNode,
      OverflowNode,
      MarkNode,
    ],
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
    editorState: value || undefined,
  };

  const handleChange = useCallback(
    (editorState: any, editor: LexicalEditor) => {
      if (onChange) {
        editorState.read(() => {
          // Import from lexical dynamically to avoid SSR issues
          const { $getRoot } = require("lexical");
          const root = $getRoot();
          const textContent = root.getTextContent();
          onChange(textContent);
        });
      }
    },
    [onChange]
  );

  return (
    <div className={`rounded-md border bg-background ${className ?? ""}`} ref={editorRef}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin>
          {({ blockType }) => (
            <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
              <HistoryToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <BlockFormatDropDown>
                <FormatParagraph />
                <FormatHeading levels={["h1", "h2", "h3"]} />
                <FormatNumberedList />
                <FormatBulletedList />
                <FormatCheckList />
                <FormatCodeBlock />
                <FormatQuote />
              </BlockFormatDropDown>
              <Separator orientation="vertical" className="h-6!" />
              <FontFamilyToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <FontFormatToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <SubSuperToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
              <ClearFormattingToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <FontColorToolbarPlugin />
              <FontBackgroundToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <ElementFormatToolbarPlugin />
              <Separator orientation="vertical" className="h-6!" />
              <BlockInsertPlugin>
                <InsertHorizontalRule />
                <InsertImage />
                <InsertTable />
              </BlockInsertPlugin>
            </div>
          )}
        </ToolbarPlugin>
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable placeholder={placeholder} />}
            ErrorBoundary={() => <div>Something went wrong.</div>}
          />
          <FloatingTextFormatToolbarPlugin
            anchorElem={editorRef.current}
            setIsLinkEditMode={setIsLinkEditMode}
          />
          <FloatingLinkEditorPlugin
            anchorElem={editorRef.current}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        </div>
        <ListPlugin />
        <TablePlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        <MarkdownShortcutPlugin transformers={getTransformers()} />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>
    </div>
  );
}

// OnChangePlugin - simple wrapper
function OnChangePlugin({ onChange }: { onChange: (editorState: any, editor: LexicalEditor) => void }) {
  const [editor] = require("@lexical/react/LexicalComposerContext").useLexicalComposerContext();
  const previousEditorStateRef = useRef(null);

  editor.registerUpdateListener(({ editorState }: any) => {
    if (previousEditorStateRef.current !== editorState) {
      previousEditorStateRef.current = editorState;
      onChange(editorState, editor);
    }
  });

  return null;
}
