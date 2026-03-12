import React, { type PropsWithChildren } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigations/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/requireUser';
import { withAuthDb } from '@/lib/db/withAuthDb';
import { AppStoreHydrator } from '@/components/navigations/app-store-hydrator';
import { getTenants } from '@/lib/db/queries/tenants';
import { resolveActiveTenantId } from '@/lib/tenants/resolveActiveTenant';
import { isDemoUserEmail } from '@/lib/auth/demoUser';

export default async function AdminServerLayout({ children }: Readonly<PropsWithChildren>) {
  const { user, session } = await requireUser().catch(() => redirect('/auth/login'));
  if (!session) redirect('/auth/login');
  const isDemoMode = isDemoUserEmail(session.user.email);

  const { tenants, activeTenantId } = await withAuthDb(session.access_token, async (db) => {
    const tenants = await getTenants(db, session.user.id);
    const activeTenantId = await resolveActiveTenantId(db, session.user.id);
    return { tenants, activeTenantId };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppStoreHydrator
          tenants={tenants}
          activeTenantId={activeTenantId}
          currentUser={user ? {
            id: user.id,
            email: user.email ?? '',
            displayName: user.user_metadata?.full_name ?? user.email ?? '',
          } : null}
        />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          {isDemoMode ? (
            <span className="ml-auto rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
              Demo mode
            </span>
          ) : null}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
