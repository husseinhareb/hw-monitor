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

class PageErrorBoundaryBase extends React.Component<BoundaryBaseProps, BoundaryState> {
  constructor(props: BoundaryBaseProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[PageErrorBoundary] Render error in page:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

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
            flex: 1,
            background: '#2d2d2d',
            color: '#fff',
            gap: '0.75rem',
            padding: '2rem',
          }}
        >
          <p style={{ color: '#d64545', fontSize: '1rem', margin: 0 }}>
            {t('error.render')}
          </p>
          {this.state.error && (
            <pre
              style={{
                background: '#3a3a3a',
                color: '#999',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                maxWidth: '480px',
                width: '100%',
                overflow: 'auto',
                fontSize: '0.7rem',
                margin: 0,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              background: '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.4rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {t('error.retry')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  return <PageErrorBoundaryBase t={t}>{children}</PageErrorBoundaryBase>;
};

export default PageErrorBoundary;
