import { useCallback, useState } from 'react';

type OpenCloseCallback = () => void;

export default function useOpenClose(
  defaultValue: boolean,
  onOpen?: () => void,
  onClose?: () => void,
): [boolean, OpenCloseCallback, OpenCloseCallback] {
  const [isOpen, setIsOpen] = useState(defaultValue);
  const open = useCallback(() => {
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  }, [onOpen]);
  const close = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  return [isOpen, open, close];
}
