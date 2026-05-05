import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface HelpTooltipProps {
  title: string;
  content: string;
  shortcut?: string;
}

export default function HelpTooltip({ title, content, shortcut }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
        aria-label={`مساعدة حول ${title}`}
      >
        <HelpCircle className="h-4 w-4" />
        {shortcut && <span className="text-xs bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">{shortcut}</span>}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[hsl(var(--foreground))] leading-relaxed">{content}</p>
          </div>
          {shortcut && (
            <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                اختصار: <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">{shortcut}</kbd>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
