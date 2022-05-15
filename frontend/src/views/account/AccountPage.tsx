import usePortalUrl from './usePortalUrl';
import Button from '@mui/material/Button';
import { Page } from '../../components/Page';
import useUser from '../../auth/useUser';
import styled from '@emotion/styled';
import ProPill from '../../components/ProPill';
import { Alert } from '@mui/material';
import Section from './Section';
import MembersEditor from './MembersEditor';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useIsTrial from '../../auth/useIsTrial';
import TrialPrompt from '../home/TrialPrompt';
import useFormatDate from '../../hooks/useFormatDate';
import { DeleteModal } from './delete/DeleteModal';
import useModal from '../../hooks/useModal';
import EditableLabel from 'components/EditableLabel';
import { useCallback, useContext } from 'react';
import { updateUserName } from './api';
import UserContext from 'auth/Context';
import { useSnackbar } from 'notistack';
import LanguagePicker from 'components/LanguagePicker';
import { useLanguage } from 'translations';
import useBackendCapabilities from 'global/useBackendCapabilities';

function AccountPage() {
  const url = usePortalUrl();
  const user = useUser();
  const [language, setLanguage] = useLanguage();
  const { setUser } = useContext(UserContext);
  const isTrial = useIsTrial();
  const formatDistanceToNow = useFormatDate();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteModalOpen, handleDeleteModalOpen, handleDeleteModalClose] =
    useModal();
  const capabilities = useBackendCapabilities();

  const handleEditName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed.length) {
        enqueueSnackbar(t('AccountPage.noEmptyNameError'), {
          variant: 'warning',
        });
      } else {
        const updatedUser = await updateUserName(name);
        setUser(updatedUser);
      }
    },
    [setUser, enqueueSnackbar, t]
  );

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
    return <Alert severity="error">{t('AccountPage.anonymousError')}</Alert>;
  }

  return (
    <>
      <TrialPrompt />
      <Page>
        <Name>
          <ProPill />
          &nbsp;
          <EditableLabel value={user.name} onChange={handleEditName} />
        </Name>

        <Section title={t('AccountPage.details.header')}>
          <Data>
            <Title>{t('AccountPage.details.username')}</Title>
            <Value>{user.username}</Value>
          </Data>

          <Data>
            <Title>{t('AccountPage.details.email')}</Title>
            <Value>{user.email}</Value>
          </Data>

          <Data>
            <Title>{t('AccountPage.details.accountType')}</Title>
            <Value>{user.accountType}</Value>
          </Data>

          <Data>
            <Title>{t('AccountPage.details.language')}</Title>
            <Value>
              <LanguagePicker
                value={language.locale}
                onChange={setLanguage}
                variant="standard"
              />
            </Value>
          </Data>
        </Section>

        {capabilities.slackClientId ? (
          <Section title={t('AccountPage.slack.header')}>
            <Alert severity="info" style={{ marginBottom: 20 }}>
              {t('AccountPage.slack.help')}
            </Alert>
            <a
              href={`https://slack.com/oauth/v2/authorize?client_id=${capabilities.slackClientId}&scope=commands&user_scope=`}
            >
              <img
                alt={t('AccountPage.slack.addToSlack')}
                height="40"
                width="139"
                src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
              />
            </a>
          </Section>
        ) : null}

        {user.plan ? (
          <Section title={t('AccountPage.plan.header')}>
            <Data>
              <Title>{t('AccountPage.plan.plan')}</Title>
              <Value>{user.plan}</Value>
            </Data>

            {user.domain ? (
              <Data>
                <Title>{t('SubscribePage.domain.title')}</Title>
                <Value>{user.domain}</Value>
              </Data>
            ) : null}
            {onSomebodysPlan && (
              <Alert severity="info">
                {t('AccountPage.plan.youAreMember')}
              </Alert>
            )}
            {ownsThePlan && (
              <Alert severity="info">{t('AccountPage.plan.youAreOwner')}</Alert>
            )}
          </Section>
        ) : null}

        {ownsThePlan && user && user.plan && user.plan === 'team' ? (
          <Section title={t('AccountPage.subscription.membersEditor.title')}>
            <MembersEditor />
          </Section>
        ) : null}

        {ownsThePlan && !isTrial ? (
          <Section title={t('AccountPage.subscription.header')}>
            {url ? (
              <Button
                variant="contained"
                color="secondary"
                href={url}
                style={{ marginTop: 20 }}
              >
                {t('AccountPage.subscription.manageButton')}
              </Button>
            ) : null}
          </Section>
        ) : null}

        {isTrial ? (
          <Section title={t('AccountPage.trial.header')}>
            <Alert severity="info">
              {t('AccountPage.trial.yourTrialWillExpireIn', {
                date: formatDistanceToNow(new Date(user.trial!)),
              })}
            </Alert>
            <Button
              variant="contained"
              color="secondary"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/subscribe')}
            >
              {t('AccountPage.trial.subscribe')}
            </Button>
          </Section>
        ) : null}

        <Section title={t('AccountPage.deleteAccount.title')} danger>
          <Alert severity="error">
            {t('AccountPage.deleteAccount.warning')}
          </Alert>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteModalOpen}
            style={{ marginTop: 20 }}
            data-cy="delete-account-button"
          >
            {t('AccountPage.deleteAccount.deleteData')}
          </Button>

          <DeleteModal
            open={deleteModalOpen}
            user={user}
            onDelete={handleDeleteModalClose}
            onClose={handleDeleteModalClose}
          />
        </Section>
      </Page>
    </>
  );
}

const Name = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 100;
  font-size: 3em;
  @media screen and (max-width: 500px) {
    font-size: 1.5em;
  }
`;

const Data = styled.div`
  display: flex;
  align-items: center;
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
