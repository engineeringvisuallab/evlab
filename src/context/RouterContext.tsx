import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentPath, navigate, subscribeToRouteChanges } from '@/utils/router'

interface RouterContextValue {
  path: string
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => subscribeToRouteChanges(setPath), [])

  return (
    <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
  )
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider')
  return ctx
}
