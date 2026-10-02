'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function GlobalAuthCheck({ profile }: { profile: any }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup' || pathname === '/choose-username') {
      return
    }
    
    if (profile && profile.username_chosen === false) {
      router.push('/choose-username')
    }
  }, [pathname, router, profile])

  return null
}
