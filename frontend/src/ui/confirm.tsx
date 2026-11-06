import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from './button';

type ConfirmOptions = {
  title?: ReactNode;
  description?: ReactNode;
  confirmationText?: ReactNode;
  cancellationText?: ReactNode;
  confirmationButtonProps?: {
    color?: string;
    'data-cy'?: string;
  };
};

type ConfirmFn = (options: ConfirmOptions) => Promise<void>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<{
    options: ConfirmOptions;
    resolve: () => void;
    reject: () => void;
  } | null>(null);
  const decision = useRef<'accept' | 'cancel'>('cancel');

  const confirm = useCallback<ConfirmFn>((options) => {
    decision.current = 'cancel';
    return new Promise<void>((resolve, reject) => {
      setRequest({ options, resolve, reject });
    });
  }, []);

  const finish = (open: boolean) => {
    if (open || !request) {
      return;
    }
    if (decision.current === 'accept') {
      request.resolve();
    } else {
      request.reject();
    }
    decision.current = 'cancel';
    setRequest(null);
  };

  const danger = request?.options.confirmationButtonProps?.color === 'error';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root
        open={!!request}
        onOpenChange={finish}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-ink/40" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-cream p-6 text-ink shadow-2xl outline-none">
            <AlertDialog.Title className="text-lg font-medium">
              {request?.options.title}
            </AlertDialog.Title>
            {request?.options.description ? (
              <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted">
                {request.options.description}
              </AlertDialog.Description>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost">
                  {request?.options.cancellationText ?? 'Cancel'}
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant={danger ? 'danger' : 'primary'}
                  data-cy={request?.options.confirmationButtonProps?.['data-cy']}
                  onClick={() => {
                    decision.current = 'accept';
                  }}
                >
                  {request?.options.confirmationText ?? 'Confirm'}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return confirm;
}
