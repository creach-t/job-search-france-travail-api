import React from 'react';

/**
 * Error Boundary global. Sans lui, une exception de rendu dans n'importe quel
 * composant (ex. offre au format inattendu) fait tomber toute l'app sur un écran
 * blanc. Ici on affiche un écran de repli sobre avec une action de récupération.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Journalisation (visible en dev ; en prod, remplaçable par un envoi à un
    // service de suivi d'erreurs si besoin).
    console.error('Erreur de rendu interceptée par ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: 'rgb(30, 41, 59)',
          background: 'rgb(248, 250, 252)',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          Une erreur inattendue est survenue
        </h1>
        <p style={{ maxWidth: '28rem', margin: 0, opacity: 0.8 }}>
          L'affichage a rencontré un problème. Vous pouvez réessayer, ou recharger
          la page si le problème persiste.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={this.handleReset}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: 'rgb(37, 99, 235)', color: '#fff', fontWeight: 600 }}
          >
            Réessayer
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid rgb(203, 213, 225)', cursor: 'pointer', background: '#fff', color: 'inherit', fontWeight: 600 }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
