'use client';

import { create } from 'zustand';
import { DialogType } from '@/utils/constants';


interface DialogState {
  type: DialogType | null;
  props: Record<string, unknown>;
  isOpen: boolean;
}

interface DialogStore {
  dialog: DialogState;
  openDialog: (type: DialogType, props?: Record<string, unknown>) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  dialog: {
    type: null,
    props: {},
    isOpen: false,
  },
  openDialog: (type, props = {}) =>
    set({
      dialog: {
        type,
        props,
        isOpen: true,
      },
    }),
  closeDialog: () =>
    set({
      dialog: {
        type: null,
        props: {},
        isOpen: false,
      },
    }),
}));

export const openDialog = (
  type: DialogType,
  props: Record<string, unknown> = {}
) => {
  useDialogStore.getState().openDialog(type, props);
};

export const closeDialog = () => {
  useDialogStore.getState().closeDialog();
};
