import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
  previewClassName?: string;
  editorClassName?: string;
}

export function MarkdownPreview({
  value,
  onChange,
  placeholder = "Write markdown content here...",
  readOnly = false,
  className,
  minHeight = "200px",
  previewClassName,
  editorClassName
}: MarkdownPreviewProps) {
  const [activeTab, setActiveTab] = useState<string>(readOnly ? "preview" : "write");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <Card className={cn("border rounded-md overflow-hidden", className)}>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        {!readOnly && (
          <div className="flex justify-between items-center px-4 py-2 border-b bg-muted/40">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>
        )}
        
        {!readOnly && (
          <TabsContent value="write" className="mt-0 p-0">
            <Textarea
              value={value || ""}
              onChange={handleChange}
              placeholder={placeholder}
              className={cn(
                "border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none",
                editorClassName
              )}
              style={{ minHeight }}
            />
          </TabsContent>
        )}
        
        <TabsContent value="preview" className="mt-0">
          <div 
            className={cn(
              "prose prose-sm dark:prose-invert max-w-none p-4 min-h-[50px]",
              readOnly ? "" : "prose-headings:mt-2",
              previewClassName
            )}
            style={{ minHeight: readOnly ? "auto" : minHeight }}
          >
            {value ? (
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm, remarkBreaks]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">No content to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default MarkdownPreview;