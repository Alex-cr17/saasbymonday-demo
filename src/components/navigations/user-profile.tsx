'use client'

import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/appStore'
import { getInitials } from '@/utils/formatters'
import { DropdownUserProfile } from '@/components/navigations/dropdown-user-profile';
import { cx } from 'class-variance-authority';

export function UserProfile() {
  const { currentUser } = useAppStore()
  const initials = getInitials(currentUser?.displayName)

  return (
    <DropdownUserProfile>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx('group flex w-full items-center justify-between rounded-md px-1 py-2 text-sm font-medium text-foreground hover:bg-accent data-[state=open]:bg-accent')}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="truncate">{currentUser?.displayName}</span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
          aria-hidden="true"
        />
      </Button>
    </DropdownUserProfile>
  )
}
