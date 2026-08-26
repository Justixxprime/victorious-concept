import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Site error caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display italic text-2xl text-espresso dark:text-cream">
            Something went wrong
          </h1>
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 max-w-sm">
            This part of the page hit a snag. Try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary