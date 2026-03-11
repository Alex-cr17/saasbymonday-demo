'use client'

import { /*useEffect, useState, */type PropsWithChildren } from 'react'
import { useAppStore } from '@/store/appStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeSwitcher } from '@/components/navigations/theme-switcher';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/helpers/routes';
export type DropdownUserProfileProps = PropsWithChildren & {
  align?: 'center' | 'start' | 'end';
}

export function DropdownUserProfile({ children, align = 'start' }: DropdownUserProfileProps) {
  const { currentUser } = useAppStore()
  const router = useRouter()

  if (!currentUser) {
    return null
  }

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error logging out:', error.message)
    } else {
      router.push(ROUTES.AUTH.LOGIN)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="sm:!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]">
          <DropdownMenuLabel className="max-w-[18rem] truncate">{currentUser?.email}</DropdownMenuLabel>
          <ThemeSwitcher />
          <DropdownMenuGroup>
          </DropdownMenuGroup>
        <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleLogout}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
