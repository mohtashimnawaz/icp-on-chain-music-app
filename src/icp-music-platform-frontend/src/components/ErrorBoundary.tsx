import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#1a0000',
          color: '#ff6b6b',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          margin: '2rem',
          fontFamily: 'monospace'
        }}>
          <h2>🚨 Something went wrong!</h2>
          <p>The application encountered an error and needs to be reloaded.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            <summary>Error Details (Click to expand)</summary>
            <div style={{ marginTop: '1rem', fontSize: '14px' }}>
              <strong>Error Message:</strong><br />
              {this.state.error && this.state.error.toString()}
              <br /><br />
              <strong>Stack Trace:</strong><br />
              {this.state.error && this.state.error.stack}
            </div>
          </details>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginRight: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffd700',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
