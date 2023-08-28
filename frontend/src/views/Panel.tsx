import styled from '@emotion/styled';
import { colors } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { useLanguage } from '../translations';
import LanguagePicker from '../components/LanguagePicker';
import ParticipantsList from './panel/ParticipantsList';
import config from '../utils/getConfig';
import useSidePanel from './panel/useSidePanel';
import { useMatch } from 'react-router-dom';

interface Policy {
  name: string;
  url: string;
}

const policies: Policy[] = [
  { name: 'Privacy policy', url: '/legal/privacy' },
  { name: 'Terms & Conditions', url: '/legal/terms' },
  { name: 'Disclaimer', url: '/legal/disclaimer' },
  { name: 'Cookies Policy', url: '/legal/cookies' },
  { name: 'Acceptable Use Policy', url: '/legal/acceptable-use' },
];

function Panel() {
  const [language, setLanguage] = useLanguage();
  const { opened, toggle } = useSidePanel();
  const hasParticipants = useMatch('/game/:gameId/*');

  return (
    <Drawer open={opened} onClose={toggle} data-cy="side-panel">
      <DrawerContent>
        <Top>
          <LanguagePicker value={language.locale} onChange={setLanguage} />
          <Content>{hasParticipants ? <ParticipantsList /> : null}</Content>
        </Top>
        <Bottom>
          <Typography component="div">
            <Policies>
              <Typography variant="h6">Website</Typography>
              <ExternalLink href={config.MARKETING_ROOT} target="_blank">
                Main Website
              </ExternalLink>
            </Policies>
            <Policies>
              <Typography variant="h6">Documentation</Typography>
              <ExternalLink
                href="https://docs.retrospected.com/docs/self-hosting/quick-start"
                target="_blank"
              >
                Self Hosting
              </ExternalLink>
              <ExternalLink
                href="https://docs.retrospected.com/docs/features/encryption"
                target="_blank"
              >
                Encrypted Sessions
              </ExternalLink>
              <ExternalLink
                href="https://docs.retrospected.com/docs/features/private-sessions"
                target="_blank"
              >
                Private Sessions
              </ExternalLink>
            </Policies>
            <Policies>
              <Typography variant="h6">Legal Stuff</Typography>
              {policies.map((policy) => (
                <ExternalLink
                  href={config.MARKETING_ROOT + policy.url}
                  target="_blank"
                  key={policy.name}
                >
                  {policy.name}
                </ExternalLink>
              ))}
            </Policies>
          </Typography>
          <Typography
            component="div"
            style={{ color: colors.grey[700], textAlign: 'center' }}
          >
            <Content>Version {config.VERSION}</Content>
          </Typography>
        </Bottom>
      </DrawerContent>
    </Drawer>
  );
}

const ExternalLink = styled.a`
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
`;

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
