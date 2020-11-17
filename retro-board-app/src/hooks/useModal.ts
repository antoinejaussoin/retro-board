import { useCallback, useState } from 'react';

type UseModalResult = [opened: boolean, open: () => void, close: () => void];

export default function useModal(): UseModalResult {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return [open, handleOpen, handleClose];
}
