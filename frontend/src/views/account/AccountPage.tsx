import usePortalUrl from './usePortalUrl';
import Button from '@mui/material/Button';
import { Page } from '../../components/Page';
import useUser from '../../auth/useUser';
import styled from '@emotion/styled';
import ProPill from '../../components/ProPill';
import { Alert } from '@mui/material';
import Section from './Section';
import MembersEditor from './MembersEditor';
import useTranslations from '../../translations';
import { useNavigate } from 'react-router-dom';
import useIsTrial from '../../auth/useIsTrial';
import TrialPrompt from '../home/TrialPrompt';
import useFormatDate from '../../hooks/useFormatDate';
import { DeleteModal } from './delete/DeleteModal';
import useModal from '../../hooks/useModal';

function AccountPage() {
  const url = usePortalUrl();
  const user = useUser();
  const isTrial = useIsTrial();
  const formatDistanceToNow = useFormatDate();
  const navigate = useNavigate();
  const { AccountPage: translations, SubscribePage: subscribeTranslations } =
    useTranslations();
  const [deleteModalOpen, handleDeleteModalOpen, handleDeleteModalClose] =
    useModal();

  const ownsThePlan =
    user &&
    !!user.ownSubscriptionsId &&
    user.ownSubscriptionsId === user.subscriptionsId;
  const onSomebodysPlan =
    user &&
    !!user.subscriptionsId &&
    user.ownSubscriptionsId !== user.subscriptionsId;

  if (!user) {
    return null;
  }

  if (user.accountType === 'anonymous') {
    return <Alert severity="error">{translations.anonymousError}</Alert>;
  }

  return (
    <>
      <TrialPrompt />
      <Page>
        <Name>
          {user.name}&nbsp;
          <ProPill />
        </Name>

        <Section title={translations.details?.header}>
          <Data>
            <Title>{translations.details?.username}</Title>
            <Value>{user.username}</Value>
          </Data>

          <Data>
            <Title>{translations.details?.email}</Title>
            <Value>{user.email}</Value>
          </Data>

          <Data>
            <Title>{translations.details?.accountType}</Title>
            <Value>{user.accountType}</Value>
          </Data>
        </Section>

        {user.plan ? (
          <Section title={translations.plan?.header}>
            <Data>
              <Title>{translations.plan?.plan}</Title>
              <Value>{user.plan}</Value>
            </Data>

            {user.domain ? (
              <Data>
                <Title>{subscribeTranslations.domain.title}</Title>
                <Value>{user.domain}</Value>
              </Data>
            ) : null}
            {onSomebodysPlan && (
              <Alert severity="info">{translations.plan?.youAreMember}</Alert>
            )}
            {ownsThePlan && (
              <Alert severity="info">{translations.plan?.youAreOwner}</Alert>
            )}
          </Section>
        ) : null}

        {ownsThePlan && user && user.plan && user.plan === 'team' ? (
          <Section title={translations.subscription?.membersEditor?.title}>
            <MembersEditor />
          </Section>
        ) : null}

        {ownsThePlan && !isTrial ? (
          <Section title={translations.subscription.header}>
            {url ? (
              <Button
                variant="contained"
                color="secondary"
                href={url}
                style={{ marginTop: 20 }}
              >
                {translations.subscription?.manageButton}
              </Button>
            ) : null}
          </Section>
        ) : null}

        {isTrial ? (
          <Section title={translations.trial.header}>
            <Alert severity="info">
              {translations.trial.yourTrialWillExpireIn!(
                formatDistanceToNow(new Date(user.trial!))
              )}
            </Alert>
            <Button
              variant="contained"
              color="secondary"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/subscribe')}
            >
              {translations.trial.subscribe}
            </Button>
          </Section>
        ) : null}

        <Section title={translations.deleteAccount.title} danger>
          <Alert severity="error">{translations.deleteAccount.warning}</Alert>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteModalOpen}
            style={{ marginTop: 20 }}
          >
            {translations.deleteAccount.deleteData}
          </Button>

          {deleteModalOpen ? (
            <DeleteModal onClose={handleDeleteModalClose} />
          ) : null}
        </Section>
      </Page>
    </>
  );
}

const Name = styled.h1`
  font-weight: 100;
  font-size: 3em;
  @media screen and (max-width: 500px) {
    font-size: 1.5em;
  }
`;

const Data = styled.div`
  display: flex;
  margin: 15px 0;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.3em;
  width: 200px;

  @media screen and (max-width: 600px) {
    font-size: 1em;
  }
`;

const Value = styled.div`
  font-weight: 100;
  font-size: 1.3em;

  @media screen and (max-width: 600px) {
    font-size: 1em;
  }
`;

export default AccountPage;
