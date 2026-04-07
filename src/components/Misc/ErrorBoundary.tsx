import React from 'react';
import { useTranslation } from 'react-i18next';

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface BoundaryBaseProps {
  children: React.ReactNode;
  t: (key: string) => string;
}

class ErrorBoundaryBase extends React.Component<BoundaryBaseProps, BoundaryState> {
  constructor(props: BoundaryBaseProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: '#1e1e1e',
            color: '#fff',
            gap: '1.25rem',
            padding: '2rem',
          }}
        >
          <h2 style={{ color: '#c0392b', fontSize: '1.4rem', margin: 0 }}>
            {t('error.render')}
          </h2>
          {this.state.error && (
            <pre
              style={{
                background: '#2d2d2d',
                color: '#bbb',
                padding: '1rem',
                borderRadius: '4px',
                maxWidth: '600px',
                width: '100%',
                overflow: 'auto',
                fontSize: '0.75rem',
                margin: 0,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1.75rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            {t('error.reload')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  return <ErrorBoundaryBase t={t}>{children}</ErrorBoundaryBase>;
};

export default ErrorBoundary;
