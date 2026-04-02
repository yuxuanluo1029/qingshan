import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary] Runtime render error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #F6F1E8, #EEE6DB)' }}>
        <div
          className="w-full max-w-md rounded-2xl p-6 text-center"
          style={{
            background: '#FFFFFF',
            border: '1px solid #D8C8B4',
            boxShadow: '0 6px 24px rgba(36,67,80,0.12)',
          }}
        >
          <p className="text-xs tracking-widest" style={{ color: '#2D5A5A', fontFamily: "'Noto Serif SC', serif" }}>
            RUNTIME ERROR
          </p>
          <h1 className="mt-2" style={{ color: '#13243D', fontFamily: "'Noto Serif SC', serif", fontSize: '24px', fontWeight: 800 }}>
            Page Failed To Render
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
            The app captured an exception instead of showing a blank page. Reload first. If it happens again, open browser DevTools and share the first red error line.
          </p>
          <p className="mt-2 rounded-lg px-3 py-2 text-xs" style={{ background: '#F6F1E8', color: '#244350', wordBreak: 'break-word' }}>
            Error: {this.state.errorMessage}
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={this.handleReload}
              className="grow rounded-lg py-2 text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #B66A44, #D38A5C)', color: '#FFF8EF' }}
            >
              Reload
            </button>
            <button
              onClick={this.handleGoHome}
              className="grow rounded-lg py-2 text-sm font-semibold"
              style={{ background: '#244350', color: '#F6F1E8' }}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
