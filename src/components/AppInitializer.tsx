'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'

interface AppInitializerProps {
  children: React.ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { setCurrentUser } = useAppStore()

  useEffect(() => {
    const supabase = createClient()
    const syncCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setCurrentUser(null)
        return
      }

      setCurrentUser({
        id: user.id,
        email: user.email || '',
        displayName: user.user_metadata?.full_name || user.email || '',
      })
    }

    void syncCurrentUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncCurrentUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setCurrentUser])

  return <>{children}</>
}