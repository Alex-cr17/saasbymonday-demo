'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/context/ToastContext';
import { ConfirmProvider } from '@/context/ConfirmProvider';
import { DialogManager } from '@/components/dialogs/DialogManager';
import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient();

export function QueryClientProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ConfirmProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ConfirmProvider>
      </ThemeProvider>
      <DialogManager />
    </QueryClientProvider>
  );
}
