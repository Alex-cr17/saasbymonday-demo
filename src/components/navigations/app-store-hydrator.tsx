'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import type { UITenant } from '@/store/appStore';
import { syncTenantCookie } from '@/lib/api/client/tenants';

type Props = {
  tenants: UITenant[];
  activeTenantId: string | null;
  currentUser: {
    id: string;
    email: string;
    displayName: string;
  } | null;
};

export function AppStoreHydrator({ tenants, activeTenantId, currentUser }: Props) {
  const setTenants = useAppStore((s) => s.setTenants);
  const setActiveTenant = useAppStore((s) => s.setActiveTenant);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setIsHydrated = useAppStore((s) => s.setIsHydrated);
  const didSync = useRef(false);

  useEffect(() => {
    setCurrentUser(currentUser);
    setTenants(tenants);

    if (activeTenantId) {
      const active = tenants.find((t) => t.id === activeTenantId) ?? null;
      setActiveTenant(active);

      if (!didSync.current) {
        didSync.current = true;
        syncTenantCookie(activeTenantId).catch(() => {});
      }
    }

    setIsHydrated(true);
  }, [currentUser, tenants, activeTenantId, setCurrentUser, setTenants, setActiveTenant, setIsHydrated]);

  return null;
}