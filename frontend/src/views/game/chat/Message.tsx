import { Message } from 'common';
import useCrypto from 'crypto/useCrypto';
import { formatRelative } from 'date-fns';
import { useDateLocale } from 'hooks/useFormatDate';
import useUser from 'state/user/useUser';
import { cn } from 'ui/cn';

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const locale = useDateLocale();
  const { decrypt } = useCrypto();
  const me = useUser();
  const own = !!me && me.id === message.user.id;
  return (
    <div className={cn('flex items-end gap-2', own && 'flex-row-reverse')}>
      <div className="size-8 shrink-0 overflow-hidden rounded-full bg-primary-100">
        {message.user.photo ? (
          <img
            src={message.user.photo}
            alt={message.user.name}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xs font-medium text-primary-800">
            {message.user.name.slice(0, 1)}
          </span>
        )}
      </div>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
          own
            ? 'rounded-br-md bg-primary-700 text-white'
            : 'rounded-bl-md bg-paper text-ink',
        )}
      >
        <div
          className={cn(
            'mb-0.5 flex items-baseline gap-2 text-xs',
            own ? 'text-white/75' : 'text-muted',
          )}
        >
          <span className={cn('font-semibold', own ? 'text-white' : 'text-ink')}>
            {message.user.name}
          </span>
          <span>
            {formatRelative(new Date(message.created), new Date(), { locale })}
          </span>
        </div>
        <div className="whitespace-pre-wrap break-words">
          {decrypt(message.content)}
        </div>
      </div>
    </div>
  );
}
