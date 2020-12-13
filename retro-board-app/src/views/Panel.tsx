import React, { useContext } from 'react';
import styled from 'styled-components';
import { Route, Link as RouterLink } from 'react-router-dom';
import { colors, Drawer, Link, Typography } from '@material-ui/core';
import { LanguageContext } from '../translations';
import useGlobalState from '../state';
import LanguagePicker from '../components/LanguagePicker';
import ParticipantsList from './panel/ParticipantsList';
import config from '../utils/getConfig';

interface Policy {
  name: string;
  url: string;
}

const policies: Policy[] = [
  { name: 'Privacy policy', url: '/privacy' },
  { name: 'Terms & Conditions', url: '/terms' },
  { name: 'Disclaimer', url: '/disclaimer' },
  { name: 'Cookies Policy', url: '/cookies' },
  { name: 'Acceptable Use Policy', url: '/acceptable-use' },
];

function Panel() {
  const languageContext = useContext(LanguageContext);
  const { state, togglePanel } = useGlobalState();

  return (
    <Drawer open={state.panelOpen} onClose={togglePanel}>
      <DrawerContent>
        <Top>
          <LanguagePicker
            value={languageContext.language}
            onChange={languageContext.setLanguage}
          />
          <Content>
            <Route path="/game/:gameId" component={ParticipantsList} />
          </Content>
        </Top>
        <Bottom>
          <Typography component="div">
            <Policies>
              <Typography variant="h6">Legal Stuff</Typography>
              {policies.map((policy) => (
                <Link
                  component={RouterLink}
                  to={policy.url}
                  color="inherit"
                  key={policy.name}
                >
                  {policy.name}
                </Link>
              ))}
            </Policies>
          </Typography>
          <Typography
            component="div"
            style={{ color: colors.grey[700], textAlign: 'center' }}
          >
            <Content>Version {config.version}</Content>
          </Typography>
        </Bottom>
      </DrawerContent>
    </Drawer>
  );
}

const Content = styled.div`
  padding: 10px;

  @media screen and (max-width: 600px) {
    padding: 5px;
  }
`;

const Policies = styled.div`
  border-top: 1px solid grey;
  display: flex;
  flex-direction: column;
  margin: -10px;
  padding: 20px 30px 30px 30px;

  a {
    font-size: 0.9em;
    color: grey;
  }
`;

const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
`;

const Top = styled.div`
  flex: 1;
`;
const Bottom = styled.div``;

export default Panel;
