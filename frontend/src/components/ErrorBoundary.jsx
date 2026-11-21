import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF6F5] flex items-center justify-center p-6 text-[#3B2A33]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F0DDE2] shadow-xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FCF1F1] text-[#B94A58] flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-[#3B2A33]">
                Application Notice
              </h2>
              <p className="text-sm text-[#7A6670] leading-relaxed">
                An unexpected interface state occurred. Your health records and session data remain safe.
              </p>
              {this.state.error?.message && (
                <p className="text-xs font-mono bg-[#FDF6F5] p-2.5 rounded-xl text-[#B94A58] text-left break-words">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#A25B74] to-[#C47A92] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:from-[#84455C] hover:to-[#A25B74] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              
              <button
                onClick={this.handleReset}
                className="py-3 px-4 rounded-xl bg-[#FDF6F5] text-[#3B2A33] border border-[#F0DDE2] font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-[#F9ECEC] transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Try Recovering</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
