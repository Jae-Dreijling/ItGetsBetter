import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  feature?: string
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-warning" />
          <p className="font-medium text-text-primary mb-1">
            Something went wrong{this.props.feature ? ` with ${this.props.feature}` : ''}
          </p>
          <p className="text-sm text-muted mb-4">Your data is safe.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
