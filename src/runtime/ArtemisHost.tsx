import React, { useState, useEffect, useMemo, ComponentType, ReactNode, Component, ErrorInfo } from 'react';
import { extractComponent } from './sandbox';

export interface ArtemisHostProps {
  /** Compiled JavaScript code or raw bundle produced by compile() */
  code: string;
  /** Props forwarded to the dynamic component */
  props?: Record<string, any>;
  /** Scope variables passed to the execution environment (e.g., React, custom libraries) */
  scope?: Record<string, any>;
  /** Fallback UI rendered during component evaluation */
  fallback?: ReactNode;
  /** Custom error handler called when evaluation or rendering fails */
  onError?: (error: Error) => void;
  /** Optional wrapper element className */
  className?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ArtemisErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      return (
        <div style={{ padding: '1rem', border: '1px solid #ef4444', borderRadius: '0.5rem', background: '#fef2f2', color: '#991b1b' }}>
          <strong>Artemis Runtime Error</strong>
          <pre style={{ fontSize: '0.85rem', marginTop: '0.5rem', overflowX: 'auto' }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * ArtemisHost: Renders dynamic, in-memory compiled React components with isolated scope.
 */
export const ArtemisHost: React.FC<ArtemisHostProps> = ({
  code,
  props = {},
  scope = {},
  fallback = null,
  onError,
  className,
}) => {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const activeScope = useMemo(() => ({ React, ...scope }), [scope]);

  useEffect(() => {
    try {
      setError(null);
      const extracted = extractComponent(code, activeScope);
      setComponent(() => extracted);
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
    }
  }, [code, activeScope, onError]);

  if (error) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ef4444', borderRadius: '0.5rem', background: '#fef2f2', color: '#991b1b' }}>
        <strong>Artemis Compilation/Extraction Error</strong>
        <pre style={{ fontSize: '0.85rem', marginTop: '0.5rem', overflowX: 'auto' }}>
          {error.message}
        </pre>
      </div>
    );
  }

  if (!Component) {
    return <>{fallback}</>;
  }

  return (
    <ArtemisErrorBoundary onError={onError}>
      <div className={className}>
        <Component {...props} />
      </div>
    </ArtemisErrorBoundary>
  );
};
