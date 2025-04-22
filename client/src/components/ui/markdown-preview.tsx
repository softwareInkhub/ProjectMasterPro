import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from "@/components/ui/textarea";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownPreview({
  value,
  onChange,
  placeholder = "Write markdown content here...",
  className,
  minHeight = "200px",
}: MarkdownPreviewProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-xs text-muted-foreground">
        You can use markdown formatting
      </div>
      <Textarea
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "resize-none w-full border border-input rounded-md p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
        style={{ minHeight }}
      />
      <div className="mt-2 text-xs text-right text-muted-foreground">
        <a 
          href="https://www.markdownguide.org/basic-syntax/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Markdown help
        </a>
      </div>
    </div>
  );
}

export function MarkdownDisplay({ content }: { content: string }) {
  if (!content) return null;
  
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownPreview;