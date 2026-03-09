'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, Building2, Check } from 'lucide-react'
import { useAppStore, UITenant } from '@/store/appStore'
import { switchTenant } from '@/lib/api/client/tenants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function WorkspaceSwitcher() {
  const { tenants, activeTenant, setActiveTenant } = useAppStore()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSwitchTenant = async (tenant: UITenant) => {
    if (tenant.id === activeTenant?.id) return

    try {
      const success = await switchTenant(tenant.id)

      if (success) {
        setActiveTenant(tenant)
        await queryClient.invalidateQueries()
        // Use router.refresh() to re-run Server Components with new active tenant cookie
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to switch tenant:', error)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTenant?.name ?? 'Select Workspace'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {tenants.length} workspace{tenants.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleSwitchTenant(tenant)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                <span className="flex-1 truncate">{tenant.name}</span>
                {activeTenant?.id === tenant.id && (
                  <Check className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
