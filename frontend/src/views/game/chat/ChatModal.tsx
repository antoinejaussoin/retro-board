import { Message } from 'common';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { Dialog, DialogContent, DialogTitle } from 'ui/dialog';
import Chat from './Chat';

type ChatModalProps = {
  messages: Message[];
  onMessage: (content: string) => void;
  onClose: () => void;
};

export default function ChatModal({
  messages,
  onMessage,
  onClose,
}: ChatModalProps) {
  const fullScreen = useMediaQuery('(max-width:800px)');
  return (
    <Dialog open onClose={onClose}>
      <DialogContent
        fullScreen={fullScreen}
        size="md"
        className={
          fullScreen
            ? 'overflow-hidden'
            : 'h-[min(70dvh,640px)] overflow-hidden'
        }
      >
        <DialogTitle>Chat</DialogTitle>
        <div className="flex min-h-0 flex-1 flex-col">
          <Chat messages={messages} onMessage={onMessage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
