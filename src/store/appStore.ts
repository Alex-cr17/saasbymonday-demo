'use client'

import { create } from 'zustand'
import { ToastType } from '@/utils/constants'

export interface UIUser {
  id: string;
  email: string;
  displayName: string;
}

export interface UITenant {
  id: string;
  name: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  isOpen: boolean;
}

export interface AppState {
  currentUser: UIUser | null;
  setCurrentUser: (user: UIUser | null) => void;
  tenants: UITenant[];
  setTenants: (tenants: UITenant[]) => void;
  activeTenant: UITenant | null;
  setActiveTenant: (tenant: UITenant | null) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
  notifications: Notification[];
  isHydrated: boolean;
  setIsHydrated: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  tenants: [],
  setTenants: (tenants) => set({ tenants }),
  activeTenant: null,
  setActiveTenant: (tenant) => set({ activeTenant: tenant }),
  /* Toast Notifications */
  toasts: [],

  showToast: (message: string, type: ToastType = ToastType.Info, description?: string) => {
    const id = Date.now().toString()
    const duration =
      type === ToastType.Error ? 10000 :
        type === ToastType.Warning ? 7000 :
          5000

    set((state) => ({
      toasts: [
        ...state.toasts,
        { id, message, type, description, isOpen: true },
      ],
    }))

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    }, duration)
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  /* Notifications */
  notifications: [],
  isHydrated: false,
  setIsHydrated: (value: boolean) => set({ isHydrated: value }),
}))
