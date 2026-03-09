'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import type { UITenant } from '@/store/appStore';
import { syncTenantCookie } from '@/lib/api/client/tenants';

type Props = {
  tenants: UITenant[];
  activeTenantId: string | null;
};

export function AppStoreHydrator({ tenants, activeTenantId }: Props) {
  const setTenants = useAppStore((s) => s.setTenants);
  const setActiveTenant = useAppStore((s) => s.setActiveTenant);
  const setIsHydrated = useAppStore((s) => s.setIsHydrated);
  const didSync = useRef(false);

  useEffect(() => {
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
  }, [tenants, activeTenantId, setTenants, setActiveTenant, setIsHydrated]);

  return null;
}