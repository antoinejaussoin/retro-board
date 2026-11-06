import { Bold, Heading, Italic, List } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { cn } from 'ui/cn';
import { IconButton } from 'ui/icon-button';
import { fieldClass } from 'ui/input';

interface SummaryMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const markdownClass =
  'text-sm leading-6 [&_h1]:mb-2 [&_h1]:text-xl [&_h2]:mb-2 [&_h2]:text-lg [&_h3]:mb-1 [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5';

export function SummaryMarkdownEditor({
  value,
  onChange,
}: SummaryMarkdownEditorProps) {
  const { t } = useTranslation();
  const input = useRef<HTMLTextAreaElement>(null);

  const apply = (before: string, after: string, fallback: string) => {
    const field = input.current;
    if (!field) {
      onChange(`${value}${before}${fallback}${after}`);
      return;
    }
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    const cursor = start + before.length + selected.length + after.length;
    onChange(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div>
      <div className="mb-2 flex gap-1">
        <IconButton
          className="size-8"
          aria-label={t('SummaryBoard.bold')}
          onClick={() => apply('**', '**', t('SummaryBoard.bold'))}
        >
          <Bold className="size-4" />
        </IconButton>
        <IconButton
          className="size-8"
          aria-label={t('SummaryBoard.italic')}
          onClick={() => apply('*', '*', t('SummaryBoard.italic'))}
        >
          <Italic className="size-4" />
        </IconButton>
        <IconButton
          className="size-8"
          aria-label={t('SummaryBoard.heading')}
          onClick={() => apply('## ', '', t('SummaryBoard.heading'))}
        >
          <Heading className="size-4" />
        </IconButton>
        <IconButton
          className="size-8"
          aria-label={t('SummaryBoard.list')}
          onClick={() => apply('- ', '', t('SummaryBoard.list'))}
        >
          <List className="size-4" />
        </IconButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          ref={input}
          rows={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={t('SummaryBoard.edit')}
          className={cn(fieldClass, 'min-h-48 py-2')}
        />
        <div className="overflow-auto rounded-xl border border-line p-4">
          <p className="mb-2 text-xs text-muted">{t('SummaryBoard.preview')}</p>
          <div className={markdownClass}>
            <ReactMarkdown>{value}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
