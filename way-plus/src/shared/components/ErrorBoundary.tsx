import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('WAY+ Error:', error, info);
    hapticService.error();
    // Aquí podrías enviar a Sentry/LogRocket
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className={way('flex min-h-dvh items-center justify-center p-6', GLASS.main)}>
            <motion.div
              className={way(GLASS.card, 'max-w-sm text-center')}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="mb-4 text-6xl" role="img" aria-hidden="true">🛠️</div>
              <h2 className={TEXT.title}>¡Ups! Algo salió mal</h2>
              <p className={way(TEXT.subtitle, 'mt-2 mb-6')}>
                No te preocupes, estamos en ello. Puedes intentarlo de nuevo.
              </p>
              <Button variant="primary" onClick={this.handleRetry}>
                Reintentar
              </Button>
            </motion.div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
