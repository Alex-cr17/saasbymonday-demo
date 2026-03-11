export const ACTIVE_TENANT_COOKIE_NAME = 'activeTenantId';

/* Toast Notifications Types */
export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export const Roles = {
  SYSTEM_ADMIN: 'system_admin',
  OWNER: 'owner',
} as const;

export type Role = typeof Roles[keyof typeof Roles];



export const DIALOG_TYPES = {
  FEATURE: {
    CREATE: 'feature:create',
    EDIT: 'feature:edit',
  },
} as const;
export type DialogType = string;