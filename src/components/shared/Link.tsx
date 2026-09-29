import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { useRouter } from '@/context/RouterContext'
import { toRealPath } from '@/utils/router'

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
  children: ReactNode
}

/** Internal navigation link — intercepts clicks and routes via history.pushState instead of a full reload. */
export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // allow opening in new tab
    e.preventDefault()
    navigate(to)
  }

  return (
    <a href={toRealPath(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
