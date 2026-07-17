# shadcn-lexical-editor

A rich text editor component for [shadcn/ui](https://ui.shadcn.com) built with [Lexical](https://lexical.dev).

## Features

- Rich text formatting (Bold, Italic, Underline, Strikethrough, Code, Sub/Superscript)
- Block types (Paragraph, Headings H1-H3, Lists, Checklists, Code Blocks, Quotes)
- Image upload (URL + File upload with drag-and-drop resize)
- Links with floating editor popup
- Tables
- Text alignment and indentation
- **Tab indentation** - Press Tab to indent, Shift+Tab to outdent
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

### One-Line Install

Run this single command to install the editor:

```bash
npx shadcn@latest add https://alishpawn.com.np/r/registry.json
```

Or from GitHub:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/alishpawn/new-portfolio/main/registry.json
```

This will automatically:
- ✅ Copy all editor files to `components/ui/rich-text-editor/`
- ✅ Install all Lexical dependencies
- ✅ Set up import paths correctly

### 📖 Documentation

For detailed guides, examples, and customization options, visit:
- **[Text Editor Guide](https://alishpawn.com.np/shadcn-text-editor-guide)** - Complete editor documentation
- **[Payment Integration Guide](https://alishpawn.com.np/payment-integration-guide)** - Stripe & Khalti setup

### Usage

```tsx
import { RichTextEditor } from "@/components/ui/rich-text-editor";

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

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Indent current line (list items, code blocks) |
| `Shift+Tab` | Outdent current line |
| `Ctrl/Cmd+B` | Bold |
| `Ctrl/Cmd+I` | Italic |
| `Ctrl/Cmd+U` | Underline |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z` | Redo |

### Tab Indentation

The editor uses `TabIndentationPlugin` to handle tab key presses:

- **Tab**: Indents the current line (works in lists, code blocks, blockquotes)
- **Shift+Tab**: Outdents the current line
- Works with nested lists (creates sub-lists)
- Maintains proper hierarchy in numbered and bullet lists

```tsx
// TabIndentationPlugin is automatically included
<TabIndentationPlugin />
```

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     RichTextEditor                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ToolbarPlugin (Block formats, fonts, insert, etc.) │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ContentEditable (The actual editor area)           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Floating Toolbar (Appears on text selection)       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Core Concepts

1. **Lexical Editor** - Facebook's text editor framework
2. **Decorator Nodes** - Custom elements like images that render React components
3. **Plugins** - Modular features (toolbar, image upload, etc.)
4. **Extensions** - Non-visual features (emoji auto-replace, auto-links)

---

## Image Upload

### How It Works

```
User clicks "Insert Image" → Selects file → Validates → Uploads to your server → Gets URL → Inserts into editor
```

### Step 1: File Validation

The editor validates images before upload:

```typescript
// File type check - only allows JPG, PNG, WebP, GIF
const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

// File size limit - 500KB max
const MAX_IMAGE_UPLOAD_BYTES = 500 * 1024; // 500 KB
```

### Step 2: Upload to Your Server

The editor sends the file to your API endpoint:

```typescript
// POST to /api/uploads with FormData
const response = await fetch("/api/uploads", {
  method: "POST",
  body: formData,  // multipart/form-data
});

// Expects your server to return: { url: "https://..." }
const data = await response.json();
return data.url;
```

### Step 3: Insert into Editor

Creates an ImageNode with the uploaded URL:

```typescript
const node = $createImageNode({
  src: "https://your-server.com/image.jpg",  // The URL from your server
  altText: "User's image",
  width: 500,
  height: 300,
});
```

### Setting Up Your API Endpoint

You need to create an API route that handles the upload. Here's a Next.js example:

```typescript
// app/api/uploads/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Option 1: Upload to Cloudinary
    const url = await uploadToCloudinary(file);
    
    // Option 2: Upload to AWS S3
    // const url = await uploadToS3(file);
    
    // Option 3: Save locally (for development)
    // const url = await saveLocally(file);

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
```

### Cloudinary Example

```typescript
// app/api/uploads/route.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  // Convert File to buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "editor-uploads" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}
```

### S3 Example

```typescript
// app/api/uploads/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  const key = `uploads/${Date.now()}-${file.name}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  }));

  const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  return NextResponse.json({ url });
}
```

### Customizing Image Upload

Edit `registry/image-upload/image-upload-validation.ts`:

```typescript
// Change max file size (currently 500KB)
export const MAX_IMAGE_UPLOAD_BYTES = 1024 * 1024; // 1MB

// Add more file types
export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";
```

---

## Adding New Block Formats

### Step 1: Create Format Component

Create a new file `registry/plugins/toolbar/block-format/format-callout.tsx`:

```tsx
import { $createParagraphNode } from "lexical";
import { FORMAT_ELEMENT_COMMAND } from "lexical";

export function FormatCallout() {
  return (
    <button
      onClick={() => {
        // Your format logic here
        console.log("Callout format clicked");
      }}
      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent"
    >
      <span className="text-lg">💡</span>
      <span>Callout</span>
    </button>
  );
}
```

### Step 2: Add to Toolbar

Edit `registry/index.tsx` and add to the toolbar:

```tsx
import { FormatCallout } from "./plugins/toolbar/block-format/format-callout";

