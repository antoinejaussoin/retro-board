import React from 'react';
import styled from 'styled-components';
import { CardActions, darken } from '@material-ui/core';
import { MoreHoriz, Close } from '@material-ui/icons';
import useOpenClose from '../../../hooks/useOpenClose';
import ActionButton from './ActionButton';
import ReactCardFlip from 'react-card-flip';
import useTranslations from '../../../translations';
import { trackEvent } from '../../../track';

interface ActionsBar {
  extraActions: React.ReactNode;
  displayExtra: boolean;
  color: string;
}

function trackOpenExtra() {
  trackEvent('game/post/extra-menu/open');
}

const ActionsBar: React.FC<ActionsBar> = ({
  children,
  extraActions,
  displayExtra,
  color,
}) => {
  const [extraMenuOpen, openExtraMenu, closeExtraMenu] = useOpenClose(
    false,
    trackOpenExtra
  );
  const { Post: translations } = useTranslations();

  const darkColor = darken(color, 0.05);

  return (
    <Actions>
      <ReactCardFlip isFlipped={extraMenuOpen} flipDirection="horizontal">
        <ButtonsContainer style={{ backgroundColor: color }}>
          <MainButtons>{children}</MainButtons>

          {displayExtra && (
            <MoreButtonContainer>
              <ActionButton
                icon={<MoreHoriz />}
                onClick={openExtraMenu}
                tooltip={translations.openExtra!}
                ariaLabel={translations.openExtra!}
              />
            </MoreButtonContainer>
          )}
        </ButtonsContainer>
        <ExtraButtonsContainer style={{ backgroundColor: darkColor }}>
          <MainButtons>{extraActions}</MainButtons>
          <MoreButtonContainer>
            <ActionButton
              icon={<Close />}
              onClick={closeExtraMenu}
              tooltip={translations.closeExtra!}
              ariaLabel={translations.closeExtra!}
            />
          </MoreButtonContainer>
        </ExtraButtonsContainer>
      </ReactCardFlip>
    </Actions>
  );
};

const Actions = styled(CardActions)`
  position: relative;
  flex: 1;
  padding: 0 !important;

  > div {
    flex: 1;
    margin: 0;
  }
`;

const Flippable = styled.div`
  display: flex;
  margin: 0;
  padding: 8px;
`;

const ButtonsContainer = styled(Flippable)``;

const MainButtons = styled.div`
  flex: 1;
`;
const MoreButtonContainer = styled.div``;

const ExtraButtonsContainer = styled(Flippable)``;

export default ActionsBar;
