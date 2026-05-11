import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Please try again or go back.</p>
          <Link to="/" style={{ color: '#10b981', fontWeight: 600 }}>Go to Home</Link>
        </div>
      );
    }
    return this.props.children;
  }
}