// Inside the toolbar JSX
<BlockFormatDropDown>
  <FormatParagraph />
  <FormatHeading levels={["h1", "h2", "h3"]} />
  <FormatNumberedList />
  <FormatBulletedList />
  <FormatCheckList />
  <FormatCodeBlock />
  <FormatQuote />
  <FormatCallout />  {/* Add your new format here */}
</BlockFormatDropDown>
```

---

## Adding New Insert Options

### Step 1: Create Insert Component

Create `registry/plugins/toolbar/block-insert/insert-video.tsx`:

```tsx
import { $createParagraphNode, INSERT_TEXT_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function InsertVideo() {
  const [editor] = useLexicalComposerContext();

  const handleInsert = () => {
    const url = prompt("Enter video URL:");
    if (url) {
      editor.dispatchCommand(INSERT_TEXT_COMMAND, `[Video: ${url}]`);
    }
  };

  return (
    <button
      onClick={handleInsert}
      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent"
    >
      <span className="text-lg">🎥</span>
      <span>Video</span>
    </button>
  );
}
```

### Step 2: Add to Insert Menu

Edit `registry/index.tsx`:

```tsx
import { InsertVideo } from "./plugins/toolbar/block-insert/insert-video";

// Inside the toolbar JSX
<BlockInsertPlugin>
  <InsertHorizontalRule />
  <InsertImage />
  <InsertTable />
  <InsertVideo />  {/* Add your new insert option here */}
</BlockInsertPlugin>
```

---

## Adding New Extensions

### Step 1: Create Extension

Create `registry/extensions/mentions-extension.tsx`:

```tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export function MentionsExtension() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register text content change listener
    const removeListener = editor.registerTextContentListener((textContent) => {
      // Auto-replace @username with mention
      if (textContent.includes("@")) {
        console.log("Mention detected:", textContent);
      }
    });

    return removeListener;
  }, [editor]);

  return null; // Extensions don't render UI
}
```

### Step 2: Add to Editor

Edit `registry/index.tsx`:

```tsx
import { MentionsExtension } from "./extensions/mentions-extension";

// Inside the LexicalComposer
<LexicalComposer initialConfig={initialConfig}>
  <MentionsExtension />  {/* Add your extension here */}
  <ToolbarPlugin>
    {/* ... */}
  </ToolbarPlugin>
  {/* ... */}
</LexicalComposer>
```

---

## Customizing the Theme

### Colors

Edit `registry/themes/editor-theme.ts`:

```typescript
export const editorTheme = {
  // Text formatting
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono bg-muted px-1 rounded",
  },
  
  // Block formats
  paragraph: "mb-2",
  heading: {
    h1: "text-4xl font-bold mb-4",
    h2: "text-3xl font-semibold mb-3",
    h3: "text-2xl font-medium mb-2",
  },
  
  // Lists
  list: {
    ul: "list-disc pl-6 mb-2",
    ol: "list-decimal pl-6 mb-2",
    nested: { listitem: "list-none" },
  },
  
  // Code blocks
  code: "font-mono bg-muted p-4 rounded-lg overflow-x-auto",
  
  // Quotes
  quote: "border-l-4 border-primary pl-4 italic text-muted-foreground",
  
  // Links
  link: "text-primary underline hover:text-primary/80",
};
```

### Styling

Edit `registry/themes/editor-theme.css`:

```css
/* Custom styles for the editor */
.lexical-editor {
  min-height: 200px;
}

.lexical-editor:focus {
  outline: none;
}

/* Image styling */
.lexical-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
```

---

## Advanced Configuration

### Custom Placeholder

```tsx
<RichTextEditor
  placeholder="Write your story here..."
  // Or with a custom component
  placeholder={<CustomPlaceholder />}
/>
```

### Read-Only Mode

```tsx
<RichTextEditor
  value={savedContent}
  editable={false}
  onChange={(value) => console.log("Content:", value)}
/>
```

### Character Limit

```typescript
// In registry/extensions/max-length-extension.tsx
const MAX_LENGTH = 10000;

export function MaxLengthExtension() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      const text = node.getTextContent();
      if (text.length > MAX_LENGTH) {
        node.setTextContent(text.slice(0, MAX_LENGTH));
      }
    });
  }, [editor]);
  
  return null;
}
```

### Custom Toolbar

```tsx
import { RichTextEditor } from "@/components/ui/rich-text-editor";

function CustomEditor() {
  const [editor, setEditor] = useState(null);

  const handleCustomAction = () => {
    if (editor) {
      // Custom logic
      editor.focus();
    }
  };

  return (
    <div>
      <RichTextEditor
        value={content}
        onChange={setContent}
      />
      <button onClick={handleCustomAction}>
        Custom Action
      </button>
    </div>
  );
}
```

---

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

---

## Troubleshooting

### Images Not Uploading

1. Check your API endpoint exists at `/api/uploads`
2. Verify CORS headers if using a different domain
3. Check browser console for errors

### Import Errors

Make sure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Toolbar Not Showing

Ensure you have all required shadcn/ui components:

```bash
npx shadcn@latest add button dialog dropdown-menu input tabs toggle toggle-group separator label checkbox field popover
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with a Next.js project
5. Submit a pull request

---

## License

MIT

---

## Support

- [GitHub Issues](https://github.com/alishpawn/new-portfolio/issues)
- [Documentation](https://ui.shadcn.com)
- [Lexical Docs](https://lexical.dev)
