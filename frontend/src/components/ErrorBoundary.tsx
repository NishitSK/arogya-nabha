import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("React error boundary caught: ", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // simple refresh of current route
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
            <p className="text-muted-foreground text-sm max-w-md">
              {this.state.error?.message || 'An unexpected error occurred rendering this page.'}
            </p>
            <pre className="text-xs bg-muted/50 p-3 rounded max-w-lg overflow-auto text-left w-full">
              {this.state.error?.stack}
            </pre>
            <button onClick={this.handleReset} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary">
              Reload Page
            </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
