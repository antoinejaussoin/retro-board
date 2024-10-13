import { Component } from 'react';
import * as Sentry from '@sentry/browser';
import ErrorBoundaryContent from 'ErrorBoundaryContent';

interface ErrorBoundaryState {
  errored: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  unregisterHistoryListener?: () => void = undefined;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { errored: false };
    this.handleRouteChange = this.handleRouteChange.bind(this);
  }

  static getDerivedStateFromError() {
    return { errored: true };
  }

  handleRouteChange() {
    this.setState({ errored: false });
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.withScope((scope) => {
      scope.setLevel('error');
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.errored) {
      return <ErrorBoundaryContent onHistoryChange={this.handleRouteChange} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
