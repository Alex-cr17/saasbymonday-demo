'use client';

import { createContext, useCallback, useState, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface ConfirmOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

type ResolveFunc = (value: boolean) => void;

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
}

export const ConfirmContext = createContext<{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
} | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ open: false, options: null });
  const resolveRef = useRef<ResolveFunc | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, options });
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setState({ open: false, options: null });
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setState({ open: false, options: null });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  const { options } = state;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog open={state.open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options?.title ?? 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options?.description ?? ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options?.cancelText ?? 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={options?.destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {options?.confirmText ?? 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
