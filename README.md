# shadcn-lexical-editor

A rich text editor component for [shadcn/ui](https://ui.shadcn.com) built with [Lexical](https://lexical.dev).

## Features

- Rich text formatting (Bold, Italic, Underline, Strikethrough, Code, Sub/Superscript)
- Block types (Paragraph, Headings H1-H3, Lists, Checklists, Code Blocks, Quotes)
- Image upload (URL + File upload with drag-and-drop)
- Links with floating editor popup
- Tables
- Text alignment and indentation
- Font family, font size, font color, and highlight color
- Floating text format toolbar (appears on text selection)
- Undo/Redo
- Clear formatting
- Emoji auto-replacement (`:)` → 🙂)
- Auto-links (URLs auto-detected)
- Horizontal rules

## Installation

### Prerequisites

This component requires shadcn/ui to be set up in your project. Make sure you have:

1. A Next.js (or similar) project with Tailwind CSS
2. shadcn/ui initialized (`npx shadcn@latest init`)

### Required shadcn/ui Components

Install these shadcn/ui components that the editor depends on:

```bash
npx shadcn@latest add button dialog dropdown-menu input tabs toggle toggle-group separator label checkbox field popover
```

### Copy the Editor Files

Copy the entire `registry/` folder into your project's `components/` directory:

```bash
# From the shadcn-lexical-editor directory
cp -r registry/ your-project/components/shadcn-editor/
```

Then update the `@/` import paths in the editor files to match your project structure. If you placed the files under `components/shadcn-editor/`, the imports should work as-is (assuming your `tsconfig.json` has `@/components/*` mapped).

### Install Peer Dependencies

```bash
npm install lexical @lexical/rich-text @lexical/react @lexical/list @lexical/link @lexical/code @lexical/selection @lexical/utils @lexical/extension @lexical/text @lexical/markdown @lexical/table lucide-react
```

### Usage

```tsx
import { RichTextEditor } from "@/components/shadcn-editor";

function MyPage() {
  const [content, setContent] = useState("");

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `""` | Initial markdown content |
| `onChange` | `(value: string) => void` | - | Called with markdown string on every change |
| `placeholder` | `string` | `"Type "/" for commands..."` | Placeholder text |
| `className` | `string` | - | Additional CSS classes for the editor wrapper |
| `editable` | `boolean` | `true` | Whether the editor is editable |

## File Structure

```
registry/
├── index.tsx                    # Main export
├── context/
│   └── toolbar-context.tsx      # Toolbar React context
├── editor-hooks/
│   ├── use-update-toolbar.ts    # Toolbar state update hook
│   └── use-modal.tsx            # Modal dialog hook
├── editor-ui/
│   ├── content-editable.tsx     # ContentEditable wrapper
│   ├── image-component.tsx      # Image node component
│   ├── image-resizer.tsx        # Image resize handles
│   └── color-picker.tsx         # Color picker component
├── extensions/
│   ├── images-extension.tsx     # Image insert + drag-drop
│   ├── emojis-extension.tsx     # Emoji auto-replacement
│   ├── auto-link-extension.tsx  # Auto-detect URLs
│   ├── drag-drop-paste-extension.tsx  # Drag-drop paste
│   ├── markdown-shortcuts-extension.tsx # Markdown shortcuts
│   └── max-length-extension.tsx # Character limit
├── nodes/
│   ├── image-node.tsx           # Image DecoratorNode
│   └── emoji-node.tsx           # Emoji TextNode
├── plugins/
│   ├── toolbar/
│   │   ├── toolbar-plugin.tsx
│   │   ├── block-format-toolbar-plugin.tsx
│   │   ├── block-format/        # Format options
│   │   ├── block-insert-plugin.tsx
│   │   ├── block-insert/        # Insert options
│   │   ├── font-format-toolbar-plugin.tsx
│   │   ├── font-family-toolbar-plugin.tsx
│   │   ├── font-size-toolbar-plugin.tsx
│   │   ├── font-color-toolbar-plugin.tsx
│   │   ├── font-background-toolbar-plugin.tsx
│   │   ├── link-toolbar-plugin.tsx
│   │   ├── element-format-toolbar-plugin.tsx
│   │   ├── subsuper-toolbar-plugin.tsx
│   │   ├── clear-formatting-toolbar-plugin.tsx
│   │   └── history-toolbar-plugin.tsx
│   ├── floating-text-format-plugin.tsx
│   ├── floating-link-editor-plugin.tsx
│   └── actions/
│       └── actions-plugin.tsx
├── utils/
│   ├── get-selected-node.ts
│   ├── set-floating-elem-position.ts
│   ├── set-floating-elem-position-for-link-editor.ts
│   ├── get-dom-range-rect.ts
│   └── url.ts
├── themes/
│   ├── editor-theme.ts
│   └── editor-theme.css
├── image-upload/
│   ├── upload-image-file.ts
│   └── image-upload-validation.ts
└── tsconfig.json
```

## License

MIT
