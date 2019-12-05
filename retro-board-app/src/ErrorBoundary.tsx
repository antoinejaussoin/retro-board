import React from 'react';
import styled from 'styled-components';
import * as Sentry from '@sentry/browser';
import { Typography, Button } from '@material-ui/core';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface ErrorBoundaryState {
  errored: boolean;
}

class ErrorBoundary extends React.Component<
  RouteComponentProps,
  ErrorBoundaryState
> {
  unregisterHistoryListener?: () => void = undefined;

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = { errored: false };
    this.refresh = this.refresh.bind(this);
    this.goBackHome = this.goBackHome.bind(this);
  }

  static getDerivedStateFromError() {
    return { errored: true };
  }

  componentDidMount() {
    this.unregisterHistoryListener = this.props.history.listen(() => {
      this.setState({ errored: false });
    });
  }

  componentWillUnmount() {
    if (this.unregisterHistoryListener) {
      this.unregisterHistoryListener();
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.withScope(scope => {
      scope.setLevel('error' as Sentry.Severity);
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  refresh() {
    window.location.reload();
  }

  goBackHome() {
    this.props.history.push('/');
  }

  render() {
    if (this.state.errored) {
      return (
        <Container>
          <Content>
            <Typography variant="h1">Ooopsie...</Typography>
            <Typography variant="h2">
              Something went badly wrong, we logged the error to try and fix it
              ASAP.
            </Typography>
            <Buttons>
              <Button onClick={this.goBackHome} color="primary">
                Home Page
              </Button>
              <Button onClick={this.refresh} color="secondary">
                Refresh
              </Button>
            </Buttons>
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
  margin-top: 200px;
`;

const Buttons = styled.div`
  margin-top: 40px;
`;
