'use client'

import { createContext, ReactNode } from 'react'
import { ToastAction, ToastDescription, ToastProvider as Toast, ToastViewport, Root, ToastTitle } from '@radix-ui/react-toast'
import { useAppStore } from '@/store/appStore'
import { ToastType } from '@/utils/constants'
import {cn} from '@/lib/utils';

interface ToastState {
  addToast: (message: string, type: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastState | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, removeToast } = useAppStore()

  const addToast = (message: string, type: ToastType, description: string | undefined) => {
    showToast(message, type, description)
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toast swipeDirection="right" duration={4000}>
        <>
          {toasts.map((toast) => (
            <Root
              key={toast.id}
              className={cn("grid grid-cols-[auto_max-content] items-center gap-x-[15px] rounded-md  p-[15px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]", {
                "bg-red4": toast.type === ToastType.Error,
                "bg-green4": toast.type === ToastType.Success,
                "bg-yellow4": toast.type === ToastType.Warning,
                "bg-blue4": toast.type === ToastType.Info,
              })}
              open={toast.isOpen}
            >
              <ToastTitle className="mb-[5px] text-[15px] font-medium text-slate12 [grid-area:_title]">
                {toast.message}
              </ToastTitle>
              <ToastDescription asChild>
                <span className="m-0 text-[13px] leading-[1.3] text-slate11 [grid-area:_description]">
                  {toast.description}
                </span>
              </ToastDescription>
              <ToastAction
                className="[grid-area:_action]"
                asChild
                altText="Close"
              >
                <button
                  className={`inline-flex h-[25px] items-center justify-center rounded px-1.5 text-xs font-medium leading-[25px] shadow-[inset_0_0_0_1px] hover:shadow-[inset_0_0_0_1px] focus:shadow-[0_0_0_2px] ${
                    toast.type === "error"
                      ? "bg-red2 text-red11 shadow-red7 hover:shadow-red8 focus:shadow-red8"
                      : toast.type === "success"
                        ? "bg-green2 text-green11 shadow-green7 hover:shadow-green8 focus:shadow-green8"
                        : toast.type === "warning"
                          ? "bg-yellow2 text-yellow11 shadow-yellow7 hover:shadow-yellow8 focus:shadow-yellow8"
                          : "bg-blue2 text-blue11 shadow-blue7 hover:shadow-blue8 focus:shadow-blue8"
                  }`}
                  onClick={() => removeToast(toast.id)}
                >
                  Close
                </button>
              </ToastAction>
            </Root>

          ))}
          <ToastViewport className="fixed top-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_15px]" />
        </>
      </Toast>
    </ToastContext.Provider>
  )
}