import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="bg-surface-container max-w-lg w-full rounded-2xl p-8 border border-error/20 shadow-2xl text-center">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[40px] text-error">
                error
              </span>
            </div>
            
            <h1 className="font-headline-xl text-3xl text-on-surface mb-4">
              Something went wrong.
            </h1>
            
            <p className="font-body-lg text-on-surface-variant mb-8">
              We encountered an unexpected error while loading this page. 
              Our team has been notified.
            </p>

            {this.state.error && (
              <div className="bg-surface p-4 rounded-xl text-left overflow-auto max-h-48 mb-8 border border-outline-variant/10">
                <p className="font-mono text-sm text-error whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:bg-primary/90 transition-colors w-full flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
