import React from 'react';
import styled from 'styled-components';
import * as Sentry from '@sentry/browser';
import { Typography, Button } from '@material-ui/core';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps extends RouteComponentProps {}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  unregisterListener?: () => void = undefined;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.refreshPage = this.refreshPage.bind(this);
    this.returnHome = this.returnHome.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidMount() {
    this.unregisterListener = this.props.history.listen(() => {
      this.setState({ hasError: false });
    });
  }

  componentWillUnmount() {
    if (this.unregisterListener) {
      this.unregisterListener();
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.withScope(scope => {
      scope.setLevel('error' as Sentry.Severity);
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  refreshPage() {
    window.location.reload();
  }

  returnHome() {
    this.props.history.push('/');
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Content>
            <Typography variant="h1">Ooopsie...</Typography>
            <Typography variant="h2">
              Something went badly wrong, we logged the error to try and fix it
              ASAP.
            </Typography>
            <Actions>
              <Button onClick={this.returnHome} color="primary">
                Return Home
              </Button>
              <Button onClick={this.refreshPage} color="secondary">
                Refresh Page
              </Button>
            </Actions>
          </Content>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default withRouter(ErrorBoundary);

const Container = styled.div`
  width: 100%;
  position: relative;
  text-align: center;
  margin: 0 auto;
`;

const Content = styled.div`
  margin-top: 330px;
`;

const Actions = styled.div`
  margin-top: 40px;
`;
