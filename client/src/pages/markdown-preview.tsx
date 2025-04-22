import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MarkdownPreview, { MarkdownDisplay } from '@/components/ui/markdown-preview';

const EXAMPLE_MARKDOWN = `# Task Description

**Project:** Mobile App Redesign

## Objectives
- Update the user interface
- Improve navigation flow
- Optimize performance

## Details
The current app design needs a refresh to match our new brand guidelines. Focus on:

1. Simplifying the user journey
2. Reducing number of clicks
3. Modernizing visual elements

## Deadline
Complete within 2 weeks

## Resources
[Brand Guidelines](https://example.com)
[Design System](https://example.com/design)
`;

export default function MarkdownDemoPage() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MARKDOWN);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-2">Markdown Editor</h1>
        <p className="text-sm text-gray-600 mb-4">
          A simple markdown editor for task descriptions and notes
        </p>
      </div>

      <div className="mb-4">
        <MarkdownPreview 
          value={markdown} 
          onChange={setMarkdown} 
          minHeight="150px"
          placeholder="Write your content here..."
        />
      </div>

      <div className="flex justify-between mb-6">
        <Button
          onClick={togglePreview}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isPreviewVisible ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      {isPreviewVisible && (
        <div className="border rounded-md p-4 bg-gray-50">
          <h2 className="text-sm font-medium mb-2 text-gray-700">Preview</h2>
          <MarkdownDisplay content={markdown} />
        </div>
      )}
    </div>
  );
}