import React from 'react';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      showDetails: process.env.NODE_ENV === 'development'
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    if (typeof window !== 'undefined' && window.showErrorToast) {
      window.showErrorToast(`Something went wrong: ${error.message}`);
    }
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  handleGoBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-space-black to-deep-purple/5 p-4">
          <div className="bg-space-black/90 backdrop-blur-sm border border-deep-purple/20 rounded-2xl p-8 shadow-2xl max-w-2xl w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-flame-red/10 mb-4">
                <XMarkIcon className="h-8 w-8 text-flame-red" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold text-holographic-white mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-holographic-white/80 mb-6">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
              
              <div className="bg-space-black/50 border border-deep-purple/20 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-holographic-white/70 mb-1">Error details:</p>
                <p className="text-sm text-flame-red font-mono">
                  {this.state.error?.message || 'An unknown error occurred'}
                </p>
                
                {this.state.showDetails && this.state.errorInfo?.componentStack && (
                  <div className="mt-3 p-3 bg-black/30 rounded-lg overflow-auto max-h-40">
                    <pre className="text-xs text-holographic-white/60">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
                
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={this.toggleDetails}
                    className="mt-3 text-xs text-tech-blue hover:underline focus:outline-none"
                  >
                    {this.state.showDetails ? 'Hide details' : 'Show details'}
                  </button>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleGoBack}
                  className="px-6 py-2.5 bg-tech-blue/90 hover:bg-tech-blue text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Go Back
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-6 py-2.5 bg-deep-purple/90 hover:bg-deep-purple text-white rounded-lg transition-colors text-center"
                >
                  Try Again
                </button>
                <a
                  href="/"
                  className="px-6 py-2.5 bg-gray-700/90 hover:bg-gray-700 text-white rounded-lg transition-colors text-center"
                >
                  Go to Home
                </a>
              </div>
              
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <strong>Development Mode:</strong> This error is only visible in development.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
