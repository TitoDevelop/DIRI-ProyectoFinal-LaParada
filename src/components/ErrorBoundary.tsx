import React from 'react';
import { log } from '../services/logger';

interface State { error: boolean }
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: false };

  static getDerivedStateFromError(): State { return { error: true }; }
  componentDidCatch(error: Error, details: React.ErrorInfo) {
    log('error', 'Error al dibujar un componente', { error, details });
  }
  render() {
    if (this.state.error) return <div className="failure" role="alert">
      <h2>Algo ha fallado al mostrar la pantalla</h2>
      <p>Puedes recargar la página para volver a intentarlo.</p>
      <button onClick={() => window.location.reload()}>Recargar</button>
    </div>;
    return this.props.children;
  }
}
