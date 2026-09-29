import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, Home } from 'lucide-react'
import { toRealPath } from '@/utils/router'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Top-level safety net for the whole app.
 *
 * Without this, an uncaught error anywhere in the tree — most commonly a
 * lazy-loaded route chunk failing to load (flaky network, an ad blocker,
 * a CDN block on a font/asset the chunk's CSS depends on) — unmounts the
 * entire React tree and leaves the visitor on a blank white page with no
 * way back. This catches that, logs it, and offers a reload / home link
 * instead.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EVLab: caught a rendering error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-6">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="text-sm font-mono text-rose-400">Something went wrong loading this page</div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This can happen from a flaky connection or a blocked resource (e.g. an ad blocker or
              firewall). Reloading usually fixes it.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-4 py-2.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>
              <a
                href={toRealPath('/')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
