'use client';

import type * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { UserProfile } from '@/components/navigations/user-profile';
import { WorkspaceSwitcher } from '@/components/navigations/WorkspaceSwitcher';
import { useAppStore } from '@/store/appStore';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const pathname = usePathname();

  if (!isHydrated) {
    return (
      <Sidebar {...props}>
        <SidebarContent />
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
