import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                حدث خطأ غير متوقع
              </h1>
              
              <p className="text-gray-600 mb-6">
                نأسف لحدوث هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
              </p>

              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-right">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  الصفحة الرئيسية
                </Button>
              </div>

              <button
                onClick={() => {
                  const supportEmail = 'support@pharmacy.iq';
                  const subject = encodeURIComponent('تقرير خطأ - نظام إدارة الصيدليات');
                  const body = encodeURIComponent(
                    `الخطأ: ${this.state.error?.message}\n\n` +
                    `معلومات إضافية:\n${this.state.errorInfo?.componentStack}`
                  );
                  window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
                }}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                الإبلاغ عن هذا الخطأ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
