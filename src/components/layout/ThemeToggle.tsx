import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { IconButton } from '@/components/shared/IconButton'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <IconButton
      icon={
        theme === 'dark' ? (
          <Sun className="h-4 w-4 rotate-0 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 rotate-0 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
        )
      }
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      variant="secondary"
      size="md"
      className={className}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    />
  )
}
