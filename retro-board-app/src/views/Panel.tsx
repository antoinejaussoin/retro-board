import React, { useContext } from 'react';
import styled from 'styled-components';
import { Route } from 'react-router-dom';
import { Drawer } from '@material-ui/core';
import { LanguageContext } from '../translations';
import useGlobalState from '../state';
import LanguagePicker from '../components/LanguagePicker';
import PlayerList from './panel/PlayerList';
import SummaryModeSwitch from './panel/SummaryModeSwitch';
import ForkMe from './panel/github.png';

function Panel() {
  const languageContext = useContext(LanguageContext);
  const { state, togglePanel } = useGlobalState();

  return (
    <Drawer open={state.panelOpen} onClose={togglePanel}>
      <LanguagePicker
        value={languageContext.language}
        onChange={languageContext.setLanguage}
      />
      <Content>
        <Route path="/game/:gameId" component={SummaryModeSwitch} />
      </Content>
      <Content>
        <Route path="/game/:gameId" component={PlayerList} />
      </Content>

      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/antoinejaussoin/retro-board"
      >
        <ForkMeImage src={ForkMe} />
      </a>
    </Drawer>
  );
}

const Content = styled.div`
  padding: 10px;

  @media screen and (max-width: 600px) {
    padding: 5px;
  }
`;

const ForkMeImage = styled.img`
  object-fit: contain;
  width: 50px;
  margin: 10px;
  position: fixed;
  bottom: 0;
  left: 0;
`;

export default Panel;
