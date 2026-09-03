import React from 'react';
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleResetAndLogin = () => {
    try {
      localStorage.removeItem('pawora_provider_profiles');
      localStorage.removeItem('pawora_token');
      localStorage.removeItem('pawora_user');
    } catch (e) {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAF9F5] font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-sans font-black text-[#0F2E23] tracking-tight">
                Oops! Something went wrong
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                We encountered an unexpected issue rendering this section. Don't worry, your data is safe.
              </p>
              {this.state.error && (
                <div className="text-left bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-mono overflow-auto max-h-32 mt-2">
                  <p className="font-bold">{this.state.error?.toString()}</p>
                  <p className="text-[10px] text-rose-600 mt-1">{this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-[#0F2E23]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw size={15} />
                <span>Reload This Page</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home size={14} />
                  <span>Homepage</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetAndLogin}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Reset & Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
