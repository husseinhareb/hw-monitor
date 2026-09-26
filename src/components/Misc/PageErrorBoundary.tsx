import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore, type ConfigData } from '../../services/configStore';

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface BoundaryBaseProps {
  children: React.ReactNode;
  t: (key: string) => string;
  config: ConfigData;
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
    const { t, config } = this.props;

    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            background: config.config_background_color,
            color: config.config_text_color,
            gap: '0.75rem',
            padding: '2rem',
          }}
        >
          <p style={{ color: config.config_toast_error_color, fontSize: '1rem', margin: 0 }}>
            {t('error.render')}
          </p>
          {this.state.error && (
            <pre
              style={{
                background: config.config_input_background_color,
                color: config.config_text_color,
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
              background: config.config_toast_error_color,
              color: config.config_background_color,
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
  const config = useConfigStore((state) => state.config);
  return <PageErrorBoundaryBase t={t} config={config}>{children}</PageErrorBoundaryBase>;
};

export default PageErrorBoundary;
