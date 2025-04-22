import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MarkdownPreview from '@/components/ui/markdown-preview';
import { Input } from '@/components/ui/input';

const DEMO_MARKDOWN = `# Markdown Preview Demo

Welcome to the **Markdown Preview** component demonstration!

## Features

This component allows you to:

1. Write Markdown content with instant preview
2. Toggle between edit and preview modes
3. View formatted content with full Markdown support

## Example Content

### Text Formatting

You can make text **bold**, *italic*, or ~~strikethrough~~.

### Lists

- Unordered list item 1
- Unordered list item 2
  - Nested item 1
  - Nested item 2

1. Ordered list item 1
2. Ordered list item 2

### Code

Inline \`code\` example.

\`\`\`typescript
// Code block example
function hello(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Blockquotes

> This is a blockquote
> 
> It can have multiple paragraphs

### Links and Images

[Link to Google](https://www.google.com)

![Image placeholder](https://via.placeholder.com/150)

---

## Usage in Project Management

Markdown is perfect for:

- Project descriptions
- Task details
- Sprint retrospectives
- Documentation
- Team communications
`;

export default function MarkdownDemoPage() {
  const [markdown, setMarkdown] = useState(DEMO_MARKDOWN);
  const [readOnlyContent, setReadOnlyContent] = useState(
    "## Read-Only Example\n\nThis content is displayed in read-only mode.\n\n- It's useful for displaying formatted content\n- Without allowing edits"
  );
  const [title, setTitle] = useState("Project Documentation");

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Markdown Preview Component</h1>
        <p className="text-gray-600">
          A powerful and flexible Markdown editor and previewer for creating rich content in your application.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Interactive Editor</CardTitle>
            <CardDescription>
              Edit the markdown content below and see the preview instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownPreview 
              value={markdown} 
              onChange={setMarkdown} 
              minHeight="400px"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Read-Only Display</CardTitle>
              <CardDescription>
                Display markdown content without editing capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownPreview 
                value={readOnlyContent} 
                readOnly 
                className="border-0 shadow-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Example</CardTitle>
              <CardDescription>
                Markdown editor with a title field
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Document Title
                </label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Document Content
                </label>
                <MarkdownPreview 
                  value={readOnlyContent} 
                  onChange={setReadOnlyContent}
                  minHeight="200px" 
                />
              </div>

              <div className="flex justify-end">
                <Button>Save Document</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              How to use the Markdown Preview component in your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownPreview 
              value={`
### Basic Usage

\`\`\`tsx
import { useState } from 'react';
import MarkdownPreview from '@/components/ui/markdown-preview';

export default function MyComponent() {
  const [content, setContent] = useState('# Hello World');

  return (
    <MarkdownPreview 
      value={content} 
      onChange={setContent} 
    />
  );
}
\`\`\`

### Read-Only Mode

\`\`\`tsx
<MarkdownPreview 
  value={myMarkdownContent} 
  readOnly 
/>
\`\`\`

### Customization

\`\`\`tsx
<MarkdownPreview 
  value={content}
  onChange={setContent}
  minHeight="300px"
  placeholder="Write your notes here..."
  className="my-custom-container"
  editorClassName="my-custom-editor"
  previewClassName="my-custom-preview"
/>
\`\`\`
              `} 
              readOnly 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}