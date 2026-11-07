import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from 'ui/cn';

type ChatMessageProps = {
  message: string | ReactNode;
  own?: boolean;
};

export default function ChatMessage({
  message,
  own = false,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'mt-4 flex',
        own ? 'justify-end pl-10' : 'justify-start pr-10',
      )}
    >
      <div
        className={cn(
          'max-w-full rounded-2xl px-4 py-3 text-left text-sm leading-6',
          '[&_a]:underline [&_blockquote]:mb-2 [&_code]:text-[0.9em] [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_pre]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
          '[&_blockquote:last-child]:mb-0 [&_ol:last-child]:mb-0 [&_p:last-child]:mb-0 [&_pre:last-child]:mb-0 [&_ul:last-child]:mb-0',
          '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-2',
          own
            ? 'bg-primary-700 text-white [&_pre]:bg-black/15'
            : 'border border-line bg-white text-ink [&_pre]:bg-black/5',
        )}
      >
        {typeof message === 'string' ? (
          <ReactMarkdown>{message}</ReactMarkdown>
        ) : (
          message
        )}
      </div>
    </div>
  );
}
