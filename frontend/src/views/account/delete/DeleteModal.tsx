import { Dialog, DialogContent } from '@mui/material';

type DeleteModalProps = {
  onClose: () => void;
};

export function DeleteModal({ onClose }: DeleteModalProps) {
  return (
    <Dialog
      //      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      open
      onClose={onClose}
    >
      <DialogContent>Content</DialogContent>
    </Dialog>
  );
}
