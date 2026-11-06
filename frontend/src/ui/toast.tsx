import { useCallback } from 'react';
import { toast, Toaster as Sonner } from 'sonner';

type SnackbarVariant = 'default' | 'error' | 'success' | 'warning' | 'info';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: '#fffdf8',
          color: '#1c1917',
          border: '1px solid #e6dfd4',
          fontFamily: 'inherit',
        },
      }}
    />
  );
}

export function useSnackbar() {
  const enqueueSnackbar = useCallback(
    (message: string, options?: { variant?: SnackbarVariant }) => {
      const text = String(message ?? '');
      switch (options?.variant) {
        case 'error':
          toast.error(text);
          break;
        case 'success':
          toast.success(text);
          break;
        case 'warning':
          toast.warning(text);
          break;
        case 'info':
          toast.info(text);
          break;
        default:
          toast(text);
      }
    },
    [],
  );
  return { enqueueSnackbar };
}
